const { EmbedBuilder } = require ("discord.js");

module.exports = {
    name: "banner",
    description: "Affiche votre bannière ou celle d\'un membre du serveur",
    stats: {
        category: "Image",
        usage: "banner [color] [membre]"
    },
    async run(client, command, args) {
        if (args[0] === "color") {
            let user = args[1] ?? command.author;
            const userExists = await client.users.fetch(user).catch(() => null);
            let userMention = command.mentions.users.first() ?? userExists;

            if (userMention) {
                userMention = await userMention.fetch();
                if (userMention.hexAccentColor) {
                    const embed = new EmbedBuilder()
                    .setDescription(`**[${userMention.hexAccentColor}](https://colorhexa.com/${userMention.hexAccentColor})**`)
                    .setColor(userMention.hexAccentColor);
                    return command.reply({
                        content: `La couleur de la bannière est : ${userMention.hexAccentColor}.`,
                        embeds: [embed]
                    });
                } else {
                    return command.reply("L'utilisateur n'a pas de couleur personnalisée.")
                };
            } else {
                return command.reply({
                    content: "Merci d'indiquer un utilisateur valide."
                });
            };
        } else {
            let user = args[0] ?? command.author;
            const userExists = await client.users.fetch(user).catch(() => null);
            let userMention = command.mentions.users.first() ?? userExists;

            if (userMention) {
                userMention = await userMention.fetch();
                return command.reply({
                    content: (userMention.bannerURL()) ? `Bannière de ${userMention} :\n${userMention.bannerURL({dynamic: true, size: 4096})}` : `${userMention} n'a pas de bannière.`,
                    allowedMentions: {parse: []}
                });
            } else {
                return command.reply({
                    content: "Merci d'indiquer un utilisateur valide."
                });
            }
        }
    }
};