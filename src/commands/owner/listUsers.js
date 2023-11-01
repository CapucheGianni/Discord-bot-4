const { prisma } = require('../../db/main.js');

module.exports = {
    name: "listusers",
    description: "Liste les utilisateurs de la base de données.",
    permissions: ["OWNER"],
    stats: {
        category: "Owner",
        usage: "lusers",
        alias: ['lu']
    },
    async run(client, command) {
        try {
            const users = await prisma.user.findMany();
            command.reply(`Voici la liste des utilisateurs de la base de données : \n\n${users.sort((a, b) => {
                if (a.name > b.name) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }
                return 0;
            }).map((user) => `- ${user.name} (${user.id})`).join("\n")}`);
        } catch (e) {
            throw new Error(e);
        }
    }
};