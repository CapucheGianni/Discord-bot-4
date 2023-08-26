const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { prisma } = require('./db/main.js');
require('dotenv').config();

const fetchInteractions = async (interactions) => {
    try {
        const interactionsInDb = await prisma.interactions.findMany();

        interactions.forEach(async (interaction) => {
            await prisma.interactions.upsert({
                where: {
                    name: interaction.data.name
                },
                create: {
                    name: interaction.data.name,
                    description: interaction.data.description,
                    options: interaction.data.options.length ? interaction.data.options.map((option) => option.name).join(' ') : "None",
                    optionsDescription: interaction.data.options.length ? interaction.data.options.map((option) => option.description).join(' | ') : "None",
                    interactionId: interaction.stats.id
                },
                update: {
                    name: interaction.data.name,
                    description: interaction.data.description,
                    options: interaction.data.options.length ? interaction.data.options.map((option) => option.name).join(' ') : "None",
                    optionsDescription: interaction.data.options.length ? interaction.data.options.map((option) => option.description).join(' | ') : "None",
                    interactionId: interaction.stats.id
                }
            });
        });
        interactionsInDb.forEach(async (interactionInDb) => {
            if (!interactions.find((interaction) => interaction.data.name === interactionInDb.name)) {
                await prisma.interactions.delete({
                    where: {
                        name: interactionInDb.name
                    }
                });
            }
        });
    } catch (e) {
        console.error(e);
    }
};

const deployInteractions = async (client) => {
    const interactions = [];
    const interactionsPath = path.join(__dirname, 'interactions');
    const interactionFiles = fs.readdirSync(interactionsPath).filter((file) => file.endsWith('.js'));
    const rest = new REST().setToken(process.env.TOKEN);

    for (const file of interactionFiles) {
        const filePath = path.join(interactionsPath, file);
        const interaction = require(filePath);
        interactions.push(interaction.data.toJSON());
    }
    try {
        await fetchInteractions(client.interactions);
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: interactions });
        console.log('Successfully registered application commands.');
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    deployInteractions,
    fetchInteractions
};