import {
    Message,
    User,
    EmbedBuilder,
    GuildMember,
    Collection
} from 'discord.js'

import { Bot } from '../classes/Bot.js'
import { Logger } from '../classes/Logger.js'
import { CommandModule, EventModule } from '../classes/ModuleImports.js'
import { EventDecorator } from '../utils/Decorators.js'
import {
    getSafeEnv,
    isBot,
    isChannel,
    isServer,
    isTruthy,
    isUser
} from '../utils/TypeGuards.js'

const logger = Logger.getInstance('')

@EventDecorator({
    name: 'messageCreate',
    eventType: 'on'
})
export default class MessageCreate extends EventModule {
    public async execute(client: Bot, message: Message): Promise<void> {
        if (!message.guild || !message.guildId || message.author.bot || !client.user)
            return

        try {
            await client.database.addServerFromMessage(message)
            await client.database.addChannelFromMessage(message)
            await client.database.addUserFromMessage(message)

            if (await this._botIsInMaintenance(client)) {
                message.reply(`${client.user?.username} n'est pas disponible pour le moment`)
                return
            }

            const prefix: string = (await client.database.getGuild(message.guildId)).prefix
            if (this._detectName(client.user, message, prefix))
                return
            if (!message.content.startsWith(prefix) && !message.content.startsWith(client.user?.username.toLowerCase())) {
                this._getPun(client, message)
                return
            }

            const usingPrefix: boolean = !message.content.startsWith(client.user.username.toLowerCase())
            const args: string[] = message.content.slice(usingPrefix ? prefix.length : client.user.username.length).trim().split(/ +/g)
            const commandName: string | undefined = args.shift()?.toLowerCase()
            if (!isTruthy(commandName))
                return

            const command = client.modules.commands.get(commandName) ?? client.modules.commands.find((cmd) => cmd.aliases.includes(commandName))
            if (!command)
                return

            const commandFromDb = await client.database.Command.findByPk(command.name)
            if (!commandFromDb || !commandFromDb.get().enabled) {
                await message.reply('Cette commande est désactivée.')
                return
            }
            if (!this._getCooldown(client.cooldowns, message, command))
                return
            if (!message.member || !this._hasPermissions(message.member, command)) {
                message.reply(`Vous n'avez pas les permissions nécessaires pour éxécuter la commande ${command.name}.`)
                return
            }

            await command.execute(client, message, args)

            logger.simpleLog(`${message.author.username} executed the ${commandName} command in ${message.channelId}.`)
            logger.logDiscordEmbed(client, new EmbedBuilder()
                .setTitle('Commande exécutée ✅')
                .setDescription(`**Auteur:** ${message.author} (${message.author.id})\n**Salon:** ${message.channel} (${message.channel.id})\n**Serveur:** ${message.guild} (${message.guild.id})\n**commande:** ${commandName}`)
                .setFooter({
                    text: `Commande exécutée par ${message.author.username} | ${client.user.username}`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp()
                .setColor(`#00ff00`)
            )
        } catch (error: any) {
            logger.simpleError(error)
            logger.logDiscordEmbed(client, new EmbedBuilder()
                .setTitle(`Une erreur est survenue ❌`)
                .setFields({
                    name: 'Message',
                    value: message.content
                })
                .setDescription(`\`\`\`${error}\`\`\``)
                .setFooter({
                    text: `Message envoyé par ${message.author.username} | ${client.user.username}`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setColor('#ff0000')
                .setTimestamp()
            )
        }
    }

    private _detectName(user: User, message: Message, prefix: string): boolean {
        if (message.content.toLowerCase() === user.username.toLowerCase()) {
            message.channel.send(`Bonjour!\n\nJe suis **${user.username}** le bot du goat __capuchegianni__.\nLe préfixe du bot est \`${prefix}\` mais il est tout à fait possible de le modifier.\nFaites \`/help prefix\` pour plus d'informations.`)
            return true
        }
        return false
    }

    private async _botIsInMaintenance(client: Bot): Promise<boolean> {
        const bot = (await client.database.Bot.findByPk(client.user?.id))?.get()

        return (isBot(bot) && bot.maintenance)
    }

    private _hasPermissions(member: GuildMember, command: CommandModule): boolean {
        if (member.id === getSafeEnv(process.env.OWNER_ID, 'OWNER_ID') || !command.permissions.length)
            return true
        if (command.category === 'owner')
            return false
        for (const permission of command.permissions) {
            if (!member.permissions.has(permission))
                return false
        }
        return true
    }

    private _getCooldown(cooldowns: Collection<string, Collection<string, number>>, message: Message, command: CommandModule): boolean {
        if (!cooldowns.has(command.name))
            cooldowns.set(command.name, new Collection())

        const now = Date.now()
        const commandTimestamps = cooldowns.get(command.name)
        const cooldown = command.cooldown * 1000

        if (commandTimestamps?.has(message.author.id)) {
            const timestamp = commandTimestamps.get(message.author.id)

            if (timestamp) {
                const expirationTime = timestamp + cooldown
                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000)

                    message.reply(`Veuillez attendre <t:${expiredTimestamp}:R> avant de pouvoir effectuer la commande à nouveau.`)
                    return false
                }
            }
        }
        commandTimestamps?.set(message.author.id, now)
        setTimeout(() => commandTimestamps?.delete(message.author.id), cooldown)
        return true
    }

    private async _getPun(client: Bot, message: Message): Promise<void> {
        try {
            const user = (await client.database.User.findByPk(message.author.id))?.get()
            const channel = (await client.database.Channel.findByPk(message.channelId))?.get()
            const server = (await client.database.Server.findByPk(message.guildId!))?.get()

            if (!isUser(user) || !isChannel(channel) || !isServer(server))
                return
            if (!user.jokes || !channel.jokes || !server.jokes)
                return

            const messageAsArray = message.content.replace(/[,.[\]\/#!?$%\^&\*;:{}=_`~()\\]/g, '').trim().split(' ')
            const firstWord = messageAsArray[0]
            const lastWord = messageAsArray.reverse()[0]

            if (await this._endsWith(client, message, lastWord))
                return
            if (await this._includes(client, message, messageAsArray))
                return
            await this._startsWith(client, message, firstWord)
        } catch (error: any) {
            logger.log(client, error, 'error')
        }
    }

    private async _endsWith(client: Bot, message: Message, lastWord: string): Promise<boolean> {
        const punsEndsWith = (await client.database.Pun.findAll({
            where: {
                serverId: message.guildId!,
                type: 'endsWith'
            }
        })).map(pun => pun.get())
        if (!punsEndsWith || !punsEndsWith.length)
            return false

        const matchingPuns = punsEndsWith.filter(pun => pun.toFind === lastWord)

        if (matchingPuns.length > 0) {
            const randomPun = matchingPuns[Math.floor(Math.random() * matchingPuns.length)]

            await message.reply(randomPun.toAnswer)
            return true
        }
        return false
    }

    private async _includes(client: Bot, message: Message, messageAsArray: string[]): Promise<boolean> {
        const punsIncludes = (await client.database.Pun.findAll({
            where: {
                serverId: message.guildId!,
                type: 'includes'
            }
        })).map(pun => pun.get())
        if (!punsIncludes || !punsIncludes.length)
            return false

        const matchingPuns = punsIncludes.filter(pun => messageAsArray.includes(pun.toFind))

        if (matchingPuns.length > 0) {
            const randomPun = matchingPuns[Math.floor(Math.random() * matchingPuns.length)]

            await message.reply(randomPun.toAnswer)
            return true
        }
        return false
    }

    private async _startsWith(client: Bot, message: Message, firstWord: string): Promise<boolean> {
        const punsStartsWith = (await client.database.Pun.findAll({
            where: {
                serverId: message.guildId!,
                type: 'startsWith'
            }
        })).map(pun => pun.get())
        if (!punsStartsWith || !punsStartsWith.length)
            return false

        const matchingPuns = punsStartsWith.filter(pun => pun.toFind === firstWord)

        if (matchingPuns.length > 0) {
            const randomPun = matchingPuns[Math.floor(Math.random() * matchingPuns.length)]

            await message.reply(randomPun.toAnswer)
            return true
        }
        return false
    }
}