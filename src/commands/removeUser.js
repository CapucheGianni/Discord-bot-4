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
            console.error("Erreur lors de l'exécution de la commande rmuser.");
            command.reply("Une erreur est survenue lors de la suppression de l'utilisateur !");
        }
    }
};