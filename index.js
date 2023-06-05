const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const client = new Discord.Client({
	intents: new Discord.IntentsBitField(131071),
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});