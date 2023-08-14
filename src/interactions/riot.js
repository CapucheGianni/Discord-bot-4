const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("riottxt")
        .setDescription("Open the file riot.txt"),
    stats: {
        category: "Utilitaire",
        usage: "/riottxt",
        permissions: []
    },
    execute(client, interaction) {
        try {
            interaction.reply({ files: [ "./riot.txt" ] })
        } catch (e) {
            throw new Error(e);
        }
    }
};