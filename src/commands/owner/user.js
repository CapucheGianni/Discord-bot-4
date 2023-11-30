module.exports = {
    name: "user",
    description: "Liste les utilisateurs de la base de données.",
    permissions: ["OWNER"],
    stats: {
        category: "Owner",
        usage: "user",
        alias: []
    },
    async run(client, command, args) {
        try {
            const userId = args[0] ?? command.author.id;
            const user = await client.prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) return command.react('❌');

            command.reply(`id: ${user.id}\nname: ${user.name}\njokes: ${user.jokes}`);
        } catch (e) {
            command.react('❌');
            throw new Error(e);
        }
    }
};