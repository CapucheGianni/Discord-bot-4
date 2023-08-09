const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
    name: "lservers",
    description: "Liste les serveurs de la base de données.",
    permissions: [ "OWNER" ],
    stats: {
        category: "Utilitaire",
        usage: "lservers"
    },
    async run(client, command) {
        try {
            const servers = await prisma.server.findMany();
            command.reply(`Voici la liste des utilisateurs de la base de données : \n\n${servers.map((server) => `- ${server.name} (${server.id})`).join("\n")}`);
        } catch (e) {
            throw new Error(e);
        }
    }
};