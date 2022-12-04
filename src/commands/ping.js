const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const version = require('../../package.json');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Affiche le ping du bot'),
	async execute(client, interaction) {
        const embed = new EmbedBuilder()
            .setTitle("Pinged Successfully 🏓")
            .setDescription(`Client Latency: ${client.ws.ping}ms`)
            .setFooter({
                text: `Commande effectuée par ${interaction.user.username} | ${client.user.username} V${version.version}`
            })
            .setTimestamp()
            .setColor(`#ffc800`);
        return interaction.reply({ embeds: [embed] });
    },
};