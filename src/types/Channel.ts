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
    channel: TChannel
    embed: TAnnouncementEmbed | null
}

export type TChannel = {
    id: string
    name: string
    jokes: boolean
    createdAt: Date
    updatedAt: Date
    serverId: string
    welcomeChannelId: string | null
    leaveChannelId: string | null
    server: TServer
    welcomeChannel: TAnnouncementChannel | null
    leaveChannel: TAnnouncementChannel | null
    announcementChannel: TAnnouncementChannel[]
    twitchNotification: TTwitch | null
}