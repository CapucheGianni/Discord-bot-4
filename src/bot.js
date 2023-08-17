const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const deployInteractions = require('./deployInteractions.js');
const getInteractions = require('./utils/getInteractions.js');
const getCommands = require('./utils/getCommands.js');
const getEvents = require('./utils/getEvents.js');
const { dbDisconnect, prisma } = require('./db/main.js');
require('dotenv').config();

const client = new Client({
    presence: {
        status: 'online',
        activities: [ {
            name: '📚 /help',
            type: 2
        } ]

    },
    allowedMentions: { parse: [ 'users', 'roles' ] },
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers ],
    partials: [ Partials.Channel ]
});

client.interactions = new Collection();
client.commands = new Collection();
client.cooldowns = new Collection();

// Get all the interactions, commands, and events and put them in a collection
getInteractions(client);
getCommands(client);
getEvents(client);

// Deploy the interactions to discord
const deploy = async () => {
    const cmdNbr = await prisma.interactions.count();
    if (client.interactions.size !== cmdNbr) {
        deployInteractions();
    }
}

deploy();

// Disconnect from the db when the bot is shut down
dbDisconnect();

// Connect the bot to Discord
client.login(process.env.TOKEN);