import {
    EmbedBuilder,
    Interaction,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    GuildMember,
    Collection
} from 'discord.js'

import { Bot } from '../classes/Bot.js'
import { Logger } from '../classes/Logger.js'
import { EventModule, InteractionModule } from '../classes/ModuleImports.js'
import { EventDecorator } from '../utils/Decorators.js'
import { isInteraction, isBot, getSafeEnv } from '../utils/TypeGuards.js'

const logger = Logger.getInstance('')

@EventDecorator({
    name: 'interactionCreate',
    eventType: 'on'
})
export default class InteractionCreate extends EventModule {
    public async execute(client: Bot, interaction: Interaction) {
        if (interaction.isAutocomplete())
            this._handleAutocomplete(client, interaction)
        if (interaction.isChatInputCommand()) {
            this._executeInteraction(client, interaction)
        }
    }

    private async _executeInteraction(client: Bot, interaction: ChatInputCommandInteraction): Promise<void> {
        await client.database.addServerFromInteraction(interaction)
        await client.database.addChannelFromInteraction(interaction)
        await client.database.addUserFromInteraction(interaction)

        try {
            if (await this._botIsInMaintenance(client)) {
                interaction.reply(`${client.user?.username} n'est pas disponible pour le moment`)
                return
            }

            const interactionInDb = (await client.database.Interaction.findByPk(interaction.commandName))?.get()
            if (!isInteraction(interactionInDb)) {
                interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de la commande.' })
                return logger.log(client, `Interaction ${interaction.commandName} not found in database.`, 'warn')
            }
            if (!interactionInDb.enabled) {
                interaction.reply({ content: 'Cette intéraction est désactivée.' })
                return
            }

            const interactionCommand = client.modules.interactions.get(interactionInDb.name)
            if (!interactionCommand || !client.user) {
                interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de l\'intéraction.' })
                return
            }

            if (!this._getCooldown(client.cooldowns, interaction, interactionCommand))
                return
            if (!this._hasPermissions(interaction.member as GuildMember | null, interactionCommand)) {
                interaction.reply(`Vous n'avez pas les permissions nécessaires pour éxécuter la commande ${interactionCommand.name}.`)
                return
            }

            await interactionCommand.execute(client, interaction)
            logger.simpleLog(`${interaction.user.username} executed the ${interactionCommand.name} interaction in ${interaction.channelId}.`)
            logger.logDiscordEmbed(client, new EmbedBuilder()
                .setTitle('Intéraction exécutée ✅')
                .setDescription(`**Auteur:** ${interaction.user} (${interaction.user.id})\n**Salon:** ${interaction.channel} (${interaction.channelId})\n**Serveur:** ${interaction.guild} (${interaction.guildId})\n**Interaction:** ${interaction.commandName}`)
                .setFooter({
                    text: `Interaction exécutée par ${interaction.user.username} | ${client.user?.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()
                .setColor(`#00ff00`)
            )
        } catch (error: any) {
            logger.simpleError(error)
            logger.logDiscordEmbed(client, new EmbedBuilder()
                .setTitle(`Erreur lors de l'éxécution de l'intéraction ${interaction.commandName} ❌`)
                .setDescription(`\`\`\`${error}\`\`\``)
                .setFooter({
                    text: `Intéraction exécutée par ${interaction.user.username} | ${client.user?.username}`,
                    iconURL: client.user?.displayAvatarURL()
                })
                .setColor('#ff0000')
                .setTimestamp()
            )
            interaction.reply({
                content: 'Une erreur est survenue lors de l\'exécution de l\'intéraction.',
                ephemeral: true
            })
        }
    }

    private async _handleAutocomplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> {
        if (!interaction.guild || !interaction.channel)
            return

        await client.database.addUserFromInteraction(interaction)

        try {
            const interactionInDb = (await client.database.Interaction.findByPk(interaction.commandName))?.get()
            if (!isInteraction(interactionInDb))
                return
            if (!interactionInDb.enabled)
                return

            const interactionCommand = client.modules.interactions.get(interactionInDb.name)
            if (!interactionCommand || !client.user)
                return

            await interactionCommand.autoComplete(client, interaction)
        } catch (error: any) {
            logger.simpleError(error)
        }
    }

    private async _botIsInMaintenance(client: Bot): Promise<boolean> {
        const bot = (await client.database.Bot.findByPk(client.user?.id))?.get()

        return (isBot(bot) && bot.maintenance)
    }

    private _hasPermissions(member: GuildMember | null, interaction: InteractionModule): boolean {
        if (!member || member.id === getSafeEnv(process.env.OWNER_ID, 'OWNER_ID') || !interaction.data.default_member_permissions)
            return true
        if (interaction.category === 'owner')
            return false
        if (!member.permissions.has(BigInt(interaction.data.default_member_permissions)))
            return false
        return true
    }

    private _getCooldown(cooldowns: Collection<string, Collection<string, number>>, interaction: ChatInputCommandInteraction, interactionMod: InteractionModule): boolean {
        if (!cooldowns.has(interactionMod.name))
            cooldowns.set(interactionMod.name, new Collection())

        const now = Date.now()
        const commandTimestamps = cooldowns.get(interactionMod.name)
        const cooldown = interactionMod.cooldown * 1000

        if (commandTimestamps?.has(interaction.user.id)) {
            const timestamp = commandTimestamps.get(interaction.user.id)

            if (timestamp) {
                const expirationTime = timestamp + cooldown
                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000)

                    interaction.reply({
                        content: `Veuillez attendre <t:${expiredTimestamp}:R> avant de pouvoir effectuer la commande à nouveau.`,
                        ephemeral: true
                    })
                    return false
                }
            }
        }
        commandTimestamps?.set(interaction.user.id, now)
        setTimeout(() => commandTimestamps?.delete(interaction.user.id), cooldown * 1000)
        return true
    }
}