const { prisma } = require('../db/main.js');
require('dotenv').config();

module.exports = getStartTimestamp = async () => {
    const timestamp = new Date().toISOString()

    try {
        return await prisma.bot.upsert({
            where: { id: process.env.CLIENT_ID },
            create: {
                id: process.env.CLIENT_ID,
                startTimestamp: timestamp,
            },
            update: { startTimestamp: timestamp },
        });
    } catch (e) {
        console.error("Error updating startTimestamp");
    }
}