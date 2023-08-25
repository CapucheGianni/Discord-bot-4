const { prisma } = require('./main.js');

const fetchServers = (client) => {
    setInterval(async () => {
        try {
            const guilds = client.guilds.cache.map((guild) => guild);
            const guildsInDb = await prisma.server.findMany();

            guilds.forEach(async (guild) => {
                await prisma.server.upsert({
                    where: {
                        id: guild.id
                    },
                    update: {
                        name: guild.name
                    },
                    create: {
                        id: guild.id,
                        name: guild.name
                    }
                });
            })
            guildsInDb.forEach(async (guildInDb) => {
                if (!guilds.find((guild) => guild.id === guildInDb.id)) {
                    await prisma.server.delete({
                        where: {
                            id: guildInDb.id
                        },
                        select: {
                            id: true,
                            name: true
                        }
                    });
                }
            });
        } catch (e) {
            console.error(e);
        }
    }, 1000 * 60);
};

module.exports = fetchServers;