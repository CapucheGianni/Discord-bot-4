const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(client, interaction) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(client, interaction);
            console.log(`${interaction.commandName} command executed by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild.name} (${interaction.guild.id})`);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
            await interaction.reply({ content: 'Il y a eu une erreur lors de l\'exécution de cette commande !', ephemeral: true });
        }
    }
}