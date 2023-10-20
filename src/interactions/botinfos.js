const { SlashCommandBuilder } = require('@discordjs/builders');
const { interactionsIds } = require('../../settings.json');
const { prisma } = require('../db/main');
const { EmbedBuilder } = require('discord.js');
const { version } = require('../../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("botinfos")
        .setDescription("Affiche les informations principales du bot."),
    stats: {
        category: "Utilitaire",
        permissions: [],
        id: interactionsIds.botinfos
    },
    async execute(client, interaction) {
        try {
            const { startTimestamp } = await prisma.bot.findUnique({ where: { id: process.env.CLIENT_ID } });
            const user = await interaction.user.fetch();
            const embed = new EmbedBuilder();

            embed.setTitle("Bot informations")
                .addFields(
                    { name: "Uptime", value: `The bot has been up since <t:${new Date(startTimestamp).getTime().toString().slice(0, 10)}:R>`, inline: true },
                    { name: "Start date", value: new Date(startTimestamp).toLocaleString(), inline: true },
                    { name: "Ram usage", value: `L'utilisation de la RAM est actuellement de ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100}MB.` },
                    { name: "Ping", value: `${client.ws.ping}ms`, inline: true },
                    { name: "Version", value: `v${version}`, inline: true },
                    { name: "Node.js version", value: process.version, inline: true}
                )
                .setImage(client.user.displayAvatarURL({ dynamic: true }))
                .setColor(user.hexAccentColor || "#000")
                .setFooter({
                    text: `ID: ${interaction.user.id} | ${client.user.username}`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();
            interaction.reply({ embeds: [ embed ] });
        } catch (e) {
            throw new Error(e);
        }
    }
};