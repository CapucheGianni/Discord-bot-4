const { Events } = require('discord.js');
const mongoose = require('mongoose');
const { mongoUI } = require('../../auth.json');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`${client.user.tag} is online !\nThe bot is available on ${client.guilds.cache.size} servers with ${client.users.cache.size} users.`);

        mongoose.set("strictQuery", true);
        mongoose.connect(mongoUI, {
            keepAlive: true,
        });
    },
};