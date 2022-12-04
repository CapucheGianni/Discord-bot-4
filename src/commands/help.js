const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const infos = require('../../package.json');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche la liste des commandes disponibles')
    .addStringOption(option => option.setName('commande').setDescription('La commande à afficher')),
    async execute(client, interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Liste des commandes 📚')
            .setURL('https://canary.discord.com/channels/777863908932845588/835895027314065489')
            .setDescription(`Voici la liste des commandes disponibles :\n\n${client.commands.map(command => {
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