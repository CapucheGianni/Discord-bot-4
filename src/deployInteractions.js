const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { clientId, guildId, token } = require('../auth.json');

const interactions = [];
const interactionsPath = path.join(__dirname, 'interactions');
const interactionFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.js'));

for (const file of interactionFiles) {
	const filePath = path.join(interactionsPath, file);
	const interaction = require(filePath);
	interactions.push(interaction.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: interactions })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);