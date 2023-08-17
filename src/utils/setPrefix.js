const { prisma } = require('../db/main.js');

const setPrefix = async (guildId, newPrefix) => {
    try {
        await prisma.server.update({
            where: {
                id: guildId
            },
            data: {
                prefix: newPrefix
            }
        });
    } catch (e) {
        console.error(e);
    }
};

const getPrefix = async (guildId) => {
    try {
        const server = await prisma.server.findUnique({
            where: {
                id: guildId
            }
        });
        return server.prefix;
    } catch (e) {
        console.error(e);
    }
};

module.exports = {
    getPrefix,
    setPrefix
};