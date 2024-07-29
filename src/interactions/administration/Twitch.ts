import { Bot } from '../../classes/Bot.js'
import {
    AutocompleteInteraction,
    SlashCommandBuilder,
    CommandInteraction,
    PermissionsBitField,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
    ButtonInteraction,
    GuildMember,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ChannelType,
    InteractionResponse,
    Message,
    Collection,
    Snowflake,
    RoleSelectMenuInteraction,
    ChannelSelectMenuInteraction
} from 'discord.js'
import { InteractionDecorator } from '../../utils/Decorators.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { Logger } from '../../classes/Logger.js'
import { TTwitch } from '../../types/Twitch.js'
import { Model, Transaction } from 'sequelize'

const logger = Logger.getInstance('')

@InteractionDecorator({
    name: 'twitch',
    description: 'Configuration des notifications twitch sur votre serveur.',
    cooldown: 5,
    category: 'administration',
    usage: '',
    data: new SlashCommandBuilder()
        .setName('twitch')
        .setDescription('Configuration des notifications twitch sur votre serveur.')
        .addSubcommand(command => command
            .setName('set')
            .setDescription('Créé ou modifie la notification twitch du serveur.')
        )
        .addSubcommand(command => command
            .setName('remove')
            .setDescription('Supprime la notification twitch du serveur.')
        )
        .addSubcommand(command => command
            .setName('enable')
            .setDescription('Active ou désactive la notification twitch.')
            .addBooleanOption(option => option
                .setName('toenable')
                .setDescription('True / False')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
})
export default class TwitchInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: CommandInteraction): Promise<any> {
        if (!await this.checkPermissions(interaction, interaction.member as GuildMember, ['ManageGuild']))
            return
        if (client.set.has(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))) {
            return interaction.reply({
                content: 'Cette commande est déjà en court d\'éxécution sur ce serveur.',
                ephemeral: true
            })
        }

        const options = interaction.options as CommandInteractionOptionResolver

        switch (options.getSubcommand()) {
            case 'set':
                this._setTwitchNotification(client, interaction)
                break
            case 'remove':
                this._removeTwitchNotification(client, interaction)
                break
            case 'enable':
                this._enableTwitchNotification(client, interaction)
                break
        }
    }

    private async _setTwitchNotification(client: Bot, interaction: CommandInteraction): Promise<any> {
        client.set.add(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))

        try {
            const [notification, isCreated] = await client.database.TwitchNotification.findOrCreate({
                where: {
                    serverId: interaction.guildId!
                },
                defaults: {
                    serverId: interaction.guildId!,
                    streamer: interaction.user.username,
                    channelId: interaction.channelId
                }
            })

            if (isCreated)
                await this._askForCreation(client, interaction, notification)
            else
                await this._setEmbedResponse(client, interaction, notification)

        } catch (error: any) {
            logger.log(client, error, 'error')
            interaction.reply({
                content: 'Une erreur est survenue lors de l\'éxécution de l\'intéraction.',
                ephemeral: true
            })
            client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
        }
    }

    private async _askForCreation(client: Bot, interaction: CommandInteraction, notification: Model<TTwitch, any>): Promise<void> {
        const continueButton = new ButtonBuilder().setCustomId('continue').setLabel('Continuer').setStyle(ButtonStyle.Secondary).setEmoji('✅')
        const stopButton = new ButtonBuilder().setCustomId('stop').setLabel('Annuler').setStyle(ButtonStyle.Secondary).setEmoji('❌')
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(continueButton, stopButton)
        const response = await interaction.reply({
            content: 'Aucune notification twitch n\'est configurée sur ce serveur. Voulez-vous continuer ?',
            components: [row]
        })
        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            componentType: ComponentType.Button,
            time: 1000 * 30,
            max: 1
        })
        const button: ButtonInteraction[] = []

        collector.on('collect', collectedInteraction => {
            collectedInteraction.deferUpdate()
            button.push(collectedInteraction)
        })
        collector.on('end', async () => {
            if (!button.length || button[0].customId === 'stop') {
                return response.edit({
                    content: 'Vous avez annulé l\'opération.',
                    components: []
                })
            }
            if (button.length && button[0].customId === 'continue')
                await this._setEmbedResponse(client, interaction, notification, response)
        })
    }

    private async _setEmbedResponse(client: Bot, interaction: CommandInteraction, notification: Model<TTwitch, any>, response?: InteractionResponse): Promise<any> {
        const rows = this._createButtons(notification.get().channelId, notification.get().roleId)
        const embed = new EmbedBuilder()
            .setTitle(`Configuration de ${client.user?.username} en stream!`)
            .addFields(
                { name: 'Viewers', value: `${Math.floor(Math.random() * 10000)}`, inline: true },
                { name: 'Lien', value: `https://twitch.tv/${notification.get().streamer.toLowerCase()}`, inline: true },
                { name: 'Jeu', value: 'Just chatting', inline: true },
                { name: 'Tags', value: 'Aucun tag configuré' }
            )
            .setImage('https://cdn.discordapp.com/attachments/1169234170355142686/1169660918234357880/live_user_capuchegianni-1920x1080.png?ex=6556369e&is=6543c19e&hm=9a9a2bdc8658a2092db02cb4ed6bf318a504a6fa66258b273313cf46d2bfeef9&')
            .setColor('#ffc800')
            .setFooter({
                text: `${notification.get().streamer} est en live!`,
                iconURL: client.user?.displayAvatarURL()
            })
            .setTimestamp()

        if (response) {
            await response.edit({
                content: `${notification.get().streamer} est en live!`,
                components: [rows[0], rows[3]],
                embeds: [embed]
            })
            await this._configureNotification(client, interaction, notification, rows, response)
        } else {
            const message = notification.get().message?.replace('{streamer}', notification.get().streamer)
            const messageWithMention = notification.get().roleId ? `||<@&${notification.get().roleId}>||\n\n${message}` : message
            const response = await interaction.reply({
                content: messageWithMention,
                components: [rows[0], rows[3]],
                embeds: [embed]
            })
            await this._configureNotification(client, interaction, notification, rows, response)
        }
    }

    private async _configureNotification(client: Bot, interaction: CommandInteraction, notification: Model<TTwitch, any>, rows: ActionRowBuilder<ButtonBuilder | ChannelSelectMenuBuilder | RoleSelectMenuBuilder>[], response: InteractionResponse): Promise<any> {
        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 1000 * 60 * 10,
            idle: 1000 * 60 * 2
        })
        let currentRowId = 0

        collector.on('collect', async (collectedInteraction: ButtonInteraction | RoleSelectMenuInteraction | ChannelSelectMenuInteraction) => {
            collectedInteraction.deferUpdate()
            switch (collectedInteraction.customId) {
                case 'continue':
                    currentRowId++
                    rows[3].components[0].setDisabled(false)
                    if (currentRowId === 2)
                        rows[3].components[1].setDisabled(true)
                    response.edit({ components: [rows[currentRowId], rows[3]] })
                    break
                case 'back':
                    currentRowId--
                    rows[3].components[1].setDisabled(false)
                    if (!currentRowId)
                        rows[3].components[0].setDisabled(true)
                    response.edit({ components: [rows[currentRowId], rows[3]] })
                    break
                case 'cancel':
                    collector.stop()
                    interaction.followUp({
                        content: 'Vous avez annulé l\'opération',
                        components: []
                    })
                    break
                case 'register':
                    try {
                        if (notification.get().channelId !== interaction.channelId) {
                            const newChannel = client.channels.cache.get(notification.get().channelId)

                            if (newChannel && newChannel.isTextBased() && !newChannel.isDMBased()) {
                                await client.database.Channel.upsert({
                                    id: newChannel.id,
                                    name: newChannel.name
                                })
                            }
                        }
                        await notification.save()
                        collectedInteraction.channel?.send('Tous vos changements ont été enregistrés avec succès.')
                    } catch (error: any) {
                        logger.log(client, error, 'error')
                        interaction.followUp({
                            content: 'Une erreur est survenue lors de la création de la notification, si l\'erreur se répète veuillez contacter le développeur.',
                            ephemeral: true
                        })
                        response.edit({
                            components: []
                        })
                    }
                    collector.stop()
                    break
                default:
                    await response.edit({ components: [] })
                    await this._handleRowInteractions(interaction, collectedInteraction, notification, rows)

                    const embed = new EmbedBuilder()
                        .setTitle(`Configuration de ${client.user?.username} en stream!`)
                        .addFields(
                            { name: 'Viewers', value: `${Math.floor(Math.random() * 10000)}`, inline: true },
                            { name: 'Lien', value: `https://twitch.tv/${notification.get().streamer.toLowerCase()}`, inline: true },
                            { name: 'Jeu', value: 'Just chatting', inline: true },
                            { name: 'Tags', value: 'Aucun tag configuré' }
                        )
                        .setImage('https://cdn.discordapp.com/attachments/1169234170355142686/1169660918234357880/live_user_capuchegianni-1920x1080.png?ex=6556369e&is=6543c19e&hm=9a9a2bdc8658a2092db02cb4ed6bf318a504a6fa66258b273313cf46d2bfeef9&')
                        .setColor('#ffc800')
                        .setFooter({
                            text: `${notification.get().streamer} est en live!`,
                            iconURL: client.user?.displayAvatarURL()
                        })
                        .setTimestamp()
                    const message = notification.get().message?.replace('{streamer}', notification.get().streamer)
                    const messageWithMention = notification.get().roleId ? `||<@&${notification.get().roleId}>||\n\n${message}` : message

                    await response.edit({
                        content: messageWithMention,
                        embeds: [embed],
                        components: [rows[currentRowId], rows[3]]
                    })
                    break
            }
        })
        collector.on('end', async () => {
            client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
            response.edit({ components: [] })
        })
    }

    private async _handleRowInteractions(interaction: CommandInteraction, collectedInteraction: ButtonInteraction | RoleSelectMenuInteraction | ChannelSelectMenuInteraction, notification: Model<TTwitch, any>, rows: ActionRowBuilder<ButtonBuilder | ChannelSelectMenuBuilder | RoleSelectMenuBuilder>[]): Promise<any> {
        switch (collectedInteraction.customId) {
            case 'newMessage':
                try {
                    const newMessageSent = await collectedInteraction.channel?.send('Veuillez entrer le message de notification que vous souhaitez voir apparaître lorsque le streamer est en live:\nTags disponibles:\n> - \`{streamer}\` - Affiche le nom du streamer')
                    const newMessage = (await this._readMessage(interaction)).first()

                    notification.set({ message: newMessage?.content })
                    await newMessageSent?.delete()
                    await newMessage?.delete()
                    break
                } catch {
                    await interaction.followUp({
                        content: 'Vous avez dépassé le temps requis pour répondre, veuillez réessayer.',
                        ephemeral: true
                    })
                }
            case 'updateMessage':
                try {
                    const updateMessageSent = await collectedInteraction.channel?.send("Veuillez entrer le message de notification que vous souhaitez voir apparaître lorsque le streamer a changé son titre:\nTags disponibles:\n> - \`{streamer}\` - Affiche le nom du streamer")
                    const updateMessage = (await this._readMessage(interaction)).first()

                    notification.set({ updateMessage: updateMessage?.content })
                    await updateMessageSent?.delete()
                    await updateMessage?.delete()
                    break
                } catch {
                    await interaction.followUp({
                        content: 'Vous avez dépassé le temps requis pour répondre, veuillez réessayer.',
                        ephemeral: true
                    })
                }
            case 'streamer':
                try {
                    const streamerSent = await collectedInteraction.channel?.send("Veuillez entrer le nom du streamer dont vous voulez voir les lives:")
                    const streamer = (await this._readMessage(interaction)).first()

                    notification.set({ streamer: streamer?.content })
                    await streamerSent?.delete()
                    await streamer?.delete()
                    break
                } catch {
                    await interaction.followUp({
                        content: 'Vous avez dépassé le temps requis pour répondre, veuillez réessayer.',
                        ephemeral: true
                    })
                }
            case 'mention':
                try {
                    if (!collectedInteraction.isRoleSelectMenu())
                        break
                    const roles = collectedInteraction.values
                    const roleSelectMenu = rows[2].components[0] as RoleSelectMenuBuilder

                    roleSelectMenu.setDefaultRoles(roles)
                    notification.set({ roleId: roles.length > 0 ? roles[0] : null })
                    await collectedInteraction.followUp({
                        content: 'La mention a été mise à jour correctement.',
                        ephemeral: true
                    })
                    break
                } catch (error: any) {
                    logger.simpleError(error)
                    return await collectedInteraction.followUp({
                        content: 'Une erreur est survenue lors de la mise à jour de la mention.',
                        ephemeral: true
                    })
                }
            case 'channel':
                if (!collectedInteraction.isChannelSelectMenu())
                    break
                const channels = collectedInteraction.values
                const channelSelectMenu = rows[1].components[0] as ChannelSelectMenuBuilder

                if (!channels.length) {
                    return collectedInteraction.followUp({
                        content: 'Veuillez spécifier un salon où envoyer les notifications twitch.',
                        ephemeral: true
                    })
                }
                channelSelectMenu.setDefaultChannels(channels)
                notification.set({ channelId: channels[0] })
                collectedInteraction.followUp({
                    content: 'Le salon a été mis à jour correctement.',
                    ephemeral: true
                })
                break
        }
    }

    private _readMessage(interaction: CommandInteraction): Promise<Collection<Snowflake, Message>> {
        return interaction.channel!.awaitMessages({
            filter: m => m.author.id === interaction.user.id,
            time: 1000 * 60 * 2,
            max: 1,
            errors: ['time']
        })
    }

    private _createButtons(channelId: string, roleId: string | null): ActionRowBuilder<ButtonBuilder | ChannelSelectMenuBuilder | RoleSelectMenuBuilder>[] {
        const streamerButton = new ButtonBuilder().setCustomId('streamer').setLabel('Streamer').setStyle(ButtonStyle.Secondary)
        const channelSelector = new ChannelSelectMenuBuilder().setCustomId('channel').setPlaceholder('Salon').setDefaultChannels(channelId).setMaxValues(1).setMinValues(1).setChannelTypes(ChannelType.GuildText)
        const newMessageButton = new ButtonBuilder().setCustomId('newMessage').setLabel('Message').setStyle(ButtonStyle.Secondary)
        const updateMessageButton = new ButtonBuilder().setCustomId('updateMessage').setLabel('Update').setStyle(ButtonStyle.Secondary)
        const mentionSelector = new RoleSelectMenuBuilder().setCustomId('mention').setPlaceholder('Mention').setMinValues(0).setMaxValues(1)
        const continueButton = new ButtonBuilder().setCustomId('continue').setEmoji('➡️').setStyle(ButtonStyle.Primary)
        const backButton = new ButtonBuilder().setCustomId('back').setEmoji('⬅️').setStyle(ButtonStyle.Primary).setDisabled(true)
        const registerButton = new ButtonBuilder().setCustomId('register').setLabel('Enregistrer').setStyle(ButtonStyle.Success)
        const cancelButton = new ButtonBuilder().setCustomId('cancel').setLabel('Annuler').setStyle(ButtonStyle.Danger)

        if (roleId)
            mentionSelector.setDefaultRoles(roleId)

        return [
            new ActionRowBuilder<ButtonBuilder>().addComponents(streamerButton, newMessageButton, updateMessageButton),
            new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelector),
            new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(mentionSelector),
            new ActionRowBuilder<ButtonBuilder>().addComponents(backButton, continueButton, cancelButton, registerButton)
        ]
    }

    private async _removeTwitchNotification(client: Bot, interaction: CommandInteraction): Promise<any> {
        client.set.add(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))

        const t = await client.database.database.transaction()

        try {
            const notification = (await client.database.TwitchNotification.findByPk(interaction.guildId!, { transaction: t }))
            if (!notification) {
                client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
                await t.rollback()
                return interaction.reply('Aucune notification twitch n\'est configurée sur ce serveur.')
            }

            const deleteButton = new ButtonBuilder().setCustomId('delete').setLabel('Supprimer').setStyle(ButtonStyle.Danger)
            const goBackButton = new ButtonBuilder().setCustomId('goback').setLabel('Annuler').setStyle(ButtonStyle.Secondary)
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(goBackButton, deleteButton)
            const response = await interaction.reply({
                content: 'Êtes vous sûr de vouloir supprimer la notification twitch ? Cette action est irréversible.',
                components: [row]
            })
            const collector = response.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                componentType: ComponentType.Button,
                time: 1000 * 60,
                max: 1
            })
            const button: ButtonInteraction[] = []

            collector.on('collect', collectedInteraction => {
                collectedInteraction.deferUpdate()
                button.push(collectedInteraction)
            })
            collector.on('end', async () => {
                if (!button.length || button[0].customId === 'goback') {
                    client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
                    await t.commit()
                    return response.edit({
                        content: 'Vous avez annulé l\'opération.',
                        components: []
                    })
                }
                if (button.length && button[0].customId === 'delete') {
                    await notification.destroy({ transaction: t })
                    response.edit({
                        content: 'Vous ne recevrez plus de notifications sur ce serveur.',
                        components: []
                    })
                    client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
                    await t.commit()
                }
            })
        } catch (error: any) {
            await t.rollback()
            logger.log(client, error, 'error')
            interaction.reply({
                content: 'Une erreur est survenue lors de l\'éxécution de l\'intéraction.',
                ephemeral: true
            })
            client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
        }
    }

    private async _enableTwitchNotification(client: Bot, interaction: CommandInteraction): Promise<any> {
        const options = interaction.options as CommandInteractionOptionResolver

        try {
            const [model] = (await client.database.TwitchNotification.findOrCreate({
                where: {
                    serverId: interaction.guildId!
                },
                defaults: {
                    serverId: interaction.guildId!,
                    streamer: interaction.user.username,
                    channelId: interaction.channelId
                }
            }))
            const toEnable = options.getBoolean('toenable', true)

            await model.update({ enabled: toEnable })
            interaction.reply(`Les notifications twitch ont été ${toEnable ? 'activées' : 'désactivées'} avec succès.`)
        } catch (error: any) {
            logger.log(client, error, 'error')
            interaction.reply({
                content: 'Une erreur est survenue lors de l\'éxécution de l\'intéraction.',
                ephemeral: true
            })
        }
    }
}