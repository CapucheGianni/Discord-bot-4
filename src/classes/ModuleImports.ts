import 'reflect-metadata'
import { glob } from 'glob'
import {
    Collection,
    PermissionsString,
    SlashCommandBuilder,
    AutocompleteInteraction
} from 'discord.js'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { Bot } from './Bot.js'
import { TDiscordEvents, TEventType } from '../types/DiscordEvents.js'
import { getMetadata } from '../utils/Decorators.js'
import { TCategory } from '../types/Command.js'
import { Logger } from './Logger.js'
import Database from './Database.js'

const logger = Logger.getInstance('')

export abstract class Module {
    public abstract name: string
    public abstract execute(client: Bot, ...args: any[]): Promise<void>
}

export abstract class CommandModule extends Module {
    public name: string = ''
    public description!: string
    public cooldown!: number
    public permissions!: PermissionsString[]
    public category!: TCategory
    public usage!: string
    public aliases!: string[]

    constructor() {
        super()
        Object.keys(this).forEach(key => {
            const optionKey = key as keyof typeof this
            this[optionKey] = getMetadata(optionKey, this.constructor)
        })
    }
}

export abstract class EventModule extends Module {
    public name: TDiscordEvents = 'raw'
    public eventType!: TEventType

    constructor() {
        super()
        Object.keys(this).forEach(key => {
            const optionKey = key as keyof typeof this
            this[optionKey] = getMetadata(optionKey, this.constructor)
        })
    }
}

export abstract class InteractionModule extends Module {
    public name: string = ''
    public description!: string
    public cooldown!: number
    public category!: TCategory
    public usage!: string
    public data!: SlashCommandBuilder

    constructor() {
        super()
        Object.keys(this).forEach(key => {
            const optionKey = key as keyof typeof this
            this[optionKey] = getMetadata(optionKey, this.constructor)
        })
    }

    public abstract autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void>
}

export class ModuleImports {
    private _commands: Collection<string, CommandModule> = new Collection()
    private _interactions: Collection<string, InteractionModule> = new Collection()
    private _events: Collection<string, EventModule> = new Collection()

    public async loadModules() {
        const filePath = fileURLToPath(import.meta.url)
        const srcDirPath = path.join(filePath, '..', '..', '..')
        const modulePaths = await glob(`${srcDirPath}/build/{events,commands,interactions}/**/*.{ts,js}`)

        for (const path of modulePaths) {
            const module = await import(pathToFileURL(path).href)
            if (module.default) {
                const instance: Module = new module.default()

                if (instance instanceof CommandModule)
                    this._commands.set(instance.name, instance)
                if (instance instanceof EventModule)
                    this._events.set(instance.name, instance)
                if (instance instanceof InteractionModule)
                    this._interactions.set(instance.name, instance)
            }
        }
    }

    public get commands(): Collection<string, CommandModule> {
        return this._commands
    }

    public get interactions(): Collection<string, InteractionModule> {
        return this._interactions
    }

    public get events(): Collection<string, EventModule> {
        return this._events
    }

    public eventListener(client: Bot) {
        for (const [eventName, eventModule] of this._events) {
            if (eventModule.eventType === 'once')
                client.once(eventName, (...args) => eventModule.execute(client, ...args))
            else
                client.on(eventName, (...args) => eventModule.execute(client, ...args))
        }
    }

    public async upsertInteractionsIntoDb(db: Database): Promise<void> {
        const t = await db.database.transaction()

        try {
            for (const [interactionName, interactionModule] of this._interactions) {
                await db.Interaction.upsert(
                    { name: interactionName },
                    { transaction: t }
                )
            }
            await t.commit()
        } catch (error: any) {
            await t.rollback()
            logger.simpleError(error)
        }
    }

    public async upsertCommandsIntoDb(db: Database): Promise<void> {
        const t = await db.database.transaction()

        try {
            for (const [commandName, commandModule] of this._commands) {
                await db.Command.upsert(
                    { name: commandName },
                    { transaction: t }
                )
            }
            await t.commit()
        } catch (error: any) {
            await t.rollback()
            logger.simpleError(error)
        }
    }
}