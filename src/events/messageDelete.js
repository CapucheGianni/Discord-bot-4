const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: Events.MessageDelete,
    async execute(client, message) {
        const embed = new EmbedBuilder();
        const interactionEmbed = new EmbedBuilder();
        const channel = client.channels.cache.get(process.env.LOG_CHANNEL_ID);

        if (!message.guild || !message.author) return;
        embed.setTitle("Message supprimé 🗑️")
            .addFields({
                name: "Date d'envoi",
                value: `<t:${message.createdTimestamp.toString().slice(0, 10)}> (<t:${message.createdTimestamp.toString().slice(0, 10)}:R>)`
            },
            {
                name: "Auteur",
                value: `${message.author} (${message.author.id})`,
                inline: true
            },
            {
                name: "Salon",
                value: `${message.channel} (${message.channelId})`,
                inline: true
            },
            {
                name: "Serveur",
                value: `${message.guild} (${message.guildId})`,
                inline: true
            })
            .setColor(`#ff0000`);
        if (message.content) embed.setDescription(message.content);
        if (message.embeds.length && !message.content) embed.setDescription(message.embeds[0].description);
        if (message.attachments.size) {
            embed.addFields({
                name: "Fichiers",
                value: message.attachments.map((attachment) => `([URL](${attachment.url})) \`${attachment.name}\``).join(',\n')
            });
        }
        if (message.interaction) {
            interactionEmbed.addFields({
                    name: "Intéraction",
                    value: `${message.interaction.commandName} (${message.interaction.id})`,
                    inline: true
                },
                {
                    name: "Auteur",
                    value: `${message.interaction.user} (${message.interaction.user.id})`,
                    inline: true
                })
                .setFooter({
                    text: `Message supprimé | ${client.user.username}`,
                    iconURL: message.interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setColor(`#ff0000`)
                .setTimestamp();
        } else {
            embed.setFooter({
                text: `Message supprimé | ${client.user.username}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();
        }
        await channel.send({ embeds: [embed] });
        if (message.interaction) await channel.send({ embeds: [interactionEmbed] });
    }
};