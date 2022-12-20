module.exports = {
    name: "prefix",
    description: "Affiche le préfixe du bot",
    stats: {
        category: "Utilitaire",
        usage: "*prefix"
    },
    async run(client, command) {
        const infos = require("../../auth.json");
        return command.reply({ content: `Le préfixe de ${client.user.tag} est : **${infos.prefix}**` });
    },
};