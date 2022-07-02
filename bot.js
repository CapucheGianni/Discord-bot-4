const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { token } = require('./auth.json');

const client = new Client({

    presence: {
        status:'idle',
        activities: [{
            name:'Espionner les membres du Bistrot, **/help**',
            type:'PLAYING'
        }]
    },

	allowedMentions: {
		parse: ['users', 'roles']
	},

    intents: [Intents.FLAGS.GUILDS] 
    
});

client.commands = new Collection();
client.methods = {};
client.methods.MessageEmbed = MessageEmbed;

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Connecté!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);