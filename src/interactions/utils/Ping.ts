import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    AutocompleteInteraction,
    PermissionsBitField,
    Message
} from 'discord.js'

import Bot from '../../classes/Bot.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { InteractionDecorator } from '../../utils/Decorators.js'

@InteractionDecorator({
    name: 'ping',
    description: 'Display the ping of the bot',
    cooldown: 1,
    category: 'utils',
    usage: 'ping',
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Display the ping of the bot')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
})
export default class PingInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: ChatInputCommandInteraction): Promise<Message> {
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        })
        const embed = new EmbedBuilder()
            .setTitle('Pinged Successfully 🏓')
            .setDescription(`**Client Latency:** ${client.ws.ping}ms\n**API latency:** ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
            .setFooter({
                text: `Intéraction effectuée par ${interaction.user.username} | ${client.user?.username} V${client.version}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(`#ffc800`)

        return interaction.editReply({
            content: 'Pinged successfully !',
            embeds: [embed]
        })
    }
}
