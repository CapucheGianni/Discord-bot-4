const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextInputBuilder } = require('discord.js');
const { interactionsIds } = require('../../../settings.json');
const { createChannelFromId } = require('../../utils/createChannel.js');
require('dotenv').config();

const removeStreamer = async (client, interaction, notification) => {
    try {
        if (!notification) return interaction.reply("Aucun streamer n'est configuré sur ce serveur");

        const { streamer } = notification

        await client.prisma.twitchNotification.delete({ where: { id: interaction.guild.id } });
        return interaction.reply(`Vous ne recevrez plus de message lorsque ${streamer} sera en live`);
    } catch (e) {
        throw new Error(e);
    }
}

const setMessage = async (i) => {
    switch (i.customId) {
        case 'newMessage':
            return await i.channel.send(
                "Veuillez entrer le message de notification que vous souhaitez voir apparaître lorsque le streamer est en live:\nTags disponibles:\n> - \`{streamer}\` - Affiche le nom du streamer"
            );
        case 'updateMessage':
            return await i.channel.send(
                "Veuillez entrer le message de notification que vous souhaitez voir apparaître lorsque le streamer a changé son titre:\nTags disponibles:\n> - \`{streamer}\` - Affiche le nom du streamer"
            );
        case 'mention':
            return await i.channel.send(
                "Veuillez mentionner le rôle que vous souhaitez notifier lorsque le streamer est en live:\n**notes**\n>>> - Si vous ne souhaitez pas mentionner de rôle, envoyez un message quelconque.\n- Si vous mentionnez plusieurs rôles, seul le premier sera pris en compte."
            );
        case 'streamer':
            return await i.channel.send("Veuillez entrer le nom du streamer dont vous voulez voir les lives: ");
        case 'channel':
            return await i.channel.send("Veuillez mentionner le salon dans lequel vous voulez recevoir les notifications: ");
    }
}

const getMessage = async (interaction, i, infos) => {
    const filter = (m) => m.author.id === interaction.user.id;
    const msg = await setMessage(i);

    try {
        const toUpdate = await interaction.channel.awaitMessages({
            filter,
            time: 1000 * 60 * 2,
            max: 1,
            errors: ['time']
        });
        let messageInfos = toUpdate.first();

        switch (i.customId) {
            case 'newMessage':
                infos[i.customId] = messageInfos.content;
                break;
            case 'updateMessage':
                infos[i.customId] = messageInfos.content;
                break;
            case 'mention':
                const roleMention = messageInfos.mentions.roles.first();

                if (!roleMention) infos[i.customId] = null;
                else infos[i.customId] = roleMention.id;
                break;
            case 'streamer':
                infos[i.customId] = messageInfos.content;
                break;
            case 'channel':
                const channelMention = messageInfos.mentions.channels.first();

                if (!channelMention) {
                    interaction.followUp({
                        content: 'Merci de mentionner un salon valide',
                        ephemeral: true
                    });
                } else infos[i.customId] = channelMention.id;
                break;
        }
        messageInfos.delete();
    } catch (e) {
        interaction.followUp({
            content: 'Vous avez dépassé le temps imparti pour répondre, veuillez réessayer',
            ephemeral: true
        });
    }
    msg.delete();
}

const createButtons = () => {
    const streamerButton = new ButtonBuilder().setCustomId('streamer').setLabel('Streamer').setStyle(ButtonStyle.Secondary);
    const newMessageButton = new ButtonBuilder().setCustomId('newMessage').setLabel('Message').setStyle(ButtonStyle.Secondary);
    const updateMessageButton = new ButtonBuilder().setCustomId('updateMessage').setLabel('Message d\'update').setStyle(ButtonStyle.Secondary);
    const mentionButton = new ButtonBuilder().setCustomId('mention').setLabel('Mention').setStyle(ButtonStyle.Secondary);
    const continueButton = new ButtonBuilder().setCustomId('continue').setLabel('Continuer').setStyle(ButtonStyle.Primary);
    const backButton = new ButtonBuilder().setCustomId('back').setLabel('Retour').setStyle(ButtonStyle.Primary);
    const channelButton = new ButtonBuilder().setCustomId('channel').setLabel('Channel').setStyle(ButtonStyle.Secondary);
    const registerButton = new ButtonBuilder().setCustomId('register').setLabel('Enregistrer').setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder().setCustomId('cancel').setLabel('Annuler').setStyle(ButtonStyle.Danger);
    return [
        new ActionRowBuilder().addComponents(streamerButton, channelButton, newMessageButton, continueButton, cancelButton),
        new ActionRowBuilder().addComponents(updateMessageButton, mentionButton, backButton, registerButton, cancelButton)
    ];
}

