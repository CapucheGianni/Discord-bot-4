const deployInteractions = require('../deployInteractions.js');
require('dotenv').config();

module.exports = {
    name: "reloadinteractions",
    description: "Recharge les interactions",
    permissions: [ "OWNER" ],
    stats: {
        category: "Utilitaire",
        usage: "reloadInteractions"
    },
    run(client, command) {
        try {
            deployInteractions();
            command.reply("Interactions rechargées !");
        } catch (err) {
            console.error(err);
            command.reply("Une erreur est survenue lors du rechargement des interactions !");
        }
    }
};