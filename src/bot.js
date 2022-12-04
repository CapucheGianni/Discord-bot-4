const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials, Events } = require('discord.js');
const { token } = require('../auth.json');

const client = new Client({

    presence: {
        status:'idle',
        activities: [{
			name: 'Discord.js',
			type: 'WATCHING',
		}],
    },

	version: '1.0.2',

	allowedMentions: {
		parse: ['users', 'roles']
	},

	intents: [GatewayIntentBits.Guilds],

	partials: [Partials.Channel]

});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, client => {
	console.log('Connecté!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}`);
		console.error(error);
		await interaction.reply({ content: 'Il y a eu une erreur lors de l\'exécution de cette commande !', ephemeral: true });
	}
});

client.login(token);