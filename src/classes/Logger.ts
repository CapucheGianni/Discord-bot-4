import { Client, ColorResolvable, EmbedBuilder } from 'discord.js'
import { Bot } from './Bot.js'
import { isChannel } from '../utils/TypeGuards.js'

export class Logger {
    private static _instance: Logger
    private _logChannelId: string
    private _hideLogs: boolean

    private constructor(logChannelId: string, hideLogs: boolean = false) {
        this._logChannelId = logChannelId
        this._hideLogs = hideLogs
    }

    public static getInstance(logChannelId: string, hideLogs: boolean = false): Logger {
        if (!Logger._instance)
            Logger._instance = new Logger(logChannelId, hideLogs)
        return Logger._instance
    }

    public log(
        client: Bot | Client,
        message: string,
        type: 'info' | 'warn' | 'error',
        isLoggable: boolean = true,
        isThrowable: boolean = false,
        sendAsEmbed: boolean = true,
        timestamp: Date = new Date(),
    ): void {
        if (isLoggable && !this._hideLogs) {
            switch (type) {
                case 'info':
                    console.log(`[${timestamp.toISOString().slice(0, 10)} ${timestamp.toTimeString().slice(0, 8)}][INFO]: ${message}`)
                    if (sendAsEmbed)
                        this._logAsEmbed(client, Error(message), 'Info', 'LightGrey')
                    break
                case 'warn':
                    console.warn(`[${timestamp.toISOString().slice(0, 10)} ${timestamp.toTimeString().slice(0, 8)}][WARN]: ${message}`)
                    if (sendAsEmbed)
                        this._logAsEmbed(client, Error(message), 'Warning', 'Orange')
                    break
                case 'error':
                    console.error(`[${timestamp.toISOString().slice(0, 10)} ${timestamp.toTimeString().slice(0, 8)}][ERROR]: ${message}`)
                    if (sendAsEmbed)
                        this._logAsEmbed(client, Error(message), 'Error', 'Red')
                    break
            }
        }
        if (isThrowable)
            throw Error(message)
    }

    public simpleError(error: Error, isLoggable: boolean = true): void {
        if (isLoggable) {
            console.error(`[${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 8)}][ERROR]: ${error}`)
        }
    }

    public simpleLog(message: string, isLoggable: boolean = true): void {
        if (isLoggable)
            console.log(`[${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 8)}][INFO]: ${message}`)
    }

    public logDiscordEmbed(client: Bot | Client, embed: EmbedBuilder): void {
        const channel = client.channels.cache.get(this._logChannelId)

        if (!channel || !channel.isTextBased())
            return
        channel.send({ embeds: [embed] })
    }

    private _logAsEmbed(client: Bot | Client, error: Error, type: string, color: ColorResolvable): void {
        const embed = new EmbedBuilder()
            .setTitle(type)
            .setDescription(`\`\`\`${error}\`\`\``)
            .setColor(color)
            .setTimestamp()
        const channel = client.channels.cache.get(this._logChannelId)

        if (!isChannel(channel) || !channel.isTextBased())
            return
        channel.send({ embeds: [embed] })
    }
}
