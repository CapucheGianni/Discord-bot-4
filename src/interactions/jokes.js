const { SlashCommandBuilder } = require('@discordjs/builders');
const { prisma } = require('../db/main.js');
const { interactionsIds } = require('../../settings.json');

const serverUpdate = async (interaction) => {
    const choice = interaction.options.getBoolean("enable") ?? false;
    let res = "";

    await prisma.server.update({
        where: {
            id: interaction.guildId
        },
        data: {
            jokes: choice
        }
    });
    choice ? res = "Les blagues ont été activées avec succès" : res = "Les blagues ont été désactivées avec succès";
    return interaction.reply(res);
}

const channelUpdate = async (interaction) => {
    const choice = interaction.options.getBoolean("enable") ?? false;
    const channel = interaction.options.getChannel("picker");
    let res = "";

    await prisma.channel.upsert({
        where: {
            id: channel.id
        },
        update: {
            jokes: choice
        },
        create: {
            id: channel.id,
            name: channel.name,
            jokes: choice,
            serverId: interaction.guildId
        }
    });
    choice ? res = `Les blagues ont été activées sur <#${channel.id}> avec succès` : res = `Les blagues ont été désactivées sur <#${channel.id}> avec succès`;
    return interaction.reply(res);
}

const userUpdate = async (interaction) => {
    const choice = interaction.options.getBoolean("enable") ?? false;
    let res = "";

    await prisma.user.update({
        where: {
            id: interaction.user.id
        },
        data: {
            jokes: choice
        }
    });
    choice ? res = "Kaide pourra maintenant répondre à vos messages" : res = "Kaide ne pourra plus répondre à vos messages";
    return interaction.reply(res);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jokes")
        .setDescription("Choisissez si vous voulez que le bot réponde à certains de vos messages.")

        .addSubcommand((command) => command
            .setName("server")
            .setDescription("Active ou désactive les blagues à l'échelle du serveur")
            .addBooleanOption((option) => option
                .setName("enable")
                .setDescription("true/false")))

        .addSubcommand((command) => command
            .setName("channel")
            .setDescription("Active ou désactive les blagues sur un salon spécifique")
            .addChannelOption((option) => option
                .setName("picker")
                .setDescription("Nom du salon"))
            .addBooleanOption((option) => option
                .setName("enable")
                .setDescription("true/false")))

        .addSubcommand((command) => command
            .setName("user")
            .setDescription("Active ou désactive les blagues à l'échelle de l'utilisateur")
            .addBooleanOption((option) => option
                .setName("enable")
                .setDescription("true/false"))),
    stats: {
        category: "Utilitaire",
        permissions: [],
        id: interactionsIds.jokes
    },
    execute(client, interaction) {
        try {
            const subcommands = interaction.options.getSubcommand();

            switch (subcommands) {
                case 'server':
                    return serverUpdate(interaction);
                case 'channel':
                    return channelUpdate(interaction);
                case 'user':
                    return userUpdate(interaction);
            }
        } catch (e) {
            throw new Error(e);
        }
    }
};