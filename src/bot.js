const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('../auth.json');

const client = new Client({

    presence: {
        status: 'online',
		activities: [{
			name: '📚 /help',
			type: 2
		}],

    },

	allowedMentions: {
		parse: ['users', 'roles']
	},

	intents: [GatewayIntentBits.Guilds],

	partials: [Partials.Channel]

});

client.interactions = new Collection();
client.commands = new Collection();

const interactionsPath = path.join(__dirname, 'interactions');
const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');
const interactionsFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.js'));
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of interactionsFiles) {
	const filePath = path.join(interactionsPath, file);
	const interaction = require(filePath);

	if ('data' in interaction && 'execute' in interaction) {
		client.interactions.set(interaction.data.name, interaction);
	} else {
		console.log(`[WARNING] The interaction at ${filePath} is missing a required "data" or "execute" property.`);
	}
};

for (const file of commandsFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	if ('name' in command && 'execute' in command) {
		client.commands.set(command.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
	}
};

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(client, ...args));
	} else {
		client.on(event.name, (...args) => event.execute(client, ...args));
	}
};

client.login(token);