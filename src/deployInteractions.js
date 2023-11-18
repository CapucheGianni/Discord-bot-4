const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { prisma } = require('./db/main.js');
const { getInteractions } = require('./utils/getInteractions.js');
const { getCommands } = require('./utils/getCommands.js');
const getEvents = require('./utils/getEvents.js');
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

const checkIfAnyChanges = async (client) => {
    const interactionsInDb = await prisma.interaction.findMany({ include: { options: true } });
    const interactionsInClient = client.interactions.map((interaction) => interaction.data.toJSON()).sort((a, b) => a.name.localeCompare(b.name));

    if (interactionsInDb.length !== interactionsInClient.length) return true;
    for (let i = 0; i < interactionsInDb.length; i++) {
        const interactionsOptionsInClient = interactionsInClient[i].options.sort((a, b) => a.name.localeCompare(b.name));

        if (interactionsInDb[i].name !== interactionsInClient[i].name) return true;
        if (interactionsInDb[i].description !== interactionsInClient[i].description) return true;
        if (interactionsInDb[i].options.length !== interactionsInClient[i].options.length) return true;
        for (let j = 0; j < interactionsInDb[i].options.length; j++) {
            if (interactionsInDb[i].options[j].name !== interactionsOptionsInClient[j].name) return true;
            if (interactionsInDb[i].options[j].description !== interactionsOptionsInClient[j].description) return true;
        }
    }
    return false;
}

const deployInteractions = async (client) => {
    const rest = new REST().setToken(process.env.TOKEN);

    await getInteractions(client);
    await getCommands(client);
    getEvents(client);
    if (!await checkIfAnyChanges(client)) return;
    try {
        const interactions = client.interactions.map((interaction) => interaction.data.toJSON());

        console.log('Started refreshing application (/) commands.');
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