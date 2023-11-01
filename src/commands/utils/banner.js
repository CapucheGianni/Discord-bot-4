const { EmbedBuilder } = require('discord.js');
const getUser = require('../../utils/getUser');

module.exports = {
    name: "banner",
    description: "Affiche votre bannière ou celle d\'un membre du serveur",
    permissions: [],
    stats: {
        category: "Utilitaire",
        usage: "banner [color] [membre]",
        alias: ['bannière']
    },
    async run(client, command, args) {
        try {
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
                            embeds: [ embed ]
                        });
                    }
                    return command.reply("L'utilisateur n'a pas de couleur personnalisée.");
                }
                return command.reply("Merci d'indiquer un utilisateur valide.");
            }
            let user = await getUser(client, command, args[0]);

            if (user) {
                user = await user.fetch();
                return command.reply({
                    content: (user.bannerURL()) ? `Bannière de ${user} :\n${user.bannerURL({
                        dynamic: true,
                        size: 4096
                    })}` : `${user} n'a pas de bannière.`,
                    allowedMentions: { parse: [] }
                });
            }
            return command.reply("Merci d'indiquer un utilisateur valide.");
        } catch (e) {
            throw new Error(e);
        }
    }
};