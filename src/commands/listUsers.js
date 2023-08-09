const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
    name: "lusers",
    description: "Liste les utilisateurs de la base de données.",
    permissions: [ "OWNER" ],
    stats: {
        category: "Owner",
        usage: "lusers"
    },
    async run(client, command) {
        try {
            const users = await prisma.user.findMany();
            command.reply(`Voici la liste des utilisateurs de la base de données : \n\n${users.map((user) => `- ${user.name} (${user.id})`).join("\n")}`);
        } catch (e) {
            throw new Error(e);
        }
    }
};