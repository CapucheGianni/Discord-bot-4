import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    PermissionsBitField,
    InteractionResponse,
    ApplicationIntegrationType,
    InteractionContextType
} from 'discord.js'

import Bot from '@src/classes/Bot.js'
import { InteractionModule } from '@src/classes/ModuleImports.js'
import { InteractionDecorator } from '@src/utils/Decorators.js'
import { isBot } from '@src/utils/TypeGuards.js'

@InteractionDecorator({
    name: 'botinfos',
    description: 'Affiche des informations utiles sur le bot.',
    cooldown: 1,
    category: 'utils',
    usage: 'botinfos',
    data: new SlashCommandBuilder()
        .setName('botinfos')
        .setDescription('Affiche des informations utiles sur le bot.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
})
export default class BotInfosInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: ChatInputCommandInteraction): Promise<InteractionResponse> {
        const bot = (await client.database.Bot.findByPk(client.user?.id))?.get()
        if (!isBot(bot) || !client.user) {
            return interaction.reply({
                content: 'Une erreur est survenue lors de l\'éxécution de la commande.',
                ephemeral: true
            })
        }

        const embed = new EmbedBuilder()
            .setTitle('Bot informations')
            .addFields(
                { name: 'Uptime', value: `The bot has been started <t:${Math.floor((Date.now() - client.uptime!) / 1000)}:R>`, inline: true },
                { name: 'Start date', value: `<t:${Math.floor(client.readyTimestamp! / 1000)}>`, inline: true },
                { name: 'Creation date', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true},
                { name: 'Ram usage', value: `L'utilisation de la RAM est actuellement de ${client.getRamUsage}MB.` },
                { name: 'Total servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Total users', value: `${client.users.cache.size}`, inline: true},
                { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
                { name: 'Bot version', value: client.version, inline: true },
                { name: 'Node.js version', value: process.version, inline: true}
            )
            .setImage(client.user.displayAvatarURL())
            .setFooter({
                text: `Intéraction effectuée par ${interaction.user.username} | ${client.user.username} V${client.version}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(`#ffc800`)

        return interaction.reply({ embeds: [embed] })
    }
}