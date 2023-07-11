const { EmbedBuilder } = require ("discord.js");
const getUser = require("../utils/getUser");

module.exports = {
    name: "banner",
    description: "Affiche votre bannière ou celle d\'un membre du serveur",
    permissions: [],
    stats: {
        category: "Image",
        usage: "banner [color] [membre]"
    },
    async run(client, command, args) {
        if (args[0] === "color") {
            let user = await getUser(client, command, args[1]);

            if (user) {
                user = await user.fetch();
                if (user.hexAccentColor) {
                    const embed = new EmbedBuilder()
                    .setDescription(`**[${user.hexAccentColor}](https://colorhexa.com/${user.hexAccentColor})**`)
                    .setColor(user.hexAccentColor);
                    return command.reply({
                        content: `La couleur de la bannière est : ${user.hexAccentColor}.`,
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
            let user = await getUser(client, command, args[0]);

            if (user) {
                user = await user.fetch();
                return command.reply({
                    content: (user.bannerURL()) ? `Bannière de ${user} :\n${user.bannerURL({dynamic: true, size: 4096})}` : `${user} n'a pas de bannière.`,
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