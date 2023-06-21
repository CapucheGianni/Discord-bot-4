const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
require('dotenv').config();

const deployInteractions = () => {
    const interactions = [];
    const interactionsPath = path.join(__dirname, 'interactions');
    const interactionFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.js'));

    for (const file of interactionFiles) {
        const filePath = path.join(interactionsPath, file);
        const interaction = require(filePath);
        interactions.push(interaction.data.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: interactions })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}

module.exports = deployInteractions;