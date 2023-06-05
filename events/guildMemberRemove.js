const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const path = require("path");

module.exports = async function guildMemberRemove (client, member) {

	// Check if the guild is main server using global.config.mainGuildId
	if (member.guild.id !== global.config.mainGuildId) {
		return;
	}

	// Get the channel from the config (using global.config.welcomeChannelId)
	let channel = member.guild.channels.cache.get(global.config.goodbyeChannelId);

	// If the channel is not found, fetch it
	if (!channel) {
		channel = await member.guild.channels.fetch(global.config.goodbyeChannelId);
	}

	// If the channel is still not found, return
	if (!channel) {
		console.log("Goodbye channel not found");
		return;
	}

	let welcomeEmbed = new Builders.EmbedBuilder()
		.setColor(global.config.colors.default)
		.setTitle(`Goodbye!`)
		.setDescription(`Thanks for being a part of the Official ${member.guild.name} Discord server, ${member}! We hope to see you again soon!\n\nWe currently have ${member.guild.memberCount} members.`)
		.setImage("attachment://image.png")

	let att = new Discord.AttachmentBuilder(path.join(process.cwd(), 'assets/afterburner-bye.png'))
		.setName("image.png")

	// Send the welcome message
	await channel.send({
		embeds: [welcomeEmbed],
		files: [att]
	})
}