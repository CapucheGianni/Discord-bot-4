const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
    name: "lserver",
    description: "Liste les serveurs de la base de données.",
    permissions: ["OWNER"],
    stats: {
        category: "Utilitaire",
        usage: "lserver",
    },
    async run(client, command, args) {
        try {
            const servers = await prisma.server.findMany();
            command.reply(`Voici la liste des utilisateurs de la base de données : \n\n${servers.map(server => `- ${server.name} (${server.id})`).join("\n")}`);
        } catch (e) {
            console.error(e);
            command.reply("Une erreur est survenue lors de l'affichage des utilisateurs !");
        };
    }
};