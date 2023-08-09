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
        } catch (e) {
            throw new Error(e);
        }
    }
};