const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { deployInteractions } = require('./deployInteractions.js');
const { dbDisconnect } = require('./db/main.js');
const getStartTimestamp = require('./utils/getStartTimestamp.js');
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
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent
    ],
    partials: [ Partials.Channel, Partials.GuildMember, Partials.Message ]
});

client.interactions = new Collection();
client.commands = new Collection();
client.events =  new Collection();
client.cooldowns = new Collection();

getStartTimestamp();

// Deploy the interactions to discord
deployInteractions(client);

// Disconnect from the db when the bot is shut down
dbDisconnect();

// Connect the bot to Discord
client.login(process.env.TOKEN);

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});