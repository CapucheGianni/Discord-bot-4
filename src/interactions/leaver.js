const { SlashCommandBuilder } = require('@discordjs/builders');
const { prisma } = require('../db/main.js');
const { ChannelType } = require('discord.js');
const { interactionsIds } = require('../../settings.json');

const enableSubCommand = async (client, interaction) => {
    const isEnabled = interaction.options.getBoolean("activate") ?? true;

    await prisma.leaveChannel.upsert({
        where: {
            serverId: interaction.guildId
        },
        create: {
            id: interaction.channelId,
            name: "default",
            serverId: interaction.guildId,
            serverName: interaction.member.guild.name,
            isActivated: isEnabled
        },
        update: {
            isActivated: isEnabled
        }
    });
    interaction.reply(`Les messages de départ sont maintenant ${isEnabled ? "activés" : "désactivés"}!`);
};

const channelsSubCommand = async (client, interaction) => {
    const channel = interaction.options.getChannel("channel");

    if (!channel) {
        return interaction.reply({
            content: "Merci d'indiquer un salon du serveur",
            ephemeral: "true"
        });
    }
    await prisma.leaveChannel.upsert({
        where: {
            serverId: interaction.guildId
        },
        create: {
            id: channel.id,
            name: channel.name,
            serverId: interaction.guildId,
            serverName: interaction.member.guild.name,
            isActivated: true
        },
        update: {
            id: channel.id,
            name: channel.name,
            isActivated: true
        }
    });
    interaction.reply(`Le message de départ sera désormais envoyé dans <#${channel.id}>!`);
};

const messageSubCommand = async (client, interaction) => {
    const message = interaction.options.getString("message") ?? "Goodbye my friend";

    await prisma.leaveChannel.upsert({
        where: {
            serverId: interaction.guildId
        },
        create: {
            id: interaction.channelId,
            name: "default",
            leaveMessage: message,
            serverId: interaction.guildId,
            serverName: interaction.member.guild.name,
            isActivated: true
        },
        update: {
            leaveMessage: message,
            isActivated: true
        }
    });
    interaction.reply(`Voici le nouveau message de départ de votre serveur: "${message}"`);
};

const testSubCommand = async (client, interaction) => {
    const infos = await prisma.leaveChannel.findUnique({
        where: {
            serverId: interaction.guildId
        }
    });

    if (!infos) {
        return interaction.reply("Vous n'avez renseigné aucune information concernant votre message de départ.");
    }

    const { id, leaveMessage, isActivated } = infos;

    interaction.reply(`Voici toutes les informations concernant les départs sur le serveur **${interaction.guild.name}**:\n\n>>> \`Salon:\` <#${id}>\n\`Message:\` ${leaveMessage}\n\`Activé:\` ${isActivated}`);
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaver")
        .setDescription("Configurer un message de départ sur votre serveur")

        .addSubcommand((command) => command
            .setName("enable")
            .setDescription("Active ou désactive les messages de départ")
            .addBooleanOption((option) => option
                .setName("activate")
                .setDescription("true/false")))

        .addSubcommand((command) => command
            .setName("channels")
            .setDescription("Salon où les messages sont envoyés")
            .addChannelOption((option) => option
                .setName("channel")
                .setDescription("Nom du salon")
                .addChannelTypes(ChannelType.GuildText)))

        .addSubcommand((command) => command
            .setName("message")
            .setDescription("Message de départ")
            .addStringOption((option) => option
                .setName("message")
                .setDescription("Message à afficher")
                .setMaxLength(255)))

        .addSubcommand((command) => command
            .setName("test")
            .setDescription("Vérifiez les informations sur le message de départ")),
    stats: {
        category: "Configuration",
        permissions: [ "ManageChannels" ],
        id: interactionsIds.leaver
    },
    execute(client, interaction) {
        try {
            const command = interaction.options.getSubcommand();

            switch (command) {
            case 'enable': {
                return enableSubCommand(client, interaction);
            }
            case 'channels': {
                return channelsSubCommand(client, interaction);
            }
            case 'message': {
                return messageSubCommand(client, interaction);
            }
            case 'test': {
                return testSubCommand(client, interaction);
            }
            }
        } catch (e) {
            throw new Error(e);
        }
    }
};