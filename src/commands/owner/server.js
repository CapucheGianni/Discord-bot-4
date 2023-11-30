module.exports = {
    name: "server",
    description: "Affiche les informations concernant un serveur.",
    permissions: ['OWNER'],
    stats: {
        category: "Owner",
        usage: "server",
        alias: []
    },
    async run(client, command, args) {
        try {
            const serverId = args[0] ?? command.guildId;
            const server = await client.prisma.server.findUnique({
                where: { id: serverId }
            });

            if (!server) return command.react('❌');

            command.reply(`id: ${server.id}\nname: ${server.name}\nprefix: ${server.prefix}\njokes: ${server.jokes}`);
        } catch (e) {
            command.react('❌');
            throw new Error(e);
        }
    }
};