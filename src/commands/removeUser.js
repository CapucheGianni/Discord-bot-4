const { prisma } = require('../db/main.js');

module.exports = {
    name: "rmuser",
    description: "Retire un utilisateur de la base de données.",
    permissions: [ "OWNER" ],
    stats: {
        category: "Owner",
        usage: "rmuser [userid]",
        alias: ['ru']
    },
    async run(client, command, args) {
        try {
            await prisma.user.delete({ where: { id: args[0] } });
            command.react("✅");
        } catch (e) {
            command.react("❌");
            throw new Error(e);
        }
    }
};