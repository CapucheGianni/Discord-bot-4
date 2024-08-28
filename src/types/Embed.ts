import { ColorResolvable } from 'discord.js'
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
    color: ColorResolvable
    title: string
    displayBody: boolean
    body: string | null
    displayImage: boolean
    imageUrl: string | null
    displayFooter: boolean
    footer: string | null
    displayThumbnail: boolean
    thumbnailUrl: string | null
    displayTimestamp: boolean
    announcementChannelId: number
    fields: TEmbedField[]
    announcementChannel: TAnnouncementChannel
}