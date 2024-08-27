import {
    Message,
    EmbedBuilder,
} from 'discord.js'

import { Bot } from '../classes/Bot.js'
import { EventModule } from '../classes/ModuleImports.js'
import { EventDecorator } from '../utils/Decorators.js'
import { getSafeEnv, isTruthy } from '../utils/TypeGuards.js'

@EventDecorator({
    name: 'messageDelete',
    eventType: 'on'
})
export default class MessageDelete extends EventModule {
    public async execute(client: Bot, message: Message): Promise<any> {
        const embed = new EmbedBuilder()
        const interactionEmbed = new EmbedBuilder()
        const channel = client.channels.cache.get(getSafeEnv(process.env.LOG_CHANNEL_ID, 'LOG_CHANNEL_ID'))

        if (!isTruthy(channel) || !channel.isTextBased())
            return
        if (!message.guild || !message.author || message.guildId !== '1124061621510221934')
            return
        embed.setTitle("Message supprimé 🗑️")
            .addFields({
                name: "Date d'envoi",
                value: `<t:${message.createdTimestamp.toString().slice(0, 10)}> (<t:${message.createdTimestamp.toString().slice(0, 10)}:R>)`
            },
            {
                name: "Auteur",
                value: `${message.author} (${message.author.id})`,
                inline: true
            },
            {
                name: "Salon",
                value: `${message.channel} (${message.channelId})`,
                inline: true
            },
            {
                name: "Serveur",
                value: `${message.guild} (${message.guildId})`,
                inline: true
            })
            .setColor(`#ff0000`)
        if (message.content)
            embed.setDescription(message.content)
        if (message.embeds.length && !message.content)
            embed.setDescription(message.embeds[0].description)
        if (message.attachments.size) {
            embed.addFields({
                name: "Fichiers",
                value: message.attachments.map((attachment) => `([URL](${attachment.url})) \`${attachment.name}\``).join(',\n')
            })
        }
        if (message.interaction) {
            interactionEmbed.addFields({
                    name: "Intéraction",
                    value: `${message.interaction.commandName} (${message.interaction.id})`,
                    inline: true
                },
                {
                    name: "Auteur",
                    value: `${message.interaction.user} (${message.interaction.user.id})`,
                    inline: true
                })
                .setFooter({
                    text: `Message supprimé | ${client.user!.username}`,
                    iconURL: message.interaction.user.displayAvatarURL()
                })
                .setColor(`#ff0000`)
                .setTimestamp()
        } else {
            embed.setFooter({
                text: `Message supprimé | ${client.user!.username}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()
        }
        await channel.send({ embeds: [embed] })
        if (message.interaction)
            await channel.send({ embeds: [interactionEmbed] })
    }
}