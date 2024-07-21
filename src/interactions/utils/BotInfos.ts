import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, AutocompleteInteraction, PermissionsBitField } from 'discord.js'
import { InteractionDecorator } from '../../utils/Decorators.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { Bot } from '../../classes/Bot.js'
import { isBot } from '../../utils/TypeGuards.js'

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
})
export default class BotInfosInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: CommandInteraction): Promise<void> {
        const bot = (await client.database.Bot.findByPk(client.user!.id))?.get()
        if (!isBot(bot) || !client.user) {
            interaction.reply('Une erreur est survenue lors de l\'éxécution de la commande.')
            return
        }

        const embed = new EmbedBuilder()
            .setTitle('Bot informations')
            .addFields(
                { name: 'Uptime', value: `The bot has been started <t:${new Date(bot.startedAt).getTime().toString().slice(0, 10)}:R>`, inline: true },
                { name: 'Start date', value: `<t:${new Date(bot.startedAt).getTime().toString().slice(0, 10)}>`, inline: true },
                { name: 'Creation date', value: `<t:${new Date(client.user.createdAt).getTime().toString().slice(0, 10)}:R>`, inline: true},
                { name: 'Ram usage', value: `L'utilisation de la RAM est actuellement de ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100}MB.` },
                { name: 'Total servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Total users', value: `${client.users.cache.size}`, inline: true},
                { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
                { name: 'Bot version', value: client.version, inline: true },
                { name: 'Node.js version', value: process.version, inline: true}
            )
            .setImage(client.user.displayAvatarURL())
            .setColor('#ffc800')
            .setFooter({
                text: `Commande effectuée par ${interaction.user.username} | ${client.user.username} ${client.version}`,
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp()

        interaction.reply({ embeds: [embed] })
    }
}