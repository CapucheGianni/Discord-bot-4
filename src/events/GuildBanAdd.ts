import { EmbedBuilder, InteractionResponse, Message, GuildMember } from 'discord.js'
import { config } from 'dotenv'

import Bot from '../classes/Bot.js'
import { EventModule } from '../classes/ModuleImports.js'
import { EventDecorator } from '../utils/Decorators.js'
import { isString, isTruthy } from '../utils/TypeGuards.js'

config()

@EventDecorator({
    name: 'guildBanAdd',
    eventType: 'on'
})
export default class GuildBanAddEvent extends EventModule {
    public async execute(client: Bot, member: GuildMember): Promise<void | InteractionResponse | Message> {
        const welcomeChannel = await client.database.AnnouncementChannel.findOne({
            where: {
                serverId: member.guild.id,
                type: 'ban'
            },
            include: {
                model: client.database.AnnouncementEmbed,
                as: 'embed'
            }
        })
        if (!isTruthy(welcomeChannel))
            return

        const channel = client.channels.cache.get(welcomeChannel.get().channelId)
        if (!channel || !channel.isTextBased())
            return

        const embed: EmbedBuilder = new EmbedBuilder()
        const imageUrl = welcomeChannel.get().imageUrl
        if (welcomeChannel.get().embedEnabled) {
            const storedEmbed = welcomeChannel.get().embed

            if (storedEmbed) {
                embed.setTitle(storedEmbed.title)
                embed.setColor(storedEmbed.color)
                if (storedEmbed.displayBody && storedEmbed.body)
                    embed.setDescription(storedEmbed.body)
                if (storedEmbed.displayImage && storedEmbed.imageUrl)
                    embed.setImage(storedEmbed.imageUrl)
                if (storedEmbed.displayFooter && storedEmbed.footer)
                    embed.setFooter({ text: storedEmbed.footer })
                if (storedEmbed.displayThumbnail)
                    embed.setThumbnail(member.user.displayAvatarURL())
                if (storedEmbed.displayTimestamp)
                    embed.setTimestamp()
            }
        }

        if (!welcomeChannel.get().message && !embed.data.title)
            return
        return channel.send({
            content: this._replaceTags(welcomeChannel.get().message!, member),
            embeds: embed.data.title ? this._replaceTags([embed], member) : [],
            files: imageUrl && imageUrl !== '' ? [imageUrl] : []
        })
    }

    private _replaceTags<T>(param: T, member: GuildMember): T {
        const tagsWithReplacements: { name: string, value: string }[] = [
            { name: '{user}', value: `${member.user}` },
            { name: '{username}', value: `${member.user.username}` },
            { name: '{server}', value: `${member.guild.name}` },
            { name: '{membercount}', value: `${member.guild.memberCount}` },
        ]

        if (isString(param)) {
            let result = param as string
            for (const {name, value} of tagsWithReplacements) {
                result = result.replaceAll(name, value)
            }
            return result as T
        }

        const embed = param as EmbedBuilder[]

        for (const {name, value} of tagsWithReplacements) {
            embed[0].data.title = embed[0].data.title?.replaceAll(name, value)
            embed[0].data.description = embed[0].data.description?.replaceAll(name, value)
            if (embed[0].data.footer)
                embed[0].data.footer.text = embed[0].data.footer.text.replaceAll(name, value)
        }
        return embed as T
    }
}