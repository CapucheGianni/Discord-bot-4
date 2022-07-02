const { SlashCommandBuilder } = require('@discordjs/builders');
const { execute } = require('./ping');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles'),
        async execute(client, interaction) {
            const embed = new client.methods.MessageEmbed()
                .setTitle("Liste des commandes 📚")
                .setDescription(`Voici la liste des commandes disponibles :\n\n${client.commands.map(command => {
                    return `**${command.data.name}** : ${command.data.description}`;
                }).join('\n')}`)
                .setColor(`#ffc800`);
            return interaction.reply({ embeds: [embed] });
        }
};