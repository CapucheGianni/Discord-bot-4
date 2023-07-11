const { SlashCommandBuilder } = require('@discordjs/builders');
const { getPrefix, setPrefix } = require('../utils/setPrefix.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Affiche le préfixe du bot')
        .addStringOption(option => option.setName("prefix").setDescription("Le nouveau préfixe du bot")),
    stats: {
        category: 'Utilitaire',
        usage: '/prefix',
        permissions: []
    },
    async execute(client, interaction) {
        const newPrefix = interaction.options.getString("prefix");

        if (newPrefix) {
            if (!interaction.member.permissions.has("ManageGuild")) {
                return interaction.reply({
                    content: "Vous n'avez pas les permissions nécessaires pour modifier le préfixe !",
                    ephemeral: true
                });
            }
            if (newPrefix.length > 3) {
                return interaction.reply({
                    content: "Le préfixe ne peut pas dépasser 3 caractères !",
                    ephemeral: true
                });
            }
            setPrefix(newPrefix);
            return interaction.reply({
                content: `Le préfixe de ${client.user.username} est maintenant \`${getPrefix()}\``
            });
        } else {
            return interaction.reply({
                content: `Le préfixe de ${client.user.username} est : \`${getPrefix()}\``
            });
        }
    }
};