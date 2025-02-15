import {
    Collection,
    Client,
    REST,
    Routes,
} from 'discord.js'
import { config } from 'dotenv'

import Database from './Database.js'
import Logger from './Logger.js'
import ModuleImports from './ModuleImports.js'
import { getSafeEnv } from '../utils/TypeGuards.js'

import settings from '../../package.json' with { 'type': 'json' }
import { i18n } from 'i18next'

config()
const logger: Logger = Logger.getInstance(
    getSafeEnv(process.env.LOG_CHANNEL_ID, 'LOG_CHANNEL_ID'),
    getSafeEnv(process.env.HIDE_LOGS, 'HIDE_LOGS') === 'true'
)

export default class Bot extends Client {
    public cooldowns: Collection<string, Collection<string, number>>
    public set: Set<string>
    public version: string
    private _modules: ModuleImports
    private _database: Database
    private _translations: i18n

    constructor(client: Client, database: Database, modules: ModuleImports, translations: i18n) {
        super(client.options)
        this._database = database
        this.cooldowns = new Collection()
        this.set = new Set()
        this._modules = modules
        this.version = settings.version
        this._translations = translations
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
            const interactions = this._modules.interactions.filter(interaction => interaction.data && interaction.data.name).map((interaction) => {
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

    public get translations(): i18n {
        return this._translations
    }
}
