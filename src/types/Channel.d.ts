import { TAnnouncementEmbed } from './Embed'
import { TServer } from './Server'
import { TTwitch } from './Twitch'

export type TAnnouncementChannel = {
    id: number
    message: string | null
    dm: boolean
    isActivated: boolean
    embedEnabled: boolean
    imageUrl: string | null
    channelId: string
    type: 'welcome' | 'leave' | 'ban'
    serverId: string
    embed: TAnnouncementEmbed | null
    channel: TChannel
    server: TServer
}

export type TChannel = {
    id: string
    name: string
    jokes: boolean
    createdAt: Date
    updatedAt: Date
    serverId: string
    server: TServer
    announcements: TAnnouncementChannel[]
    twitchNotification: TTwitch | null
}