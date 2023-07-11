const deployInteractions = require('../deployInteractions.js');
require('dotenv').config();

module.exports = {
    name: "reloadinteractions",
    description: "Recharge les interactions",
    permissions: ["OWNER"],
    stats: {
        category: "Utilitaire",
        usage: "reloadInteractions"
    },
    async run(client, command, args) {
        try {
            deployInteractions();
            command.reply("Interactions rechargées !");
        } catch (err) {
            console.error(err);
            command.reply("Une erreur est survenue lors du rechargement des interactions !");
        }
    }
};