import { TBot } from '../types/Bot'
import { TChannel, TAnnouncementChannel } from '../types/Channel'
import { TCommand } from '../types/Command'
import { TAnnouncementEmbed, TEmbedField } from '../types/Embed'
import { TInteraction } from '../types/Interaction'
import { TPun } from '../types/Pun'
import { TServer } from '../types/Server'
import { TTwitch } from '../types/Twitch'
import { TUser } from '../types/User'

export function getSafeEnv(key: string | undefined, name: string): string {
    if (!key)
        throw new Error(`Could not find ${name} in your environment`)
    return key
}

export function isTruthy<T>(value: T | undefined | null): value is T {
    return !!value
}

export function isString(value: unknown): value is string {
    return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number'
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean'
}

export function isObject(value: unknown): value is Record<string, unknown>{
    return typeof value === 'object'
}

export function isFunction(value: unknown): value is Function {
    return typeof value === 'function'
}

export function isServer(value: unknown): value is TServer {
    return value !== null && typeof value === 'object' &&
        typeof (value as TServer).id === 'string' &&
        typeof (value as TServer).name === 'string' &&
        typeof (value as TServer).prefix === 'string' &&
        typeof (value as TServer).jokes === 'boolean'
}

export function isServers(values: unknown): values is TServer[] {
    return Array.isArray(values) && values.every((value) => isServer(value))
}

export function isInteraction(value: unknown): value is TInteraction {
    return value !== null && typeof value === 'object' &&
        typeof (value as TInteraction).name === 'string' &&
        typeof (value as TInteraction).enabled === 'boolean'
}

export function isInteractions(values: unknown): values is TInteraction[] {
    return Array.isArray(values) && values.every((value) => isInteraction(value))
}

export function isChannel(value: unknown): value is TChannel {
    return value !== null && typeof value === 'object' &&
        typeof (value as TChannel).id === 'string' &&
        typeof (value as TChannel).name === 'string' &&
        typeof (value as TChannel).jokes === 'boolean' &&
        typeof (value as TChannel).serverId === 'string'
}

export function isChannels(values: unknown): values is TChannel[] {
    return Array.isArray(values) && values.every((value) => isChannel(value))
}

export function isAnnouncementChannel(value: unknown): value is TAnnouncementChannel {
    return value !== null && typeof value === 'object' &&
        typeof (value as TAnnouncementChannel).id === 'number' &&
        typeof (value as TAnnouncementChannel).dm === 'boolean' &&
        typeof (value as TAnnouncementChannel).isActivated === 'boolean' &&
        typeof (value as TAnnouncementChannel).embedEnabled === 'boolean' &&
        typeof (value as TAnnouncementChannel).channelId === 'string'
}

export function isAnnouncementChannels(values: unknown): values is TAnnouncementChannel[] {
    return Array.isArray(values) && values.every((value) => isAnnouncementChannel(value))
}

export function isCommand(value: unknown): value is TCommand {
    return value !== null && typeof value === 'object' &&
        typeof (value as TCommand).name === 'string' &&
        typeof (value as TCommand).enabled === 'boolean'
}

export function isCommands(values: unknown): values is TCommand[] {
    return Array.isArray(values) && values.every((value) => isCommand(value))
}

export function isEmbed(value: unknown): value is TAnnouncementEmbed {
    return value !== null && typeof value === 'object' &&
        typeof (value as TAnnouncementEmbed).id === 'number' &&
        typeof (value as TAnnouncementEmbed).color === 'string' &&
        typeof (value as TAnnouncementEmbed).displayTitle === 'boolean' &&
        typeof (value as TAnnouncementEmbed).displayBody === 'boolean' &&
        typeof (value as TAnnouncementEmbed).displayImage === 'boolean' &&
        typeof (value as TAnnouncementEmbed).displayFooter === 'boolean' &&
        typeof (value as TAnnouncementEmbed).displayThumbnail === 'boolean' &&
        typeof (value as TAnnouncementEmbed).displayTimestamp === 'boolean' &&
        typeof (value as TAnnouncementEmbed).announcementChannelId === 'number'
}

export function isEmbeds(values: unknown): values is TAnnouncementEmbed[] {
    return Array.isArray(values) && values.every((value) => isEmbed(value))
}

export function isEmbedField(value: unknown): value is TEmbedField {
    return value !== null && typeof value === 'object' &&
        typeof (value as TEmbedField).id === 'number' &&
        typeof (value as TEmbedField).title === 'string' &&
        typeof (value as TEmbedField).value === 'string' &&
        typeof (value as TEmbedField).inline === 'boolean' &&
        typeof (value as TEmbedField).embedId === 'number'
}

export function isEmbedFields(values: unknown): values is TEmbedField[] {
    return Array.isArray(values) && values.every((value) => isEmbedField(value))
}

export function isTwitch(value: unknown): value is TTwitch {
    return value !== null && typeof value === 'object' &&
        typeof (value as TTwitch).serverId === 'string' &&
        typeof (value as TTwitch).streamer === 'string' &&
        typeof (value as TTwitch).channelId === 'string' &&
        typeof (value as TTwitch).isStreaming === 'boolean' &&
        typeof (value as TTwitch).enabled === 'boolean'
}

export function isTwitchs(values: unknown): values is TTwitch[] {
    return Array.isArray(values) && values.every((value) => isTwitch(value))
}

export function isUser(value: unknown): value is TUser {
    return value !== null && typeof value === 'object' &&
        typeof (value as TUser).id === 'string' &&
        typeof (value as TUser).name === 'string' &&
        typeof (value as TUser).jokes === 'boolean' &&
        typeof (value as TUser).banned === 'boolean'
}

export function isUsers(values: unknown): values is TUser[] {
    return Array.isArray(values) && values.every((value) => isUser(value))
}

export function isBot(value: unknown): value is TBot {
    return value !== null && typeof value === 'object' &&
        typeof (value as TBot).id === 'string' &&
        typeof (value as TBot).maintenance === 'boolean'
}

export function isPun(value: unknown): value is TPun {
    return value !== null && typeof value === 'object' &&
        typeof (value as TPun).id === 'number' &&
        typeof (value as TPun).toFind === 'string' &&
        typeof (value as TPun).toAnswer === 'string' &&
        typeof (value as TPun).type === 'string' &&
        typeof (value as TPun).serverId === 'string'
}

export function isPuns(values: unknown): values is TPun[] {
    return Array.isArray(values) && values.every(value => isPun(value))
}
