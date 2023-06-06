const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const deploy = require('../utils/slashcommands/deploy');
const mcs = require('node-mcstatus');
const path = require("path");

function statusToPlayerCount (status) {
	// Get the player count from the status
	if (!status.players) {
		return "N/A";
	} else {
		return `${status.players.online}/${status.players.max}`;
	}
}

module.exports = async function ready(client) {
	global.logger.info(`[${client.shard.ids[0] + 1}] Shard is ready`);
	global.logger.info(`[${client.shard.ids[0] + 1}] Logged in as ${client.user.tag}`);

	client.user.setPresence({
		activities: [
			{
				name: 'tickets in Afterburner',
				type: Discord.ActivityType.Listening,
			},
			{
				name: 'the Afterburner Network Community',
				type: Discord.ActivityType.Watching,
			},
		],
		status: 'online',
	});

	deploy.deployGuild(client, global.config.mainGuildId);

	let channel = await client.channels.fetch(global.config.statusChannelId);

	let messageContent = "Server status for Afterburner Network";

	// Now every minute, we will check the statuses of the servers
	let configMCS = global.config.mcs;
	setInterval(async () => {
		let mainStatus = await mcs.statusJava(configMCS.main.host, configMCS.main.port);
		let individualStatuses = [];
		let otherStatuses = [];
		for (let i = 0; i < configMCS.servers.length; i++) {
			let server = configMCS.servers[i];
			let status = await mcs.statusJava(server.host, server.port);
			individualStatuses.push({
				name: server.name,
				status: status,
			});
		}
		for (let i = 0; i < configMCS.other.length; i++) {
			let server = configMCS.other[i];
			let status = await mcs.statusJava(server.host, server.port);
			otherStatuses.push({
				name: server.name,
				status: status,
			});
		}

		let offlineEmoji = "<a:offline:1115420644532813875>";
		let onlineEmoji = "<a:online:1115420645908562022>";

		// Search for a message in the channel that has the same content as the messageContent variable, and delete it
		let messages = await channel.messages.fetch();
		let message = messages.find(m => m.content === messageContent);
		if (message) {
			await message.delete();
		}

		let description = ("Main Server (`play.afterburnermc.network`): " + (mainStatus.online ? (onlineEmoji + " " + statusToPlayerCount(mainStatus)) : offlineEmoji) + "\n\n"
			+ "**Individual Servers:**\n"
			+ individualStatuses.map(s => `${s.name}: ${s.status.online ? (onlineEmoji + " " + statusToPlayerCount(s.status)) : offlineEmoji}`).join('\n')
			+ "\n\n"
			+ "**Other Servers:**\n"
			+ otherStatuses.map(s => `${s.name}: ${s.status.online ? (onlineEmoji + " " + statusToPlayerCount(s.status)) : offlineEmoji}`).join('\n')
			+ "\n\n"
			+ "Last updated: <t:" + Math.floor(Date.now() / 1000) + ":R>");

		let embed = new Builders.EmbedBuilder()
			.setTitle('Server Status')
			.setColor(global.config.colors.default)
			.setDescription(description)
			.setImage("attachment://image.png")

		let att = new Discord.AttachmentBuilder(path.join(process.cwd(), 'assets/afterburner-status.png'))
			.setName("image.png")

		await channel.send({
			content: messageContent,
			embeds: [embed],
			files: [att]
		});

	}, 60_000);
}
