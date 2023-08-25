const { Events, EmbedBuilder, Collection } = require('discord.js');
const { getPrefix } = require('../utils/setPrefix.js');
const { addUserMessage } = require('../db/addUser.js');
const { commandErrorLog } = require('../utils/errorLog.js');
const getPun = require('../fun/pun.js');
require('dotenv').config();

const detectName = (message, prefix) => {
    if (message.content.toLowerCase() === "kaide" || message.mentions.has(process.env.CLIENT_ID)) {
        message.channel.send(`Bonjour!\n\nJe suis **Kaide** le bot du goat __capuchegianni__.\nLe préfixe du bot est \`${prefix}\` mais il est tout à fait possible de le modifier.`);
        if (!message.guild) {
            message.channel.send("Je ne suis utilisable que sur un serveur !");
        }
    }
};

const commandLog = async (client, message, commandName) => {
    const embed = new EmbedBuilder()
        .setTitle("Commande exécutée ✅")
        .setDescription(`**Auteur:** ${message.author} (${message.author.id})\n**Salon:** ${message.channel} (${message.channel.id})\n**Serveur:** ${message.guild} (${message.guild.id})\n**commande:** ${commandName}`)
        .setFooter({
            text: `Commande exécutée par ${message.author.username} | ${client.user.username}`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp()
        .setColor(`#00ff00`);
    await client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: [ embed ] });
};

const checkPermissions = (command, message) => {
    if (message.author.id !== process.env.OWNER_ID && command.permissions[ 0 ] === "OWNER") {
        return 1;
    }
    if (command.permissions.length && command.permissions[ 0 ] !== "OWNER") {
        for (let i = 0; command.permissions[ i ]; i++) {
            if (!message.member.permissions.has(command.permissions[ i ])) {
                message.reply(`Vous n'avez pas la permission \`${command.permissions[ i ]}\` requise pour utiliser cette commande !`);
                return 1;
            }
        }
    }
};

const initCommandsCooldowns = (client, command, getCommand) => {
    const { cooldowns } = client;

    if (!cooldowns.has(getCommand.name)) {
        cooldowns.set(getCommand.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(getCommand.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (getCommand.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(command.author.id)) {
        const expirationTime = timestamps.get(command.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            command.reply({
                content: `Please wait, you are on a cooldown for \`${getCommand.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
                ephemeral: true
            });
            return 1;
        }
    }
    timestamps.set(command.author.id, now);
    setTimeout(() => timestamps.delete(command.author.id), cooldownAmount);
};

module.exports = {
    name: Events.MessageCreate,
    async execute(client, message) {
        let prefix = await getPrefix(message.guildId);

        if (message.author.bot) {
            if (message.author.id === "276060004262477825") {
                message.channel.lastMessage.react("👋");
            }
            return;
        }
        detectName(message, prefix);
        if (!message.guild) {
            return;
        }
        await addUserMessage(client, message);
        getPun(message);
        if (!message.content.startsWith(prefix) && !message.content.startsWith("kaide")) {
            return;
        }
        if (message.content.startsWith("kaide")) {
            prefix = "kaide";
        }

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (!command) {
            return;
        }
        try {
            const currentDate = new Date();
            const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
            const date = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
            const isCd = initCommandsCooldowns(client, message, command);
            const perm = checkPermissions(command, message);

            if (isCd || perm) {
                return;
            }
            await command.run(client, message, args);
            await commandLog(client, message, commandName);
            console.log(`${commandName} command executed by ${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) at ${date} ${time}`);
        } catch (error) {
            console.error(`Error executing ${commandName}`);
            commandErrorLog(client, error, message);
            await message.reply(`Une erreur est survenue lors de la commande \`${commandName}\` !\n\n Veuillez contacter **__${client.users.cache.get(process.env.OWNER_ID).username}__** si l'erreur survient à plusieurs reprises.`);
        }
    }
};