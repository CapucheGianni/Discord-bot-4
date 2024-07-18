import { TAnnouncementEmbed } from './Embed'
import { TServer } from './Server'
import { TTwitch } from './Twitch'

export type TAnnouncementChannel = {
    id: number
    message?: string
    dm: boolean
    isActivated: boolean
    embedEnabled: boolean
    imageUrl?: string
    channelId: string
    channel: TChannel
    embed?: TAnnouncementEmbed
}

export type TChannel = {
    id: string
    name: string
    jokes: boolean
    createdAt: Date
    updatedAt: Date
    serverId: string
    welcomeChannelId?: string
    leaveChannelId?: string
    server: TServer
    welcomeChannel?: TAnnouncementChannel
    leaveChannel?: TAnnouncementChannel
    announcementChannel?: TAnnouncementChannel[]
    twitchNotification?: TTwitch
}