const setTwitchNotification = async (client, interaction, infos, editStreamCollector, rows, embed, message) => {
    let rowId = 0;

    editStreamCollector.on('collect', async (i) => {
        i.deferUpdate();
        switch (i.customId) {
            case 'continue':
                rowId++;
                message.edit({ components: [rows[rowId]] });
                break;
            case 'back':
                rowId--;
                message.edit({ components: [rows[rowId]] });
                break;
            case 'cancel':
                editStreamCollector.stop();
                interaction.followUp({
                    content: 'Vous avez annulé l\'opération',
                    components: []
                });
                break;
            case 'register':
                try {
                    await createChannelFromId(client, infos.channel ?? interaction.channelId);
                    await client.prisma.twitchNotification.upsert({
                        where: { id: interaction.guildId},
                        create: {
                            id: interaction.guildId,
                            streamer: infos.streamer,
                            roleId: infos.mention,
                            message: infos.newMessage,
                            updateMessage: infos.updateMessage,
                            channelId: infos.channel ?? interaction.channelId
                        },
                        update: {
                            streamer: infos.streamer,
                            roleId: infos.mention,
                            message: infos.newMessage,
                            updateMessage: infos.updateMessage,
                            channelId: infos.channel ?? interaction.channelId,
                            title: null,
                            isStreaming: false
                        }
                    });
                    i.channel.send({
                        content: 'Tous vos changements ont été enregistrés avec succès !'
                    });
                } catch (e) {
                    message.edit({
                        content: 'Création de la notification impossible, veuillez réessayer',
                        components: [],
                        embeds: []
                    });
                }
                editStreamCollector.stop();
                break;
            default:
                rows[rowId].components.forEach((button) => button.setDisabled(true));
                message.edit({ components: [rows[rowId]] });
                getMessage(interaction, i, infos).then(() => {
                    let notifMessage = '';

                    embed.setTitle(`Quand est-ce que ${infos.streamer ?? 'CapucheGianni'} est en live ?`)
                        .setFields([
                            {
                                name: 'Viewers',
                                value: `${Math.floor(Math.random() * 100000)}`,
                                inline: true
                            },
                            {
                                name: 'Lien',
                                value: `https://twitch.tv/${infos.streamer?.toLowerCase() ?? 'capuchegianni'}`,
                                inline: true
                            },
                            {
                                name: 'Jeu',
                                value: 'Just Chatting',
                                inline: true
                            },
                            {
                                name: 'Tags',
                                value: 'Aucun tag configuré',
                            }
                        ])
                        .setFooter({
                            text: `${infos?.streamer ?? 'capuchegianni'} est en live !`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true })
                        })
                        .setTimestamp();
                    rows[rowId].components.forEach((button) => button.setDisabled(false));
                    if (infos.newMessage) notifMessage = infos.newMessage.replace('{streamer}', infos.streamer ?? 'CapucheGianni');
                    else notifMessage = `${infos.streamer ?? 'CapucheGianni'} est en live !`;
                    if (infos.mention) notifMessage = `||Mention: <@&${infos.mention}>||\n\n${notifMessage}`;
                    message.edit({
                        content: notifMessage,
                        embeds: [embed],
                        components: [rows[rowId]]
                    });
                });
                break;
        }
    });
    editStreamCollector.on('end', async () => {
        client.mySet.delete(JSON.stringify({ name: interaction.commandName, guildId: interaction.guildId, type: 'interaction' }));
        message.edit({
            components: []
        });
    });
}

