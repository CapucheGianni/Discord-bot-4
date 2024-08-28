import { Guild, EmbedBuilder } from 'discord.js'
import { config } from 'dotenv'

import { Bot } from '../classes/Bot.js'
import { EventModule } from '../classes/ModuleImports.js'
import { EventDecorator } from '../utils/Decorators.js'
import { getSafeEnv } from '../utils/TypeGuards.js'

config()

@EventDecorator({
    name: 'guildCreate',
    eventType: 'on'
})
export default class GuildCreate extends EventModule {
    public async execute(client: Bot, server: Guild): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle(`${client.user?.username} has been added to a server`)
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
            .setThumbnail(server.iconURL())
            .setFooter({
                text: `${client.user?.username} is now on ${client.getServerNumber} servers`,
                iconURL: client.user?.displayAvatarURL()
            })
            .setTimestamp()
            .setColor('#00ff00')
        if (server.banner)
            embed.setImage(server.bannerURL())

        const channel = client.channels.cache.get(getSafeEnv(process.env.LOG_CHANNEL_ID, 'LOG_CHANNEL_ID'))
        if (!channel?.isTextBased())
            return

        await client.database.Server.upsert({
            id: server.id,
            name: server.name
        })

        await channel.send({
            embeds: [embed]
        })
    }
}