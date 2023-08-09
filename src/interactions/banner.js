const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("banner")
        .setDescription("Affiche votre bannière ou celle d'un membre du serveur")
        .addUserOption((option) => option.setName("membre").setDescription("La bannière du membre voulu"))
        .addBooleanOption((option) => option.setName("couleur").setDescription("Affiche la couleur de la bannière")),
    stats: {
        category: "Image",
        usage: "/banner [membre] [couleur]",
        permissions: []
    },
    async execute(client, interaction) {
        try {
            let user = interaction.options.getUser("membre") ?? interaction.user;

            user = await user.fetch();
            if (interaction.options.getBoolean("couleur")) {
                if (user.hexAccentColor) {
                    const embed = new EmbedBuilder()
                        .setDescription(`**[${user.hexAccentColor}](https://colorhexa.com/${user.hexAccentColor})**`)
                        .setColor(user.hexAccentColor);
                    return interaction.reply({
                        content: `La couleur de la bannière est : ${user.hexAccentColor}.`,
                        embeds: [ embed ]
                    });
                }
                return interaction.reply("L'utilisateur n'a pas de bannière.");
            }
            if (user) {
                return interaction.reply({
                    content: (user.bannerURL()) ? `Bannière de ${user}[ : ](${user.bannerURL({
                        dynamic: true,
                        size: 4096
                    })})` : `${user} n'a pas de bannière`,
                    allowedMentions: { parse: [] }
                });
            }
        } catch (e) {
            throw new Error(e);
        }
    }
};