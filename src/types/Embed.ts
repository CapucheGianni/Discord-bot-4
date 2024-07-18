import { TAnnouncementChannel } from './Channel'

export type TEmbedField = {
    id: number
    title: string
    value: string
    inline: boolean
    embedId: number
    Embed: TAnnouncementEmbed
}

export type TAnnouncementEmbed = {
    id: number
    color: string
    displayTitle: boolean
    title?: string
    displayBody: boolean
    body?: string
    displayImage: boolean
    imageUrl?: string
    displayFooter: boolean
    footer?: string
    displayThumbnail: boolean
    thumbnailUrl?: string
    displayTimestamp: boolean
    fields?: TEmbedField[]
    announcementChannelId: number
    announcementChannel: TAnnouncementChannel
}