const { prisma } = require('../db/main');
const { EmbedBuilder } = require('discord.js');
const { version } = require('../../package.json');

module.exports = {
    name: "botinfos",
    description: "Affiche les informations principales du bot.",
    permissions: [],
    stats: {
        category: "Utilitaire",
        usage: "botinfos"
    },
    async run(client, command, args) {
        try {
            const { startTimestamp } = await prisma.bot.findUnique({ where: { id: process.env.CLIENT_ID } });
            const user = await command.author.fetch();
            const embed = new EmbedBuilder();

            embed.setTitle("Bot informations")
                .addFields(
                    { name: "Uptime", value: `The bot is up since <t:${new Date(startTimestamp).getTime().toString().slice(0, 10)}:R>`, inline: true },
                    { name: "Start date", value: new Date(startTimestamp).toLocaleString(), inline: true },
                    { name: "Ram usage", value: `L'utilisation de la RAM est actuellement de ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100}MB.` },
                    { name: "Ping", value: `${client.ws.ping}ms`, inline: true },
                    { name: "Version", value: `v${version}`, inline: true },
                    { name: "Node.js version", value: process.version, inline: true}
                )
                .setImage(client.user.displayAvatarURL({ dynamic: true }))
                .setColor(user.hexAccentColor || "#000")
                .setFooter({
                    text: `Commande effectuée par ${command.author.username} | ${client.user.username} ${version}`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();
            command.reply({ embeds: [ embed ] });
        } catch (e) {
            throw new Error(e);
        }
    }
};