const { PrismaClient } = require('@prisma/client');
const { EmbedBuilder } = require('discord.js');

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

        client.channels.cache.get('1121226924082077747').send({ embeds: [ embed ] });
        console.log("Connected to the database!");
    } catch (e) {
        await prisma.$disconnect();

        const embed = new EmbedBuilder()
            .setTitle('An error occured while connecting to the database.')
            .setDescription(`\`\`\`js\n${e}\n\`\`\``)
            .setColor(`#ff0000`)
            .setTimestamp();

        client.channels.cache.get('1121226924082077747').send({ embeds: [ embed ] });
        console.error("An error occured while sending the ready message.");
    }
};

// Close the database connection when the bot is closed
const dbDisconnect = (client) => {
    process.on('SIGINT', async () => {
        try {
            const waitingEmbed = new EmbedBuilder()
                .setTitle('Shutting down...')
                .setDescription('The bot is now shutting down, see you soon !')
                .setColor(`#FF9300`)
                .setTimestamp();

            client.channels.cache.get('1121226924082077747').send({ embeds: [ waitingEmbed ] });
            console.log("Shutting down...");
            await prisma.$disconnect();
            console.log("Disconnected from the database!");
        } catch (e) {
            const embed = new EmbedBuilder()
                .setTitle('There was an error while disconnecting from the database.')
                .setDescription(`\`\`\`js\n${e}\n\`\`\``)
                .setColor(`#ff0000`)
                .setTimestamp();

            client.channels.cache.get('1121226924082077747').send({ embeds: [ embed ] });
            console.error("An error occured while disconnecting from the database.");
        }
        process.exit(0);
    });
};

module.exports = {
    dbConnect,
    dbDisconnect
};