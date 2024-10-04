import {
    IntentsBitField,
    Partials,
    Client,
    EmbedBuilder
} from 'discord.js'
import { config } from 'dotenv'
import 'reflect-metadata'

import Bot from './classes/Bot.js'
import Database from './classes/Database.js'
import Logger from './classes/Logger.js'
import ModuleImports from './classes/ModuleImports.js'
import { getSafeEnv } from './utils/TypeGuards.js'

config()

const logger: Logger = Logger.getInstance('')

const start = async (): Promise<void> => {
    const client = new Client({
        presence: {
            status: 'online',
            activities: [{
                name: '📚 /help',
                type: 2
            }]
        },

        allowedMentions: { parse: [ 'users', 'roles' ] },

        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMessageReactions,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildPresences,
            IntentsBitField.Flags.MessageContent
        ],

        partials: [
            Partials.Channel, Partials.GuildMember, Partials.Message
        ]
    })

    const database: Database = new Database()
    const modules: ModuleImports = new ModuleImports()
    const bot: Bot = new Bot(client, database, modules)

    await bot.modules.loadModules()

    try {
        bot.modules.eventListener(bot)

        await bot.deployInteractions()

        await bot.login(getSafeEnv(process.env.TOKEN, 'TOKEN'))

        await bot.database.disconnectFromDatabase()
    } catch (error: any) {
        logger.simpleError(error)
        logger.logDiscordEmbed(client, new EmbedBuilder()
            .setTitle('Error')
            .setDescription(`\`\`\`js\n${error}\n\`\`\``)
            .setColor('#ff0000')
            .setTimestamp()
        )
    }

    process.on('unhandledRejection', (error: Error) => {
        logger.simpleError(error)
        logger.logDiscordEmbed(client, new EmbedBuilder()
            .setTitle('Unhandled Rejection')
            .setDescription(`\`\`\`js\n${error}\n\`\`\``)
            .setColor('#ff0000')
            .setTimestamp()
        )
    })

    process.on('uncaughtException', (error: Error) => {
        logger.simpleError(error)
        logger.logDiscordEmbed(client, new EmbedBuilder()
            .setTitle('Uncaught Exception')
            .setDescription(`\`\`\`js\n${error}\n\`\`\``)
            .setColor('#ff0000')
            .setTimestamp()
        )
    })
}

void start()

