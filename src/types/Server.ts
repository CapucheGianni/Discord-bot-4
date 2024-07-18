import { TAnnouncementChannel, TChannel } from './Channel'
import { TTwitch } from './Twitch'

export type TServer = {
    id: string
    name: string
    prefix: string
    jokes: boolean
    createdAt: Date
    updatedAt: Date
    welcomeChannelId?: string
    leaveChannelId?: string
    welcomeChannel?: TAnnouncementChannel
    leaveChannel?: TAnnouncementChannel
    channels?: TChannel[]
    twitchNotificationChannel?: TTwitch
}