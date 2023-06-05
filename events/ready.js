const Discord = require('discord.js');
const deploy = require('../utils/slashcommands/deploy');

module.exports = async function ready (client) {
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
}
