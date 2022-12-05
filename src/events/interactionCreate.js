const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(client, interaction) {
        if (!interaction.isCommand()) return;

        const getInteraction = client.interactions.get(interaction.commandName);

        if (!getInteraction) {
            console.error(`No interaction matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await getInteraction.execute(client, interaction);
            console.log(`${interaction.commandName} interaction executed by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild.name} (${interaction.guild.id}) at ${interaction.createdAt}`);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
            await interaction.reply({ content: 'Il y a eu une erreur lors de l\'exécution de cette intéraction !', ephemeral: true });
        }
    }
}