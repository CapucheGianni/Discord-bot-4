const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const infos = require('../../package.json');

module.exports = {
	data: new SlashCommandBuilder()
	    .setName('ping')
	    .setDescription('Affiche le ping du bot'),
    stats: {
        category: 'Utilitaire',
        usage: '/ping',
    },
	async execute(client, interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const embed = new EmbedBuilder()
            .setTitle("Pinged Successfully 🏓")
            .setDescription(`**Client Latency:** ${client.ws.ping}ms\n**API latency:** ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
            .setFooter({
                text: `Commande effectuée par ${interaction.user.username} | ${client.user.username} V${infos.version}`
            })
            .setTimestamp()
            .setColor(`#ffc800`);
        return interaction.editReply({ 
            content: 'Pinged successfully !',
            embeds: [embed] 
        });
    },
};