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
    title: string | null
    displayBody: boolean
    body: string | null
    displayImage: boolean
    imageUrl: string | null
    displayFooter: boolean
    footer: string | null
    displayThumbnail: boolean
    thumbnailUrl?: string
    displayTimestamp: boolean
    fields: TEmbedField[]
    announcementChannelId: number
    announcementChannel: TAnnouncementChannel
}