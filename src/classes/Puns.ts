import { Message } from "discord.js"

import Bot from "./Bot.js"
import Logger from "./Logger.js"

import { isUser, isChannel, isServer } from "../utils/TypeGuards.js"

const logger = Logger.getInstance('')

export default class Puns {
    public async getPun(client: Bot, message: Message): Promise<void> {
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

        const matchingPuns = punsEndsWith.filter(pun => pun.toFind === lastWord.toLowerCase())

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

        const matchingPuns = punsIncludes.filter(pun => messageAsArray.map(word => word.toLowerCase()).includes(pun.toFind))

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

        const matchingPuns = punsStartsWith.filter(pun => pun.toFind === firstWord.toLowerCase())

        if (matchingPuns.length > 0) {
            const randomPun = matchingPuns[Math.floor(Math.random() * matchingPuns.length)]

            await message.reply(randomPun.toAnswer)
            return true
        }
        return false
    }
}