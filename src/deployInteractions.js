const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { prisma } = require('./db/main.js');
require('dotenv').config();

const fetchInteractions = async (interactions) => {
    try {
        const interactionsInDb = await prisma.interactions.findMany();
        const interactionsNotInDb = interactions.filter((interaction) => !interactionsInDb.find((interactionInDb) => interactionInDb.name === interaction.name));

        interactionsNotInDb.forEach(async (interaction) => {
            await prisma.interactions.create({
                data: {
                    name: interaction.name
                }
            });
        });
        interactionsInDb.forEach(async (interactionInDb) => {
            if (!interactions.find((interaction) => interaction.name === interactionInDb.name)) {
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

const deployInteractions = async () => {
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
        await fetchInteractions(interactions);
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: interactions });
        console.log('Successfully registered application commands.');
    } catch (e) {
        console.error(e);
    }
}

module.exports = deployInteractions;