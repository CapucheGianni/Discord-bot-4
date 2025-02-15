import { TAnnouncementChannel, TChannel } from './Channel'
import { TPun } from './Pun'
import { TTwitch } from './Twitch'

export type TServer = {
    id: string
    name: string
    prefix: string
    jokes: boolean
    createdAt: Date
    updatedAt: Date
    announcementChannels: TAnnouncementChannel[]
    channels: TChannel[]
    twitchNotificationChannel: TTwitch | null
    puns: TPun[]
}