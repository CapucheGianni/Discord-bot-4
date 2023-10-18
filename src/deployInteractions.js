const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { prisma } = require('./db/main.js');
require('dotenv').config();

const fetchInteractions = async (interactions) => {
    try {
        const interactionsInDb = await prisma.interaction.findMany();

        interactions.forEach(async (interaction) => {
            await prisma.interaction.upsert({
                where: {
                    name: interaction.data.name
                },
                include: {
                    options: true
                },
                create: {
                    name: interaction.data.name,
                    description: interaction.data.description,
                    interactionId: interaction.stats?.id
                },
                update: {
                    description: interaction.data.description,
                    interactionId: interaction.stats?.id
                }
            });
            interaction.data.options.forEach(async (option) => {
                await prisma.interactionOption.upsert({
                    where: {
                        id: `${interaction.data.name}-${option.name}`
                    },
                    create: {
                        id: `${interaction.data.name}-${option.name}`,
                        interactionName: interaction.data.name,
                        name: option.name,
                        description: option.description
                    },
                    update: {
                        name: option.name,
                        description: option.description
                    }
                });
            });
        });
        interactionsInDb.forEach(async (interactionInDb) => {
            if (!interactions.find((interaction) => interaction.data.name === interactionInDb.name)) {
                await prisma.interaction.delete({
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