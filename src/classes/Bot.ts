import { Collection, Client, REST, Routes } from 'discord.js'
import Database from './Database.js'
import { ModuleImports } from './ModuleImports.js'
import { config } from 'dotenv'
import { getSafeEnv, isTruthy } from '../utils/TypeGuards.js'
import { Logger } from './Logger.js'

import settings from '../../package.json' assert { type: 'json' }

config()
const logger = Logger.getInstance('')

export type ExecutedCommand = {
    command: string,
    userId: string,
    guildId: string,
    type: 'command' | 'interaction'
}

export class Bot extends Client {
    public cooldowns: Collection<string, Collection<string, number>>
    public set: Set<ExecutedCommand>
    public version: string
    private _modules: ModuleImports
    private _database: Database

    constructor(client: Client, database: Database, modules: ModuleImports) {
        super(client.options)
        this._database = database
        this.cooldowns = new Collection()
        this.set = new Set()
        this._modules = modules
        this.version = settings.version
    }

    public get getServerNumber(): number {
        return this.guilds.cache.size
    }

    public get getUserNumber(): number {
        return this.users.cache.size
    }

    public get getRamUsage(): number {
        return Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100
    }

    public get database(): Database {
        return this._database
    }

    public get modules(): ModuleImports {
        return this._modules
    }

    public set modules(modules: ModuleImports) {
        this._modules = modules
    }

    public async deployInteractions(): Promise<void> {

        const rest = new REST().setToken(getSafeEnv(process.env.TOKEN, 'TOKEN'))

        try {
            const interactions = this._modules.interactions.map((interaction) => {
                if (interaction.data)
                    return interaction.data.toJSON()
            })

            logger.simpleLog('Started refreshing application (/) commands.')
            await rest.put(Routes.applicationCommands(getSafeEnv(process.env.CLIENT_ID, 'CLIENT_ID')), { body: interactions })
            logger.simpleLog('Successfully reloaded application (/) commands.')
        } catch (error) {
            logger.simpleError(Error(`An error occured while refreshing application (/) commands: ${error}`))
        }
    }
}
