module.exports = {
    name: "prefix",
    description: "Affiche le préfixe du bot",
    stats: {
        category: "Utilitaire",
        usage: "prefix"
    },
    async run(client, command, args) {
        const { getPrefix, setPrefix } = require("../setPrefix.js");
        const newPrefix = args[0];

        if (newPrefix) {
            if (newPrefix.length > 3) {
                return command.reply({
                    content: "Le préfixe ne peut pas dépasser 3 caractères !"
                });
            }
            setPrefix(newPrefix);
            return command.reply({
                content: `Le préfixe de ${client.user.username} est maintenant \`${getPrefix()}\``
            });
        } else {
            return command.reply({
                content: `Le préfixe de ${client.user.username} est : \`${getPrefix()}\``
            });
        }
    },
};