const { Events, EmbedBuilder } = require('discord.js');

const interactionSuccess = async (client, interaction) => {
    const embed = new EmbedBuilder()
        .setTitle("Interaction exécutée ✅")
        .setDescription(`**Auteur:** ${interaction.user}\n**Salon:** ${interaction.channel}\n**Interaction:** ${interaction.commandName}`)
        .setFooter({
            text: `Interaction exécutée par ${interaction.user.username} | ${client.user.username}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp()
        .setColor(`#00ff00`);
    await client.channels.cache.get("1121226924082077747").send({
        embeds: [embed]
    });
};

module.exports = {
    name: Events.InteractionCreate,
    async execute(client, interaction) {
        if (!interaction.isCommand())
            return;

        const getInteraction = client.interactions.get(interaction.commandName);

        if (!getInteraction) {
            console.error(`No interaction matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            const currentDate = new Date();
            const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
            const date = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

            await getInteraction.execute(client, interaction);
            await interactionSuccess(client, interaction);
            console.log(`${interaction.commandName} interaction executed by ${interaction.user.username} (${interaction.user.id}) in ${interaction.guild.name} (${interaction.guild.id}) at ${date} ${time}`);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
            await interaction.reply({
                content: 'Il y a eu une erreur lors de l\'exécution de cette intéraction !',
                ephemeral: true
            });
        }
    }
};