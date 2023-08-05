const { getPrefix, setPrefix } = require("../utils/setPrefix.js");

module.exports = {
    name: "prefix",
    description: "Affiche le préfixe du bot",
    permissions: [],
    stats: {
        category: "Utilitaire",
        usage: "prefix"
    },
    async run(client, command, args) {
        const newPrefix = args[0];
        const prefix = await getPrefix(command.guildId);

        if (newPrefix) {
            if (!command.member.permissions.has("ManageGuild")) {
                return command.reply({
                    content: "Vous n'avez pas les permissions nécessaires pour modifier le préfixe !"
                });
            }
            if (newPrefix.length > 3) {
                return command.reply({
                    content: "Le préfixe ne peut pas dépasser 3 caractères !"
                });
            }
            await setPrefix(command.guildId, newPrefix);
            return command.reply({
                content: `Le préfixe de ${client.user.username} est maintenant \`${newPrefix}\``
            });
        } else {
            return command.reply({
                content: `Le préfixe de ${client.user.username} est : \`${prefix}\``
            });
        }
    },
};