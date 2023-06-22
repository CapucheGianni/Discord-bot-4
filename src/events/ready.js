const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        try {
            const embed = new EmbedBuilder()
                .setTitle('Bot is online !')
                .setDescription(`The bot is available on ${client.guilds.cache.size} servers.`)
                .setColor(`#00ff00`)
                .setTimestamp();

            client.channels.cache.get('1121226924082077747').send({
                embeds: [embed]
            });
            console.log(`${client.user.tag} is online !\nThe bot is available on ${client.guilds.cache.size} servers.`);
        } catch (err) {
            const embed = new EmbedBuilder()
                .setTitle('An error occured while sending the ready message.')
                .setDescription(`\`\`\`js\n${err}\n\`\`\``)
                .setColor(`#ff0000`)
                .setTimestamp();

            client.channels.cache.get('1121226924082077747').send({
                embeds: [embed]
            });
            console.error("An error occured while sending the ready message.");
        }
    }
};