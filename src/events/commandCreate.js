const { Events } = require('discord.js');
const { prefix } = require('../../auth.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(client, command) {
        if (!command.isCommand()) return;
        
        const getCommand = prefix + client.commands.get(command.commandName);

        if (!getCommand) {
            console.error(`No command matching ${command.commandName} was found.`);
            return;
        }
        try {
            if (getCommand.content === "!ping") {
                await getCommand.execute(client, command);
                console.log(`${command.commandName} command executed by ${command.user.tag} (${command.user.id}) in ${command.guild.name} (${command.guild.id}) at ${command.createdAt}`);
            }
        } catch (error) {
            console.error(`Error executing ${command.commandName}`);
            console.error(error);
            await command.reply({ content: 'Il y a eu une erreur lors de l\'exécution de cette commande !', ephemeral: true });
        }
    }
}