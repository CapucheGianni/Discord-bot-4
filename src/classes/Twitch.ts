import { EmbedBuilder } from "discord.js"
import fetch from "node-fetch"

import { Logger } from "./Logger.js"

import settings from '../../settings.json' with { 'type': 'json' }
import { Bot } from "./Bot.js"

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
    private _token: string
    private _tokenExpiration: number

    constructor() {
        this._token = ''
        this._tokenExpiration = 0
        this.getTwitchToken()
    }

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
                    if (!this._isTwitchStreamResponse(data))
                        return
                } catch (error: any) {
                    logger.log(client, error, 'warn')
                }
            })
        }, 1000 * 60 * 10)
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
