const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
    name: "luser",
    description: "Liste les utilisateurs de la base de données.",
    permissions: ["OWNER"],
    stats: {
        category: "Utilitaire",
        usage: "luser",
    },
    async run(client, command, args) {
        try {
            const users = await prisma.user.findMany();
            command.reply(`Voici la liste des utilisateurs de la base de données : \n\n${users.map(user => `- ${user.name} (${user.id})`).join("\n")}`);
        } catch (e) {
            console.error(e);
            command.reply("Une erreur est survenue lors de l'affichage des utilisateurs !");
        };
    }
};