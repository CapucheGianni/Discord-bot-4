const { PrismaClient } = require('@prisma/client');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Create a new Prisma client (db)
const prisma = new PrismaClient();

// Connect to the database
const dbConnect = async (client) => {
    try {
        await prisma.$connect();

        const embed = new EmbedBuilder()
            .setTitle('Successfully connected to the database.')
            .setColor(`#5FC1F9`)
            .setTimestamp();

        client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: [ embed ] });
        console.log("Connected to the database!");
    } catch (e) {
        await prisma.$disconnect();

        const embed = new EmbedBuilder()
            .setTitle('An error occured while connecting to the database.')
            .setDescription(`\`\`\`js\n${e}\n\`\`\``)
            .setColor(`#ff0000`)
            .setTimestamp();

        client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: [ embed ] });
        console.error("An error occured while sending the ready message.");
    }
};

// Close the database connection when the bot is closed
const dbDisconnect = () => {
    process.on('SIGINT', async () => {
        try {
            console.log("Shutting down...");
            await prisma.$disconnect();
            console.log("Disconnected from the database!");
        } catch (e) {
            console.error("An error occured while disconnecting from the database.");
        }
        process.exit(0);
    });
};

module.exports = {
    dbConnect,
    dbDisconnect,
    prisma
};