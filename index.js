// Ignore unwanted error messages at start of process
require("./utils/logger/ignoreTerminalSpam.js");

const { ShardingManager } = require('discord.js');
const Logger = require('./utils/logger/logger.js');

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const manager = new ShardingManager(path.join(__dirname, 'bot.js'), {
    token: process.env.DISCORD_TOKEN
});

manager.spawn({
    timeout: 30_000,
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

// Log unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(err);
});
