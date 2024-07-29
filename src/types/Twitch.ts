import { TServer } from './Server'
import { TChannel } from './Channel'

export type TTwitch = {
    serverId: string
    streamer: string
    channelId: string
    roleId: string | null
    message: string | null
    updateMessage: string | null
    isStreaming: boolean
    title: string | null
    game: string | null
    enabled: boolean
    server: TServer
    channel: TChannel
}