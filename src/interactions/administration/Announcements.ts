import {
    AutocompleteInteraction,
    SlashCommandBuilder,
    CommandInteraction,
    PermissionsBitField,
    CommandInteractionOptionResolver,
    InteractionResponse,
    GuildMember,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonInteraction,
    ButtonStyle,
    ComponentType,
    ChannelSelectMenuBuilder,
    TextInputBuilder,
    ModalBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChannelType,
    ChannelSelectMenuInteraction,
    StringSelectMenuInteraction,
    EmbedBuilder,
    Message
} from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { Logger } from '../../classes/Logger.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { InteractionDecorator } from '../../utils/Decorators.js'
import { Model } from 'sequelize'
import { TAnnouncementChannel } from '../../types/Channel.js'
import { isTruthy } from '../../utils/TypeGuards.js'

const logger = Logger.getInstance('')
const responseByType = {
    welcome: 'd\'arrivées',
    leave: 'de départs',
    ban: 'de bans'
}

type AnnouncementType = 'welcome' | 'leave' | 'ban'

@InteractionDecorator({
    name: 'announcements',
    description: 'Configuration des annonces.',
    cooldown: 5,
    category: 'administration',
    usage: 'announcements <welcome | leave | ban> <enable | configure>',
    data: new SlashCommandBuilder()
        .setName('announcements')
        .setDescription('Configuration des annonces.')
        .addSubcommandGroup(subCommandGroup => subCommandGroup
            .setName('welcome')
            .setDescription('Configurez les annonces d\'arrivées.')
            .addSubcommand(subCommand => subCommand
                .setName('configure')
                .setDescription('Configuration des annonces d\'arrivées.')
            )
            .addSubcommand(subCommand => subCommand
                .setName('remove')
                .setDescription('Supprimer les annonces d\'arrivées.')
            )
        )
        .addSubcommandGroup(subCommandGroup => subCommandGroup
            .setName('leave')
            .setDescription('Configure the leave announcement.')
            .addSubcommand(subCommand => subCommand
                .setName('configure')
                .setDescription('Configuration des annonces de départs.')
            )
            .addSubcommand(subCommand => subCommand
                .setName('remove')
                .setDescription('Supprimer les annonces de départ.')
            )
        )
        .addSubcommandGroup(subCommandGroup => subCommandGroup
            .setName('ban')
            .setDescription('Configure the ban announcement.')
            .addSubcommand(subCommand => subCommand
                .setName('configure')
                .setDescription('Configuration des annonces de bans.')
            )
            .addSubcommand(subCommand => subCommand
                .setName('remove')
                .setDescription('Supprimer les annonces de bans.')
            )
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
})
export default class AnnouncementsInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: CommandInteraction): Promise<any> {
        if (!await this.checkPermissions(interaction, interaction.member as GuildMember, ['ManageGuild']))
            return
        if (client.set.has(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))) {
            return interaction.reply({
                content: 'Cette intéraction est déjà en court d\'éxécution sur ce serveur.',
                ephemeral: true
            })
        }

        const options = interaction.options as CommandInteractionOptionResolver

        if (options.getSubcommand() === 'configure')
            return this._configureAnnouncement(client, interaction, options.getSubcommandGroup(true) as AnnouncementType)
        if (options.getSubcommand() === 'remove')
            return this._removeAnnouncement(client, interaction, options.getSubcommandGroup(true) as AnnouncementType)
    }

    private async _configureAnnouncement(client: Bot, interaction: CommandInteraction, type: AnnouncementType): Promise<InteractionResponse | void> {
        // client.set.add(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))

        try {
            const [channel, isCreated] = await client.database.AnnouncementChannel.findOrCreate({
                where: {
                    serverId: interaction.guildId!,
                    type: type
                },
                defaults: {
                    serverId: interaction.guildId!,
                    channelId: interaction.channelId!,
                    type: type
                },
                include: [{
                    model: client.database.AnnouncementEmbed,
                    as: 'embed',
                    include: [{
                        model: client.database.EmbedField,
                        as: 'fields'
                    }]
                }]
            })

            if (isCreated)
                return this._askForCreation(client, interaction, channel, type)
            else
                return this._setResponse(client, interaction, channel, type)
        } catch (error: any) {
            logger.log(client, error, 'error')
            client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
            return interaction.reply({
                content: 'Une erreur est survenue lors de l\'éxécution de l\'intéraction.',
                ephemeral: true
            })
        }
    }

    private async _askForCreation(client: Bot, interaction: CommandInteraction, channel: Model<TAnnouncementChannel, any>, type: AnnouncementType): Promise<void> {
        const continueButton = new ButtonBuilder().setCustomId('continue').setLabel('Continuer').setStyle(ButtonStyle.Secondary).setEmoji('✅')
        const stopButton = new ButtonBuilder().setCustomId('stop').setLabel('Annuler').setStyle(ButtonStyle.Secondary).setEmoji('❌')
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(continueButton, stopButton)
        const response = await interaction.reply({
            content: `Aucun message ${responseByType[channel.get().type]} n'est configuré sur ce serveur. Voulez-vous continuer ?`,
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
                client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))

                try { await channel.destroy() }
                catch (error: any) { logger.log(client, error, 'warn') }

                return response.edit({
                    content: 'Vous avez annulé l\'opération.',
                    components: []
                })
            }
            if (button.length && button[0].customId === 'continue')
                return this._setResponse(client, interaction, channel, type, response)
        })
    }

    private async _setResponse(client: Bot, interaction: CommandInteraction, channel: Model<TAnnouncementChannel, any>, type: AnnouncementType, response?: InteractionResponse): Promise<void> {
        const rows = this._createButtons(channel.get(), type)
        const embed = this._buildEmbed(channel.get())
        const imageUrl = channel.get().imageUrl

        if (response) {
            await response.edit({
                content: `C\'est votre message ${responseByType[type]}!`,
                embeds: embed,
                components: [rows[0], rows[1], rows[6]],
                files: []
            })
            return this._handleUserActions(client, interaction, channel, rows, response)
        } else {
            const response = await interaction.reply({
                content: channel.get().message || 'No message set',
                embeds: embed,
                components: [rows[0], rows[1], rows[6]],
                files: imageUrl && imageUrl !== '' ? [imageUrl] : []
            })
            return this._handleUserActions(client, interaction, channel, rows, response)
        }
    }

    private _buildEmbed(channel: TAnnouncementChannel): EmbedBuilder[] | [] {
        if (!channel.embedEnabled)
            return []

        const embed = new EmbedBuilder()
        const storedEmbed = channel.embed

        if (!isTruthy(storedEmbed))
            return []
        const fields = storedEmbed.fields

        if (storedEmbed.displayTitle)
            embed.setTitle(storedEmbed.title)
        if (storedEmbed.displayBody)
            embed.setDescription(storedEmbed.body)
        if (storedEmbed.displayImage)
            embed.setImage(storedEmbed.imageUrl)
        if (storedEmbed.displayFooter)
            embed.setImage(storedEmbed.footer)
        if (storedEmbed.displayThumbnail)
            embed.setThumbnail(storedEmbed.thumbnailUrl)
        if (storedEmbed.displayTimestamp)
            embed.setTimestamp()
        if (fields.length) {
            for (const field of fields) {
                embed.addFields({ name: field.title, value: field.value, inline: field.inline })
            }
        }
        return [embed]
    }

    private async _handleUserActions(client: Bot, interaction: CommandInteraction, channel: Model<TAnnouncementChannel, any>, rows: ActionRowBuilder<ButtonBuilder | ChannelSelectMenuBuilder | StringSelectMenuBuilder>[], response: InteractionResponse): Promise<void> {
        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 1000 * 60 * 15,
            idle: 1000 * 60 * 5
        })
        let currentRowId = 0

        collector.on('collect', async (collectedInteraction: ButtonInteraction | ChannelSelectMenuInteraction | StringSelectMenuInteraction) => {
            if (collectedInteraction.customId !== 'msgimg' && collectedInteraction.customId !== 'embedinfos' && collectedInteraction.customId !== 'addembedfield')
                await collectedInteraction.deferUpdate()
            switch (collectedInteraction.customId) {
                case 'continue':
                    currentRowId += 2
                    rows[6].components[0].setDisabled(false)
                    if (currentRowId === 4)
                        rows[6].components[1].setDisabled(true)
                    return response.edit({ components: [rows[currentRowId], rows[currentRowId + 1], rows[6]] })
                case 'back':
                    currentRowId -= 2
                    rows[6].components[1].setDisabled(false)
                    if (!currentRowId)
                        rows[6].components[0].setDisabled(true)
                    return response.edit({ components: [rows[currentRowId], rows[currentRowId + 1], rows[6]] })
                case 'cancel':
                    collector.stop()
                    return await collectedInteraction.channel?.send('Vous avez annulé l\'opération')
                case 'register':
                    try {
                        if (channel.get().channelId !== interaction.channelId) {
                            const newChannel = client.channels.cache.get(channel.get().channelId)

                            if (newChannel && newChannel.isTextBased() && !newChannel.isDMBased()) {
                                await client.database.Channel.upsert({
                                    id: newChannel.id,
                                    name: newChannel.name
                                })
                            }
                        }
                        await channel.save()
                        await collectedInteraction.channel?.send('Tous vos changements ont été enregistrés avec succès.')
                    } catch (error: any) {
                        logger.log(client, error, 'error')
                        await interaction.followUp({
                            content: 'Une erreur est survenue lors de la création du salon, si l\'erreur se répète veuillez contacter le développeur.',
                            ephemeral: true
                        })
                        await response.edit({ components: [] })
                    }
                    return collector.stop()
                default:
                    if (collectedInteraction.customId !== 'msgimg' && collectedInteraction.customId !== 'embedinfos' && collectedInteraction.customId !== 'addembedfield')
                        await response.edit({ components: [] })
                    await this._updateAnnouncement(interaction, collectedInteraction, channel, rows)

                    const embed = this._buildEmbed(channel.get())
                    const imageUrl = channel.get().imageUrl

                    return response.edit({
                        content: channel.get().message || 'No message set',
                        embeds: embed,
                        components: [rows[currentRowId], rows[currentRowId + 1], rows[6]],
                        files: imageUrl && imageUrl !== '' ? [imageUrl] : []
                    })
            }
        })
        collector.on('end', async () => {
            client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
            await response.edit({ components: [] })
        })
    }

    private async _updateAnnouncement(interaction: CommandInteraction, collectedInteraction: ButtonInteraction | ChannelSelectMenuInteraction | StringSelectMenuInteraction, channel: Model<TAnnouncementChannel, any>, rows: ActionRowBuilder<ButtonBuilder | ChannelSelectMenuBuilder | StringSelectMenuBuilder>[]): Promise<void | Message | InteractionResponse> {
        switch (collectedInteraction.customId) {
            case 'isactivated':
                const activatedButton = rows[0].components[0] as ButtonBuilder
                const continueButton = rows[6].components[1] as ButtonBuilder

                channel.set({ isActivated: !channel.get().isActivated })
                activatedButton.setLabel(channel.get().isActivated ? 'Activé' : 'Désactivé').setStyle(channel.get().isActivated ? ButtonStyle.Success : ButtonStyle.Danger)
                continueButton.setDisabled(!channel.get().isActivated)
                return collectedInteraction.followUp({
                    content: 'Les changements ont été sauvegardés localement avec succès.',
                    ephemeral: true
                })
            case 'msgimg':
                const modal = new ModalBuilder().setCustomId('modal').setTitle('Modal')
                const messageModal = new TextInputBuilder().setCustomId('message').setLabel('Message | Tags: ({user}, {username})').setMaxLength(1950).setStyle(TextInputStyle.Paragraph).setValue(channel.get().message || '').setRequired(false)
                const imageUrlModal = new TextInputBuilder().setCustomId('imageurl').setLabel('Image URL (ex: https://imgur.com/5wukV1P)').setMaxLength(255).setStyle(TextInputStyle.Short).setValue(channel.get().imageUrl || '').setRequired(false)
                const messageRow = new ActionRowBuilder<TextInputBuilder>().addComponents(messageModal)
                const imageUrlRow = new ActionRowBuilder<TextInputBuilder>().addComponents(imageUrlModal)

                modal.addComponents(messageRow, imageUrlRow)
                await collectedInteraction.showModal(modal)

                try {
                    const collector = await interaction.awaitModalSubmit({
                        filter: i => i.user.id === interaction.user.id,
                        time: 1000 * 60 * 10,
                        idle: 1000 * 60 * 5
                    })
                    const message = collector.fields.getTextInputValue('message')
                    const imageUrl = collector.fields.getTextInputValue('imageurl')

                    channel.set({
                        message: message,
                        imageUrl: imageUrl
                    })
                    return collector.reply({
                        content: 'Les changements ont été sauvegardés localement avec succès.',
                        ephemeral: true
                    })
                } catch { }
            case 'isdms':
                const dmButton = rows[0].components[2] as ButtonBuilder

                channel.set({ dm: !channel.get().dm })
                dmButton.setLabel(channel.get().dm ? 'En dms' : 'Sur le serveur')
                return collectedInteraction.followUp({
                    content: 'Les changements ont été sauvegardés localement avec succès.',
                    ephemeral: true
                })
            case 'channel':
                if (!collectedInteraction.isChannelSelectMenu())
                    return
                const channels = collectedInteraction.values
                const channelSelectMenu = rows[1].components[0] as ChannelSelectMenuBuilder

                if (!channels.length) {
                    return collectedInteraction.followUp({
                        content: 'Veuillez spécifier un salon où envoyer les notifications twitch.',
                        ephemeral: true
                    })
                }
                channelSelectMenu.setDefaultChannels(channels)
                channel.set({ channelId: channels[0] })
                return collectedInteraction.followUp({
                    content: 'Le salon a été mis à jour localement avec succès.',
                    ephemeral: true
                })
        }
    }

    private _createButtons(channel: TAnnouncementChannel, type: AnnouncementType): ActionRowBuilder<ButtonBuilder | ChannelSelectMenuBuilder | StringSelectMenuBuilder>[] {
        const rows: ActionRowBuilder<ButtonBuilder | ChannelSelectMenuBuilder | StringSelectMenuBuilder>[] = []

        const isActivatedButton = new ButtonBuilder().setCustomId('isactivated').setLabel(channel.isActivated ? 'Activé' : 'Désactivé').setStyle(channel.isActivated ? ButtonStyle.Success : ButtonStyle.Danger)
        const messageAndImageModalButton = new ButtonBuilder().setCustomId('msgimg').setLabel('Message & Image').setStyle(ButtonStyle.Secondary).setDisabled(!channel.isActivated)
        const isDmsButton = new ButtonBuilder().setCustomId('isdms').setLabel(channel.dm ? 'En dms' : 'Sur le serveur').setStyle(ButtonStyle.Secondary).setDisabled(type === 'welcome' && !channel.isActivated)
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(isActivatedButton, messageAndImageModalButton, isDmsButton))
        const channelSelectMenu = new ChannelSelectMenuBuilder().setCustomId('channel').setMinValues(1).setMaxValues(1).setDefaultChannels(channel.channelId).setChannelTypes(ChannelType.GuildText).setDisabled(!channel.isActivated)
        rows.push(new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelectMenu))

        const embedEnabledButton = new ButtonBuilder().setCustomId('embedenabled').setLabel(channel.embedEnabled ? 'Embed activé' : 'Embed désactivé').setStyle(channel.embedEnabled ? ButtonStyle.Success : ButtonStyle.Danger)
        const hasTitleButton = new ButtonBuilder().setCustomId('hastitle').setLabel(channel.embed?.displayTitle ? 'Avec titre' : 'Sans titre').setStyle(channel.embed?.displayTitle ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!channel.embedEnabled)
        const hasBodyButton = new ButtonBuilder().setCustomId('hasbody').setLabel(channel.embed?.displayBody ? 'Avec description' : 'Sans description').setStyle(channel.embed?.displayBody ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!channel.embedEnabled)
        const hasImageButton = new ButtonBuilder().setCustomId('hasimage').setLabel(channel.embed?.displayImage ? 'Avec image' : 'Sans image').setStyle(channel.embed?.displayImage ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!channel.embedEnabled)
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(embedEnabledButton, hasTitleButton, hasBodyButton, hasImageButton))
        const hasThumbnailButton = new ButtonBuilder().setCustomId('hasthumbnail').setLabel(channel.embed?.displayThumbnail ? 'Avec thumbnail' : 'Sans thumbnail').setStyle(channel.embed?.displayBody ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!channel.embedEnabled)
        const hasFooterButton = new ButtonBuilder().setCustomId('hasfooter').setLabel(channel.embed?.displayFooter ? 'Avec footer' : 'Sans footer').setStyle(channel.embed?.displayFooter ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!channel.embedEnabled)
        const hasTimestampsButton = new ButtonBuilder().setCustomId('hastimestamps').setLabel(channel.embed?.displayTimestamp ? 'Avec timestamp' : 'Sans timestamp').setStyle(channel.embed?.displayTimestamp ? ButtonStyle.Success : ButtonStyle.Danger).setDisabled(!channel.embedEnabled)
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(hasThumbnailButton, hasFooterButton, hasTimestampsButton))

        const embedInfosModalButton = new ButtonBuilder().setCustomId('embedinfos').setLabel('Embed').setStyle(ButtonStyle.Secondary).setDisabled(!channel.embedEnabled)
        const addEmbedFieldModalButton = new ButtonBuilder().setCustomId('addembedfield').setLabel('Ajouter un field').setStyle(ButtonStyle.Secondary).setDisabled(!channel.embedEnabled)
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(embedInfosModalButton, addEmbedFieldModalButton))
        const removeEmbedFieldMenu = new StringSelectMenuBuilder().setCustomId('removeembedfield').setMaxValues(1).setOptions(channel.embed ? channel.embed.fields.map(field => new StringSelectMenuOptionBuilder().setLabel(field.title).setValue(`${field.id}`)) : [new StringSelectMenuOptionBuilder().setLabel('Aucune option').setValue('nooption').setDefault(true)]).setDisabled(!channel.embedEnabled && !channel.embed?.fields.length)
        rows.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(removeEmbedFieldMenu))

        const backButton = new ButtonBuilder().setCustomId('back').setEmoji('⬅️').setStyle(ButtonStyle.Primary).setDisabled(true)
        const continueButton = new ButtonBuilder().setCustomId('continue').setEmoji('➡️').setStyle(ButtonStyle.Primary).setDisabled(!channel.isActivated)
        const cancelButton = new ButtonBuilder().setCustomId('cancel').setLabel('Annuler').setStyle(ButtonStyle.Danger)
        const registerButton = new ButtonBuilder().setCustomId('register').setLabel('Enregistrer').setStyle(ButtonStyle.Success)
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(backButton, continueButton, cancelButton, registerButton))

        return rows
    }

    private async _removeAnnouncement(client: Bot, interaction: CommandInteraction, type: AnnouncementType): Promise<void | InteractionResponse> {
        client.set.add(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))

        const t = await client.database.database.transaction()

        try {
            const announcementChannel = (await client.database.AnnouncementChannel.findOne({
                where: {
                    serverId: interaction.guildId!,
                    type: type
                },
                transaction: t
            }))
            if (!announcementChannel) {
                client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
                await t.rollback()
                return interaction.reply(`Aucun salon ${responseByType[type]} n'est configuré sur ce serveur.`)
            }

            const deleteButton = new ButtonBuilder().setCustomId('delete').setLabel('Supprimer').setStyle(ButtonStyle.Danger)
            const goBackButton = new ButtonBuilder().setCustomId('goback').setLabel('Annuler').setStyle(ButtonStyle.Secondary)
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(goBackButton, deleteButton)
            const response = await interaction.reply({
                content: `Êtes vous sûr de ne plus vouloir recevoir de messages ${responseByType[type]} ? Cette action est irréversible.`,
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
                    await announcementChannel.destroy({ transaction: t })
                    await response.edit({
                        content: `Vous ne recevrez plus de messages ${responseByType[type]} sur ce serveur.`,
                        components: []
                    })
                    client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
                    await t.commit()
                }
            })
        } catch (error: any) {
            await t.rollback()
            logger.log(client, error, 'error')
            client.set.delete(JSON.stringify({ command: interaction.commandName, guildId: interaction.guildId }))
            return interaction.reply({
                content: 'Une erreur est survenue lors de l\'éxécution de l\'intéraction.',
                ephemeral: true
            })
        }
    }
}