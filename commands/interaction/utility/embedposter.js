const Builders = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');

module.exports = {
	name: "embedposter",
	enabled: true,
	ownerOnly: false,
	guildOnly: true,
	shortDescription: "Posts a set of embeds from a Markdown file.",
	longDescription: "Posts a set of embeds from a Markdown file, which can be used to create a set of rules or a server introduction.",
	arguments: [{
		"name": "file",
		"description": "The relative path of the Markdown file to post.",
		"type": "string",
		"required": true
	}, {
		"name": "channel",
		"description": "The channel to post the embeds in.",
		"type": "channel",
		"required": true
	}],
	botPermissions: [
		"SEND_MESSAGES",
		"EMBED_LINKS",
		"MANAGE_GUILD"
	],
	userPermissions: [
		"MANAGE_GUILD",
		"USE_APPLICATION_COMMANDS"
	],
	cooldown: 5_000,
	execute: async function (interaction, client, args) {
		await interaction.deferReply();

		// Get the file path
		args.file = interaction.options.getString("file");
		if (!args.file.startsWith("./")) args.file = "./" + args.file;
		if (!args.file.endsWith(".md")) args.file += ".md";

		// Check if the file exists
		if (!fs.existsSync(args.file)) {
			return interaction.editReply({
				embeds: [
					new Builders.EmbedBuilder()
						.setTitle("File not found")
						.setDescription("The file `" + args.file + "` does not exist.")
						.setColor(0xdab1ff)
						.setTimestamp()
				]
			});
		}

		// Read the file
		let file = fs.readFileSync(args.file, "utf8");

		// Split by "-----" to split into global settings and embeds
		let split = file.split("-----");

		// Parse the global settings
		let globalSettings = split[0].split("\n");
		let globalSettingsParsed = {};
		for (let i = 0; i < globalSettings.length; i++) {
			let setting = globalSettings[i].split(":");
			if (setting.length != 2) continue;
			globalSettingsParsed[setting[0].trim()] = setting[1].trim();
		}

		// Parse the embeds. Split by "---" to split into individual embeds
		let embeds = split[1].split("---");
		let embedsParsed = [];
		let imgs = [];
		for (let i = 0; i < embeds.length; i++) {
			// Split the embed into lines
			let embed = embeds[i].split("\n");

			let titleFound = false;
			let descriptionFound = false;
			let inField = false;
			let imageFound = false;

			// Parse the embed
			let embedParsed = new Builders.EmbedBuilder();
			embedParsed.setColor(0xdab1ff);
			embedParsed.setDescription("\u200b");
			embedParsed.data.fields = [];
			for (let j = 0; j < embed.length; j++) {
				// If starts with ##, its a title
				if (embed[j].startsWith("##") && !titleFound) {
					embedParsed.setTitle(embed[j].substring(2).trim());
					titleFound = true;
				}
				// If starts with ###, its the name of a field
				else if (embed[j].startsWith("###")) {
					descriptionFound = true;
					embedParsed.addFields({
						name: embed[j].substring(3).trim(),
						value: "\u200b",
						inline: false
					});
				}
				// Otherwise, its a description or field value
				else {
					// If line starts with img:, its an image for the embed. format: img:relative/path/to/image
					if (embed[j].startsWith("img:")) {
						embedParsed.setImage("attachment://image.png");
						imgs.push(embed[j].substring(4).trim());
						imageFound = true;
					} else {
						if (!descriptionFound) {
							embedParsed.setDescription(embed[j].trim() + "\n");
						} else {
							let fields = embedParsed.data.fields;
							fields[fields.length - 1].value += embed[j].trim() + "\n";
							embedParsed.data.fields = fields;
						}
					}
				}
			}

			// If no image was found, push null to the array
			if (!imageFound) imgs.push(null);

			embedsParsed.push(embedParsed);
		}

		// Add embed stating that last updated at
		embedsParsed.push(new Builders.EmbedBuilder()
			.setTitle("Last updated at")
			.setDescription("<t:" + Math.floor(Date.now() / 1000) + ":F>")
			.setColor(0xdab1ff));
		imgs.push(null);

		// Post the embeds, and if there are images, post them too
		let channel = interaction.options.getChannel("channel");

		// Attempt to delete all messages in the channel using bulk delete
		let messages = await channel.messages.fetch({
			limit: 100
		});

		await channel.bulkDelete(100);

		// Post the embeds
		for (let i = 0; i < embedsParsed.length; i++) {
			console.log("Posting embed " + i);
			if (imgs[i] !== null) {
				// Make sure to use cwd
				let att = new Discord.AttachmentBuilder(path.join(process.cwd(), imgs[i]))
					.setName("image.png")
				await channel.send({
					embeds: [embedsParsed[i]],
					files: [att]
				});
			} else {
				await channel.send({
					embeds: [embedsParsed[i]]
				});
			}
		}

		// Edit the reply to say that the embeds were posted
		interaction.editReply({
			embeds: [
				new Builders.EmbedBuilder()
					.setTitle("Embeds posted")
					.setDescription("The embeds were posted in <#" + channel.id + ">.")
					.setColor(0xdab1ff)
					.setTimestamp()
			]
		});
	}
}
