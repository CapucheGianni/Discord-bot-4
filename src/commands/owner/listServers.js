const { prisma } = require('../../db/main.js');

module.exports = {
    name: "listservers",
    description: "Liste les serveurs de la base de données.",
    permissions: ['OWNER'],
    stats: {
        category: "Owner",
        usage: "lservers",
        alias: ['ls']
    },
    async run(client, command) {
        try {
            const servers = await prisma.server.findMany();
            command.reply(`Voici la liste des utilisateurs de la base de données : \n\n${servers.sort((a, b) => {
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                return 0;
            }).map((server) => `- ${server.name} (${server.id})`).join("\n")}`);
        } catch (e) {
            throw new Error(e);
        }
    }
};