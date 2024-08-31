import { EmbedBuilder } from 'discord.js'
import fetch from 'node-fetch'
import { Model } from 'sequelize'

import { Bot } from './Bot.js'
import { Logger } from './Logger.js'
import { TTwitch } from '../types/Twitch.js'
import { isTruthy } from '../utils/TypeGuards.js'

import settings from '../../settings.json' with { 'type': 'json' }

const logger = Logger.getInstance('')

type TwitchTokenResponse = {
    access_token: string
    expires_in: number
    token_type: string
}

type TwitchStreamResponse = {
    id: string
    user_id: string
    user_login: string
    user_name: string
    game_id: string
    game_name: string
    type: string
    title: string
    tags: string[]
    viewer_count: number
    started_at: string
    language: string
    thumbnail_url: string
    tag_ids: []
    is_mature: boolean
}

export default class Twitch {
    private _token: string = ''
    private _tokenExpiration: number = 0

    constructor() { }

    public async getTwitchToken(): Promise<void> {
        try {
            const TWITCH_TOKEN_API_URL = 'https://id.twitch.tv/oauth2/token'
            const params: URLSearchParams = new URLSearchParams()
            params.append('client_id', settings.twitch.TWITCH_CLIENT_ID)
            params.append('client_secret', settings.twitch.TWITCH_CLIENT_SECRET)
            params.append('grant_type', 'client_credentials')

            const response = await fetch(TWITCH_TOKEN_API_URL, {
                method: 'POST',
                body: params
            })
            const jsonRes = await response.json()
            if (!response.ok)
                throw Error(response.statusText + response.status)
            if (!this._isTwitchTokenResponse(jsonRes))
                throw Error('Invalid data returned by Twitch.')

            this._token = jsonRes.access_token
            this._tokenExpiration = Date.now() / 1000 + jsonRes.expires_in
        } catch (error: any) {
            logger.simpleError(error)
        }
    }

    public async getTwitchStreams(client: Bot): Promise<void> {
        setInterval(async () => {
            const twitchNotifications = await client.database.TwitchNotification.findAll({
                where: { enabled: true }
            })
            const headers = {
                'Client-ID': settings.twitch.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'application/json'
            }

            if (Date.now() / 1000 >= this._tokenExpiration)
                await this.getTwitchToken()

            twitchNotifications.forEach(async twitchNotification => {
                try {
                    const TWITCH_STREAMS_API_URL = 'https://api.twitch.tv/helix/streams'
                    const params: URLSearchParams = new URLSearchParams()
                    params.append('user_login', twitchNotification.get().streamer)
                    const urlWithParams = `${TWITCH_STREAMS_API_URL}?${params.toString()}`

                    const response = await fetch(urlWithParams, {
                        method: 'GET',
                        headers
                    })
                    if (!response.ok)
                        throw Error(response.statusText + response.status)

                    const jsonRes = (await response.json() as any).data
                    if (!Array.isArray(jsonRes))
                        return

                    const data = jsonRes[0]
                    if (!this._isTwitchStreamResponse(data)) {
                        return twitchNotification.update({
                            isStreaming: false,
                            title: null,
                            game: null
                        })
                    }
                    this._sendWhenStreaming(client, data, twitchNotification)
                } catch (error: any) {
                    logger.log(client, error, 'warn')
                }
            })
        }, 1000 * 60 * 10)
    }

    private async _sendWhenStreaming(client: Bot, data: TwitchStreamResponse, twitchNotification: Model<TTwitch, any>): Promise<void> {
        const embed = this._setEmbed(client, data)

        if (!twitchNotification.get().isStreaming)
            await this._sendMessage(client, twitchNotification.get(), data, embed, 'message')
        else
            if (twitchNotification.get().title !== data.title || twitchNotification.get().game !== data.game_name)
                await this._sendMessage(client, twitchNotification.get(), data, embed, 'updateMessage')
        await twitchNotification.update({
            isStreaming: true,
            title: data.title,
            game: data.game_name
        })
    }

    private async _sendMessage(client: Bot, twitchNotification: TTwitch, data: TwitchStreamResponse, embed: EmbedBuilder, type: 'message' | 'updateMessage'): Promise<void> {
        const message = twitchNotification[type]?.replaceAll('{streamer}', data.user_name).replaceAll('{game}', data.game_name)
        const channel = client.channels.cache.get(twitchNotification.channelId)

        if (!isTruthy(channel) || !channel.isTextBased())
            throw Error('Could not send the message in the picked channel.')
        await channel.send({
            content: twitchNotification.roleId ? `||<@${twitchNotification.roleId}>||\n\n${message}` : message,
            embeds: [embed],
            allowedMentions: { parse: ['roles'] }
        })
    }

    private _setEmbed(client: Bot, data: TwitchStreamResponse): EmbedBuilder {
        const { title, viewer_count, game_name, user_login, user_name, tags } = data

        return new EmbedBuilder()
            .setTitle(title)
            .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${user_login}-1920x1080.jpg?cacheBypass=${Date.now()}`)
            .addFields(
                {
                    name: 'Viewers',
                    value: `${viewer_count}`,
                    inline: true
                },
                {
                    name: 'Lien',
                    value: `https://twitch.tv/${user_login}`,
                    inline: true
                },
                {
                    name: 'Jeu',
                    value: `${game_name}`,
                    inline: true
                },
                {
                    name: 'Tags',
                    value: tags.join(' / ') || 'Aucun tag configuré',
                }
            )
            .setFooter({
                text: `${user_name} est en live | ${client.user?.username}`,
                iconURL: client.user?.displayAvatarURL()
            })
            .setTimestamp()
            .setColor('#6441a5')
    }

    private _isTwitchTokenResponse(res: unknown): res is TwitchTokenResponse {
        return typeof res === 'object' &&
            typeof (res as TwitchTokenResponse).access_token === 'string' &&
            typeof (res as TwitchTokenResponse).expires_in === 'number' &&
            typeof (res as TwitchTokenResponse).token_type === 'string'
    }

    private _isTwitchStreamResponse(res: unknown): res is TwitchStreamResponse {
        return typeof res === 'object' &&
            typeof (res as TwitchStreamResponse).id === 'string' &&
            typeof (res as TwitchStreamResponse).user_id === 'string' &&
            typeof (res as TwitchStreamResponse).user_login === 'string' &&
            typeof (res as TwitchStreamResponse).user_name === 'string' &&
            typeof (res as TwitchStreamResponse).game_id === 'string' &&
            typeof (res as TwitchStreamResponse).game_name === 'string' &&
            typeof (res as TwitchStreamResponse).type === 'string' &&
            typeof (res as TwitchStreamResponse).title === 'string' &&
            typeof (res as TwitchStreamResponse).viewer_count === 'number' &&
            typeof (res as TwitchStreamResponse).started_at === 'string' &&
            typeof (res as TwitchStreamResponse).language === 'string' &&
            typeof (res as TwitchStreamResponse).thumbnail_url === 'string' &&
            typeof (res as TwitchStreamResponse).is_mature === 'boolean'
    }
}
