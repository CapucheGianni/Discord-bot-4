const { SlashCommandBuilder } = require("@discordjs/builders");
const { prisma } = require('../db/main.js');
const { ChannelType } = require("discord.js");
const { interactionsIds } = require('../../settings.json');

const enableSubCommand = async (client, interaction) => {
    const isEnabled = interaction.options.getBoolean("activate") ?? true;
    const channel = await client.channels.cache.get(interaction.channelId);

    await prisma.welcomeChannel.upsert({
        where: {
            serverId: interaction.guildId
        },
        create: {
            id: interaction.channelId,
            name: channel.name,
            serverId: interaction.guildId,
            serverName: interaction.member.guild.name,
            isActivated: isEnabled
        },
        update: {
            isActivated: isEnabled
        }
    });
    interaction.reply(`Les messages d'arrivées sont maintenant ${isEnabled ? "activés" : "désactivés"}!`);
};

const channelsSubCommand = async (client, interaction) => {
    const channel = interaction.options.getChannel("channel");
    const isDms = interaction.options.getBoolean("dm") ?? false;

    if (!channel && !isDms) {
        return interaction.reply({
            content: "Merci d'indiquer soit un salon, soit l'envoi du message en dm",
            ephemeral: "true"
        });
    }
    if (isDms) {
        await prisma.welcomeChannel.upsert({
            where: {
                serverId: interaction.guildId
            },
            create: {
                id: "none",
                name: "none",
                dm: isDms,
                serverId: interaction.guildId,
                serverName: interaction.member.guild.name,
                isActivated: true
            },
            update: {
                dm: isDms,
                isActivated: true
            }
        });
        return interaction.reply(`Votre message de bienvenue sera maintenant envoyé par message privé.`);
    }
    await prisma.welcomeChannel.upsert({
        where: {
            serverId: interaction.guildId
        },
        create: {
            id: channel.id,
            name: channel.name,
            dm: isDms,
            serverId: interaction.guildId,
            serverName: interaction.member.guild.name,
            isActivated: true
        },
        update: {
            id: channel.id,
            name: channel.name,
            dm: isDms,
            isActivated: true
        }
    });
    interaction.reply(`Le message de bienvenue sera désormais envoyé dans <#${channel.id}>!`);
};

const messageSubCommand = async (client, interaction) => {
    const message = interaction.options.getString("message") ?? "Bienvenue sur le serveur !";

    await prisma.welcomeChannel.upsert({
        where: {
            serverId: interaction.guildId
        },
        create: {
            id: interaction.channelId,
            name: "default",
            welcomeMessage: message,
            serverId: interaction.guildId,
            serverName: interaction.member.guild.name,
            isActivated: true
        },
        update: {
            welcomeMessage: message,
            isActivated: true
        }
    });
    interaction.reply(`Voici le nouveau message d'arrivée de votre serveur: "${message}"`);
};

const testSubCommand = async (client, interaction) => {
    const infos = await prisma.welcomeChannel.findUnique({
        where: {
            serverId: interaction.guildId
        }
    });

    if (!infos) {
        return interaction.reply("Vous n'avez renseigné aucune information concernant votre message d'arrivée.");
    }

    const { id, welcomeMessage, dm, isActivated } = infos;

    interaction.reply(`Voici toutes les informations concernant les arrivées sur le serveur **${interaction.guild.name}**:\n\n>>> \`Salon:\` <#${id}>\n\`Message:\` ${welcomeMessage}\n\`Messages privés:\` ${dm}\n\`Activé:\` ${isActivated}`);
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcomer")
        .setDescription("Configurer un message de bienvenue sur votre serveur")

        .addSubcommand((command) => command
            .setName("enable")
            .setDescription("Active ou désactive les messages de bienvenue")
            .addBooleanOption((option) => option
                .setName("activate")
                .setDescription("true/false")))

        .addSubcommand((command) => command
            .setName("channels")
            .setDescription("Salon où les messages sont envoyés")
            .addBooleanOption((option) => option
                .setName("dm")
                .setDescription("Envoyer le message en messages privés"))
            .addChannelOption((option) => option
                .setName("channel")
                .setDescription("Nom du salon")
                .addChannelTypes(ChannelType.GuildText)))

        .addSubcommand((command) => command
            .setName("message")
            .setDescription("Message de bienvenue")
            .addStringOption((option) => option
                .setName("message")
                .setDescription("Message à afficher")
                .setMaxLength(255)))

        .addSubcommand((command) => command
            .setName("test")
            .setDescription("Testez le message de bienvenue")),
    stats: {
        category: "Configuration",
        permissions: [ "ManageChannels" ],
        id: interactionsIds.welcomer
    },
    execute(client, interaction) {
        try {
            const command = interaction.options.getSubcommand();

            switch (command) {
            case 'enable':
                return enableSubCommand(client, interaction);
            case 'channels':
                return channelsSubCommand(client, interaction);
            case 'message':
                return messageSubCommand(client, interaction);
            case 'test':
                return testSubCommand(client, interaction);
            }
        } catch (e) {
            throw new Error(e);
        }
    }
};