const { Events, EmbedBuilder } = require('discord.js');
const { dbConnect } = require('../db/main.js');
const fetchServer = require('../db/fetchServer.js');
const getTwitchStream = require('../utils/twitchStream.js');
require('dotenv').config();

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        try {
            const embed = new EmbedBuilder();

            getTwitchStream(client);
            fetchServer(client);
            embed.setTitle('Bot is online !')
                .setDescription(`The bot is available on ${client.guilds.cache.size} servers with approximatively ${client.users.cache.size} members.\n\nThe RAM usage is currently at ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100}MB.`)
                .setColor(`#00ff00`)
                .setTimestamp();
            client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: [ embed ] });
            dbConnect(client);
            console.log(`${client.user.tag} is online !\nThe bot is available on ${client.guilds.cache.size} servers with approximatively ${client.users.cache.size} members.`);
        } catch (e) {
            const embed = new EmbedBuilder()
                .setTitle('An error occured while sending the ready message.')
                .setDescription(`\`\`\`js\n${e}\n\`\`\``)
                .setColor(`#ff0000`)
                .setTimestamp();

            client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: [ embed ] });
            console.error("An error occured while sending the ready message.");
        }
    }
};