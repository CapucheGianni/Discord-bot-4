const { Events, EmbedBuilder, Collection } = require('discord.js');

const interactionSuccess = async (client, interaction) => {
    const embed = new EmbedBuilder()
    .setTitle("Interaction exécutée ✅")
    .setDescription(`**Auteur:** ${interaction.user} (${interaction.user.id})\n**Salon:** ${interaction.channel} (${interaction.channel.id})\n**Serveur:** ${interaction.guild} (${interaction.guild.id})\n**Interaction:** ${interaction.commandName}`)
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
        const { cooldowns } = client;

        if (!interaction.isCommand())
            return;

        const getInteraction = client.interactions.get(interaction.commandName);

        if (!getInteraction) {
            console.error(`No interaction matching ${interaction.commandName} was found.`);
            return;
        }
        if (!cooldowns.has(getInteraction.data.name)) {
            cooldowns.set(getInteraction.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(getInteraction.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (getInteraction.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({
                    content: `Please wait, you are on a cooldown for \`${getInteraction.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
                    ephemeral: true
                });
            }
        }
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
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