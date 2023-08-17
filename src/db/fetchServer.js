const { prisma } = require('./main.js');

const fetchServers = (client) => {
    setInterval(async () => {
        try {
            const guilds = client.guilds.cache.map((guild) => guild);
            const guildsInDb = await prisma.server.findMany();
            const guildsNotInDb = guilds.filter((guild) => !guildsInDb.find((guildInDb) => guildInDb.id === guild.id));

            guildsNotInDb.forEach(async (guild) => {
                await prisma.server.create({
                    data: {
                        id: guild.id,
                        name: guild.name
                    }
                });
            });
            guildsInDb.forEach(async (guildInDb) => {
                if (!guilds.find((guild) => guild.id === guildInDb.id)) {
                    await prisma.server.delete({
                        where: {
                            id: guildInDb.id
                        }
                    });
                }
            });
        } catch (e) {
            console.error(e);
        }
    }, 1000 * 60 * 5);
};

module.exports = fetchServers;