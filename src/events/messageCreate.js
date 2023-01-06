const { Events } = require('discord.js');
const { prefix } = require('../../auth.json');
const messageCountSchema = require('../mongo_db/messageCountSchema.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(client, message) {
        if (message.author.bot) return;
        
        // Get the message count for an user in a server
        await messageCountSchema.findOneAndUpdate({
            _id: message.author.id,
            //_serverid: message.guild.id,
        }, 
        {
            _id: message.author.id,
            //_serverid: message.guild.id,
            $inc: {
                messageCount: 1,
            },
        }, 
        {
            upsert: true,
        });

        // Compare if it is a command or not
        if (!message.content.startsWith(prefix)) return;
        if (!message.guild) return;
        
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();
        if (commandName.length == 0) return;

        let command = client.commands.get(commandName);
        if (command) command.run(client, message, args);

        try {
            console.log(`${commandName} command executed by ${message.author.tag} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) at ${message.createdAt}`);
        } catch (error) {
            console.error(`Error executing ${commandName}`);
            console.error(error);
        }
    }
};