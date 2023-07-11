const { Events, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getPrefix } = require('../utils/setPrefix.js');

const commandSuccess = async (client, message, commandName) => {
    const embed = new EmbedBuilder()
        .setTitle("Commande exécutée ✅")
        .setDescription(`**Auteur:** ${message.author} (${message.author.id})\n**Salon:** ${message.channel} (${message.channel.id})\n**Serveur:** ${message.guild} (${message.guild.id})\n**commande:** ${commandName}`)
        .setFooter({
            text: `Commande exécutée par ${message.author.username} | ${client.user.username}`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp()
        .setColor(`#00ff00`);
    await client.channels.cache.get("1121226924082077747").send({
        embeds: [embed]
    });
};

const checkPermissions = (command, message) => {
    if (message.author.id !== process.env.OWNER_ID && command.permissions[0] === "OWNER") {
        message.reply("Vous n'avez pas la permission d'utiliser cette commande !");
        return 1;
    }
    if (command.permissions.length && command.permissions[0] !== "OWNER") {
        for (let i = 0; command.permissions[i]; i++) {
            if (!message.member.permissions.has(command.permissions[i])) {
                message.reply(`Vous n'avez pas la permission \`${command.permissions[i]}\` requise pour utiliser cette commande !`);
                return 1;
            }
        }
    }
};

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

        try {
            const currentDate = new Date();
            const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
            const date = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

            if (command) {
                const perm = checkPermissions(command, message);
                if (perm)
                    return;
                command.run(client, message, args);
            } else {
                return;
            }
            await commandSuccess(client, message, commandName);
            console.log(`${commandName} command executed by ${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) at ${date} ${time}`);
        } catch (error) {
            console.error(`Error executing ${commandName}`);
            console.error(error);
        }
    }
};