import {
    CommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    AutocompleteInteraction,
    PermissionsBitField
} from 'discord.js'
import { Bot } from '../../classes/Bot.js'
import { InteractionDecorator } from '../../utils/Decorators.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { Logger } from '../../classes/Logger.js'

const logger = Logger.getInstance('')

@InteractionDecorator({
    name: 'ping',
    description: 'Display the ping of the bot',
    cooldown: 1,
    category: 'utils',
    usage: 'ping',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Display the ping of the bot')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
})
export default class PingInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: CommandInteraction): Promise<any> {
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        })
        const embed = new EmbedBuilder()
            .setTitle('Pinged Successfully 🏓')
            .setDescription(`**Client Latency:** ${client.ws.ping}ms\n**API latency:** ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
            .setFooter({
                text: `Commande effectuée par ${interaction.user.username} | ${client.user!.username} V${client.version}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(`#ffc800`)

        interaction.editReply({
            content: 'Pinged successfully !',
            embeds: [embed]
        })
    }
}
