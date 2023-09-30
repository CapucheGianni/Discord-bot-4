const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { version } = require('../../package.json');
const { interactionsIds } = require('../../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Affiche le ping du bot"),
    stats: {
        category: "Utilitaire",
        permissions: [],
        id: interactionsIds.ping
    },
    async execute(client, interaction) {
        try {
            const sent = await interaction.reply({
                content: "Pinging...",
                fetchReply: true
            });
            const embed = new EmbedBuilder()
                .setTitle("Pinged Successfully 🏓")
                .setDescription(`**Client Latency:** ${client.ws.ping}ms\n**API latency:** ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
                .setFooter({
                    text: `Commande effectuée par ${interaction.user.username} | ${client.user.username} V${version}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp()
                .setColor(`#ffc800`);

            return interaction.editReply({
                content: "Pinged successfully !",
                embeds: [ embed ]
            });
        } catch (e) {
            throw new Error(e);
        }
    }
};