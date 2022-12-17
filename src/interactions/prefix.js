const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Affiche le préfixe du bot'),
    async execute(client, interaction) {
        const infos = require('../../auth.json');
        return interaction.reply({content: `Le préfixe de ${client.user.tag} est : **${infos.prefix}**`});
    }
}