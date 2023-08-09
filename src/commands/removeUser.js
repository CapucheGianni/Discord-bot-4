const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
    name: "rmuser",
    description: "Retire un utilisateur de la base de données.",
    permissions: [ "OWNER" ],
    stats: {
        category: "Utilitaire",
        usage: "rmuser [userid]"
    },
    async run(client, command, args) {
        try {
            const user = await prisma.user.delete({
                where: {
                    id: args[ 0 ]
                }
            });
            command.reply(`L'utilisateur ${user.name} a été retiré de la base de données !`);
        } catch (e) {
            if (e.code === "P2025") {
                return command.reply("Merci de spécifier l'id d'un utilisateur présent dans la db.");
            }
            throw new Error(e);
        }
    }
};