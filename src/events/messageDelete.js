const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: Events.MessageDelete,
    async execute(client, message) {
        const embed = new EmbedBuilder();

        if (!message.guild || !message.author) {
            return;
        }
        embed.setTitle("Message supprimé 🗑️")
            .setDescription(`> ${message.content}\n\n<t:${message.createdTimestamp.toString().slice(0, 10)}>`)
            .addFields({
                name: "Auteur",
                value: `${message.author} (${message.author.id})`,
                inline: true
            },
            {
                name: "Salon",
                value: `${message.channel} (${message.channel.id})`,
                inline: true
            },
            {
                name: "Serveur",
                value: `${message.guild} (${message.guild.id})`,
                inline: true
            })
            .setFooter({
                text: `Message supprimé | ${client.user.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setColor(`#ff0000`);
        await client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: [ embed ] });
    }
};