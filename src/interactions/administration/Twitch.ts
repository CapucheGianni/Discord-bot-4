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
    ButtonInteraction
} from 'discord.js'
import { InteractionDecorator } from '../../utils/Decorators.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { Logger } from '../../classes/Logger.js'
import { TTwitch } from '../../types/Twitch.js'

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
        if (client.set.has(JSON.stringify({ command: 'twitch', genericId: interaction.guildId! }))) {
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
        try {
            const notification = (await client.database.TwitchNotification.findByPk(interaction.guildId!))?.get()

        } catch (error: any) {
            logger.log(client, error, 'error')
            interaction.reply({
                content: 'Une erreur est survenue lors de l\'éxécution de l\'intéraction.',
                ephemeral: true
            })
        }
    }

    private async _removeTwitchNotification(client: Bot, interaction: CommandInteraction): Promise<any> {
        client.set.add(JSON.stringify({ command: 'twitch', genericId: interaction.guildId! }))
        try {
            const notification = (await client.database.TwitchNotification.findByPk(interaction.guildId!))
            if (!notification)
                return interaction.reply('Aucune notification twitch n\'est configurée sur ce serveur.')

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

            collector.on('collect', async interactionCollector => {
                interactionCollector.deferUpdate()
                button.push(interactionCollector)
            })
            collector.on('end', async () => {
                if (!button.length || button[0].customId === 'goback') {
                    client.set.delete(JSON.stringify({ command: 'twitch', genericId: interaction.guildId! }))
                    return response.edit({
                        content: 'Vous avez annulé l\'opération.',
                        components: []
                    })
                }
                if (button.length && button[0].customId === 'delete') {
                    await notification.destroy()
                    response.edit({
                        content: 'Vous ne recevrez plus de notifications sur ce serveur.',
                        components: []
                    })
                    client.set.delete(JSON.stringify({ command: 'twitch', genericId: interaction.guildId! }))
                }
            })
        } catch (error: any) {
            logger.log(client, error, 'error')
            interaction.reply({
                content: 'Une erreur est survenue lors de l\'éxécution de l\'intéraction.',
                ephemeral: true
            })
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