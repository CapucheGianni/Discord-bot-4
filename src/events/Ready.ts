import { EmbedBuilder } from 'discord.js'

import { Bot } from '../classes/Bot.js'
import { EventModule } from '../classes/ModuleImports.js'
import Twitch from '../classes/Twitch.js'
import { EventDecorator } from '../utils/Decorators.js'
import { getSafeEnv } from '../utils/TypeGuards.js'

@EventDecorator({
    name: 'ready',
    eventType: 'once'
})
export default class Ready extends EventModule {
    public async execute(client: Bot): Promise<void> {
        if (client.user)
            console.log(`${client.user.username} is online !\nThe bot is available on ${client.getServerNumber} servers with approximatively ${client.getUserNumber} members.`)

        await client.database.connectToDatabase(client)
        await client.database.syncDatabase()
        await client.modules.upsertInteractionsIntoDb(client.database)
        await client.modules.upsertCommandsIntoDb(client.database)
        await client.database.fetchServers(client)
        await client.database.initBotInDb(client.user!.id)

        await new Twitch().getTwitchStreams(client)


        const embed = new EmbedBuilder()
            .setTitle('Bot is online!')
            .setDescription(`The bot is available on ${client.getServerNumber} servers with approximatively ${client.getUserNumber} members.\n\nThe RAM usage is currently at ${client.getRamUsage}MB.`)
            .setColor('#00FF00')
            .setTimestamp()
        const channel = client.channels.cache.get(getSafeEnv(process.env.LOG_CHANNEL_ID, 'LOG_CHANNEL_ID'))
        if (!channel || !channel.isTextBased())
            return

        channel.send({ embeds: [ embed ] })
    }
}
