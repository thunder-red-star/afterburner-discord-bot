const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const path = require("path");

function numberToEnglish (n) {
	// Add "th", "st", "nd", "rd" to the end of a number
	if (n % 100 >= 11 && n % 100 <= 13) {
		return n + "th";
	}
	switch (n % 10) {
		case 1: return n + "st";
		case 2: return n + "nd";
		case 3: return n + "rd";
		default: return n + "th";
	}
}

module.exports = async function guildMemberAdd (client, member) {
	// Check if the guild is main server using global.config.mainGuildId
	if (member.guild.id !== global.config.mainGuildId) {
		return;
	}

	// Get the channel from the config (using global.config.welcomeChannelId)
	let channel = member.guild.channels.cache.get(global.config.welcomeChannelId);

	// If the channel is not found, fetch it
	if (!channel) {
		channel = await member.guild.channels.fetch(global.config.welcomeChannelId);
	}

	// If the channel is still not found, return
	if (!channel) {
		console.log("Welcome channel not found");
		return;
	}

	let welcomeEmbed = new Builders.EmbedBuilder()
		.setColor(global.config.colors.default)
		.setTitle(`Welcome to ${member.guild.name}!`)
		.setDescription(`Welcome to the official ${member.guild.name} Discord server, ${member}! You are the ${numberToEnglish(member.guild.memberCount)} member to join!\n\nPlease read the rules in <#${global.config.rulesChannelId}> and verify yourself in <#${global.config.verifyChannelId}>. After, you can pick up roles in <#${global.config.rolesChannelId}>. Have fun!`)
		.setImage("attachment://image.png")

	let att = new Discord.AttachmentBuilder(path.join(process.cwd(), 'assets/afterburner-hello.png'))
		.setName("image.png")

	// Send the welcome message
	await channel.send({
		embeds: [welcomeEmbed],
		files: [att]
	})
}