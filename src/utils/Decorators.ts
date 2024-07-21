import { TDiscordEvents, TEventType } from '../types/DiscordEvents.js'
import { PermissionsString, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js'
import { CommandModule } from '../classes/ModuleImports.js'
import { TCategory } from '../types/Command.js'

interface event {
    name: TDiscordEvents
    eventType: TEventType
}

interface command {
    name: string
    description: string
    cooldown: number
    permissions: PermissionsString[]
    category: TCategory
    usage: string
    aliases: string[]
}

interface interaction {
    name: string
    description: string
    cooldown: number
    category: TCategory
    usage: string
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
}

const addMetadata = (metadataKey: string, metadataValue: any) => {
    return (constructor: Function) => {
        Reflect.defineMetadata(metadataKey, metadataValue, constructor)
    }
}

export const getMetadata = (key: any, constructor: Function) => {
    return Reflect.getMetadata(key, constructor)
}

export const EventDecorator = (options: event) => {
    return (constructor: Function) => {
        addMetadata('type', 'event')(constructor)
        Object.keys(options).forEach(key => {
            const optionKey = key as keyof typeof options
            addMetadata(key, options[optionKey])(constructor)
        })
    }
}

export const CommandDecorator = (options: command) => {
    return (constructor: typeof CommandModule) => {
        addMetadata('type', 'command')(constructor)
        Object.keys(options).forEach(key => {
            const optionKey = key as keyof typeof options
            addMetadata(key, options[optionKey])(constructor)
        })
    }
}

export const InteractionDecorator = (options: interaction) => {
    return (constructor: Function) => {
        addMetadata('type', 'interaction')(constructor)
        Object.keys(options).forEach(key => {
            const optionKey = key as keyof typeof options
            addMetadata(key, options[optionKey])(constructor)
        })
    }
}