const { SlashCommandBuilder } = require('@discordjs/builders');
const { prisma } = require('../../db/main.js');
const { interactionsIds } = require('../../../settings.json');
const { ChannelType } = require('discord.js');
require('dotenv').config();

const serverUpdate = async (interaction) => {
    const choice = interaction.options.getBoolean("enable") ?? false;
    let res = "";

    if (!interaction.member.permissions.has("ManageChannels")) {
        return interaction.reply({
            content: "Vous n'avez pas la permission de modifier les paramètres du serveur",
            ephemeral: true
        });
    }
    await prisma.server.update({
        where: {
            id: interaction.guildId
        },
        data: {
            jokes: choice
        }
    });
    res = choice ? "Les blagues ont été activées avec succès" : "Les blagues ont été désactivées avec succès";
    return interaction.reply(res);
}

const channelUpdate = async (interaction) => {
    const choice = interaction.options.getBoolean("enable") ?? false;
    const channel = interaction.options.getChannel("picker");
    let res = "";

    if (!interaction.member.permissions.has("ManageChannels")) {
        return interaction.reply({
            content: "Vous n'avez pas la permission de modifier les paramètres de ce salon",
            ephemeral: true
        });
    }
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
    res = choice ? `Les blagues ont été activées sur <#${channel.id}> avec succès` : `Les blagues ont été désactivées sur <#${channel.id}> avec succès`;
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
    res = choice ? `<@${process.env.CLIENT_ID}> pourra maintenant répondre à vos messages` : `<@${process.env.CLIENT_ID}> ne pourra plus répondre à vos messages`;
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
                .setDescription("Nom du salon")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
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
        category: "Fun",
        permissions: [],
        id: interactionsIds.jokes || 'jokes'
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