const { EmbedBuilder } = require ("discord.js");

module.exports = {
    name: "banner",
    description: "Affiche votre bannière ou celle d\'un membre du serveur",
    stats: {
        category: "Image",
        usage: "*banner [color] [membre]"
    },
    async run (client, command, args) {
        if (args[0] === "color") {
            const user = args[1] ?? command.author;
            const userMention = command.mentions.users.first();
            const userExists = await client.users.fetch(user).catch(() => null);

            if (userExists) {
                if (user.hexAccentColor) {
                    const embed = new EmbedBuilder()
                    .setDescription(`**[${userExists.hexAccentColor}](https://colorhexa.com/${userExists.hexAccentColor})**`)
                    .setColor(userExists.hexAccentColor);
                    return command.reply({content: `La couleur de la bannière est : ${userExists.hexAccentColor}.`, embeds: [embed]})
                } else {
                    return command.reply("L'utilisateur n'a pas de bannière prout.")
                };
            } else if (userMention) {
                if (userMention.hexAccentColor) {
                    const embed = new EmbedBuilder()
                    .setDescription(`**[${userMention.hexAccentColor}](https://colorhexa.com/${userMention.hexAccentColor})**`)
                    .setColor(userMention.hexAccentColor);
                    return command.reply({content: `La couleur de la bannière est : ${userMention.hexAccentColor}.`, embeds: [embed]})
                } else {
                    return command.reply("L'utilisateur n'a pas de bannière prout.")
                };
            } else {
                return command.reply({
                    content: "Merci d'indiquer un utilisateur valide."
                });
            };
        } else {
            const user = args[0] ?? command.author;
            const userMention = command.mentions.users.first();
            const userExists = await client.users.fetch(user).catch(() => null);

            if (userExists) {
                const message = (userExists.bannerURL()) ? `Bannière de ${userExists} :\n(${userExists.bannerURL({dynamic: true, size: 4096})})` : `${userExists} n'a pas de bannière bite`;
                return command.reply({content: message, allowedMentions: {parse: []}});
            } else if (userMention) {
                const message = (userMention.bannerURL()) ? `Bannière de ${userMention} :\n(${userMention.bannerURL({dynamic: true, size: 4096})})` : `${userMention} n'a pas de bannière bite`;
                return command.reply({content: message, allowedMentions: {parse: []}});
            } else {
                return command.reply({
                    content: "Merci d'indiquer un utilisateur valide."
                });
            };
        }
    },
};