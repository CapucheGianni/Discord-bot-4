const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const infos = require('../../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des intéractions disponibles')
        .addStringOption(option => option.setName('commande').setDescription('La commande à afficher')),
    async execute(client, interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Liste des commandes 📚')
            .setURL('https://canary.discord.com/https://www.youtube.com/watch?v=dQw4w9WgXcQ/777863908932845588/835895027314065489')
            .setDescription(`Voici la liste des intéractions disponibles :\n\n${client.interactions.map(command => {
                return `\`${command.data.name}\`: ${command.data.description}`
            }).join('\n')}`)
            .setFooter({
               text: `Commande effectuée par ${interaction.user.username} | ${client.user.username} V${infos.version}`
            })
            .setTimestamp()
            .setColor(`#ffc800`);
        await interaction.reply({ 
            embeds: [embed] 
        });
    }
};