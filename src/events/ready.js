const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`${client.user.tag} is online !\nThe bot is available on ${client.guilds.cache.size} servers.`);
    }
};