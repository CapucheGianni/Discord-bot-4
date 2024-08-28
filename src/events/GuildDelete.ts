import { Guild, EmbedBuilder } from 'discord.js'
import { config } from 'dotenv'

import { Bot } from '../classes/Bot.js'
import { EventModule } from '../classes/ModuleImports.js'
import { EventDecorator } from '../utils/Decorators.js'
import { getSafeEnv } from '../utils/TypeGuards.js'

config()

@EventDecorator({
    name: 'guildDelete',
    eventType: 'on'
})
export default class GuildDelete extends EventModule {
    public async execute(client: Bot, server: Guild): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle(`${client.user?.username} has been removed from a server`)
            .setFields(
                {
                    name: 'Server',
                    value: `**${server.name}** (\`${server.id}\`)`
                },
                {
                    name: 'Server owner',
                    value: `**${(await server.fetchOwner()).user.username}** (\`${server.ownerId}\`)`
                },
                {
                    name: 'Member count',
                    value: `**~${server.memberCount}**`,
                    inline: true
                },
                {
                    name: 'Creation date',
                    value: `<t:${Math.floor(server.createdTimestamp / 1000)}:R>`,
                    inline: true
                }
            )
            .setFooter({
                text: `${client.user?.username} is now on ${client.getServerNumber} servers`,
                iconURL: client.user?.displayAvatarURL()
            })
            .setTimestamp()
            .setColor('#ff0000')

        const channel = client.channels.cache.get(getSafeEnv(process.env.LOG_CHANNEL_ID, 'LOG_CHANNEL_ID'))
        if (!channel?.isTextBased())
            return

        await client.database.Server.destroy({
            where: { id: server.id }
        })

        await channel.send({
            embeds: [embed]
        })
    }
}