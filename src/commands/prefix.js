module.exports = {
    name: "prefix",
    description: "Affiche le préfixe du bot",
    stats: {
        category: "Utilitaire",
        usage: "*prefix"
    },
    async run(client, command) {
        const prefix = require("../setPrefix.js");

        return command.reply({ content: `Le préfixe de ${client.user.username} est : **${prefix}**` });
    },
};