const createStreamNotification = async (client, interaction, notification) => {
    const infos = {
        streamer: null,
        newMessage: null,
        updateMessage: null,
        mention: null,
        channel: null
    };

    if (!notification) {
        const continueButton = new ButtonBuilder().setCustomId('continue').setLabel('Continuer').setStyle(ButtonStyle.Secondary).setEmoji('✅');
        const stopButton = new ButtonBuilder().setCustomId('stop').setLabel('Annuler').setStyle(ButtonStyle.Secondary).setEmoji('❌');
        const row = new ActionRowBuilder().addComponents(continueButton, stopButton);
        const message = await interaction.reply({
            content: 'Aucun streamer n\'est enregistré sur ce serveur, voulez-vous continuer ?',
            components: [row]
        });
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: 1000 * 30,
            max: 1
        });
        const buttons = [];

        collector.on('collect', (i) => {
            i.deferUpdate();
            buttons.push(i);
        });
        collector.on('end', async () => {
            if (!buttons[0] || buttons[0].customId === 'stop') {
                message.edit({
                    content: 'Vous avez annulé l\'opération',
                    components: []
                });
            } else {
                client.mySet.add(JSON.stringify({ name: interaction.commandName, guildId: interaction.guildId, type: 'interaction' }));

                const rows = createButtons();
                const embed = new EmbedBuilder()
                    .setTitle(`OMG je configure ${client.user.username} en live ??`)
                    .addFields([
                        {
                            name: 'Viewers',
                            value: `${Math.floor(Math.random() * 100000)}`,
                            inline: true
                        },
                        {
                            name: 'Lien',
                            value: `https://twitch.tv/capuchegianni`,
                            inline: true
                        },
                        {
                            name: 'Jeu',
                            value: 'Just Chatting',
                            inline: true
                        },
                        {
                            name: 'Tags',
                            value: 'Aucun tag configuré',
                        }
                    ])
                    .setImage('https://cdn.discordapp.com/attachments/1169234170355142686/1169660918234357880/live_user_capuchegianni-1920x1080.png?ex=6556369e&is=6543c19e&hm=9a9a2bdc8658a2092db02cb4ed6bf318a504a6fa66258b273313cf46d2bfeef9&')
                    .setColor('#6441a5')
                    .setFooter({
                        text: `CapucheGianni est en live !`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true })
                    })
                    .setTimestamp();
                const editStreamCollector = message.createMessageComponentCollector({
                    filter,
                    componentType: ComponentType.Button,
                    time: 1000 * 60 * 10,
                    idle: 1000 * 60 * 2
                });

                message.edit({
                    content: `CapucheGianni est en live !`,
                    components: [rows[0]],
                    embeds: [embed]
                });
                await setTwitchNotification(client, interaction, infos, editStreamCollector, rows, embed, message);
            }
        });
    } else {
        client.mySet.add(JSON.stringify({ name: interaction.commandName, guildId: interaction.guildId, type: 'interaction' }));

        const rows = createButtons();
        const embed = new EmbedBuilder()
            .setTitle(`OMG je configure ${client.user.username} en live ??`)
            .addFields([
                {
                    name: 'Viewers',
                    value: `${Math.floor(Math.random() * 100000)}`,
                    inline: true
                },
                {
                    name: 'Lien',
                    value: `https://twitch.tv/${notification.streamer.toLowerCase()}`,
                    inline: true
                },
                {
                    name: 'Jeu',
                    value: 'Just Chatting',
                    inline: true
                },
                {
                    name: 'Tags',
                    value: 'Aucun tag configuré',
                }
            ])
            .setImage('https://cdn.discordapp.com/attachments/1169234170355142686/1169660918234357880/live_user_capuchegianni-1920x1080.png?ex=6556369e&is=6543c19e&hm=9a9a2bdc8658a2092db02cb4ed6bf318a504a6fa66258b273313cf46d2bfeef9&')
            .setColor('#6441a5')
            .setFooter({
                text: `CapucheGianni est en live !`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();
        const message = await interaction.reply({
            content: notification.message?.replace('{streamer}', notification.streamer),
            components: [rows[0]],
            embeds: [embed]
        });
        const filter = (i) => i.user.id === interaction.user.id;
        const editStreamCollector = message.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: 1000 * 60 * 10,
            idle: 1000 * 60 * 2
        });

        infos.streamer = notification.streamer;
        infos.newMessage = notification.message;
        infos.updateMessage = notification.updateMessage;
        infos.mention = notification.roleId;
        infos.channel = notification.channelId;
        await setTwitchNotification(client, interaction, infos, editStreamCollector, rows, embed, message);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("twitch")
        .setDescription("Envoie une notification lorsque votre streamer préféré est en live")
        .addSubcommand((cmd) => cmd
            .setName("remove")
            .setDescription("Désactive les messages de stream sur le serveur"))
        .addSubcommand((cmd) => cmd
            .setName("add")
            .setDescription("Ajoute un streamer")),
    stats: {
        category: "Configuration",
        permissions: ['ManageGuild'],
        id: interactionsIds.twitch || 'twitch'
    },
    cooldown: 10,
    async execute(client, interaction) {
        if (client.mySet.has(JSON.stringify({ name: interaction.commandName, guildId: interaction.guildId, type: 'interaction' }))) {
            return interaction.reply({
                content: 'Vous avez déjà utilisé cette intéraction dans ce serveur, veuillez continuer à l\'utiliser',
                ephemeral: true
            });
        }

        const sub = interaction.options.getSubcommand();
        const notification = await client.prisma.twitchNotification.findUnique({ where: { id: interaction.guildId } });

        switch (sub) {
            case 'remove':
                return removeStreamer(client, interaction, notification);
            case 'add':
                return createStreamNotification(client, interaction, notification);
        }
    }
}