const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");
const { rebrandly } = require("../../settings.json");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("urlshorten")
        .setDescription("Réduit la taille d'un url donné")
        .addStringOption((option) => option.setName("url").setDescription("Url à raccourcir").setRequired(true)),
    stats: {
        category: "Utilitaire",
        usage: "/urlshorten [url]",
        permissions: []
    },
    async execute(client, interaction) {
        try {
            const urlToShorten = interaction.options.getString("url");
            const url = "https://api.rebrandly.com/v1/links";
            const data = JSON.stringify({ destination: urlToShorten });
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": rebrandly.API_KEY
                },
                body: data
            });

            if (!response.ok) {
                return interaction.reply("Merci de fournir un url valide.");
            }

            const jsonResponse = await response.json();

            return interaction.reply(`https://${jsonResponse.shortUrl}`);
        } catch (e) {
            throw new Error(e);
        }
    }
};