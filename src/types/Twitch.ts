import { TServer } from './Server'
import { TChannel } from './Channel'

export type TTwitch = {
    serverId: string
    streamer: string
    channelId: string
    roleId?: string
    message?: string
    updateMessage?: string
    isStreaming: boolean
    title?: string
    game?: string
    enabled: boolean
    server: TServer
    channel: TChannel
}