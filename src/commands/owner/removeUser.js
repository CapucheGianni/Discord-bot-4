module.exports = {
    name: "removeuser",
    description: "Retire un utilisateur de la base de données.",
    permissions: ["OWNER"],
    stats: {
        category: "Owner",
        usage: "rmuser [userid]",
        alias: ['ru']
    },
    async run(client, command, args) {
        try {
            await client.prisma.user.delete({ where: { id: args[0] } });
            command.react("✅");
        } catch (e) {
            command.react("❌");
            throw new Error(e);
        }
    }
};