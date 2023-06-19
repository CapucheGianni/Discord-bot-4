const { SlashCommandBuilder } = require('@discordjs/builders');
const { prefix } = require('../../auth.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Affiche le préfixe du bot'),
    stats: {
        category: 'Utilitaire',
        usage: '/prefix',
    },
    async execute(client, interaction) {
        return interaction.reply({content: `Le préfixe de ${client.user.username} est : **${prefix}**`});
    }
}