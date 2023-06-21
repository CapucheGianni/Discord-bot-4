const { Events } = require('discord.js');
const { getPrefix } = require('../setPrefix.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(client, message) {
        if (message.author.bot) {
            if (message.author.id == "276060004262477825") {
                message.channel.lastMessage.react("👋");
            }
            return;
        }
        if (!message.content.startsWith(getPrefix()))
            return;
        if (!message.guild)
            return;

        const args = message.content.slice(getPrefix().length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        if (commandName.length === 0)
            return;

        let command = client.commands.get(commandName);

        if (command)
            command.run(client, message, args);
        else
            return;
        try {
            const currentDate = new Date();
            const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
            const date = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

            console.log(`${commandName} command executed by ${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) at ${date} ${time}`);
        } catch (error) {
            console.error(`Error executing ${commandName}`);
            console.error(error);
        }
    }
};