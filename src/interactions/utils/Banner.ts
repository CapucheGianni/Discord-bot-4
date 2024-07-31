import {
    AutocompleteInteraction,
    SlashCommandBuilder,
    CommandInteraction,
    PermissionsBitField,
    CommandInteractionOptionResolver,
    GuildMember,
    EmbedBuilder,
    InteractionResponse
} from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { InteractionDecorator } from '../../utils/Decorators.js'

@InteractionDecorator({
    name: 'banner',
    description: 'Affiche la bannière du membre voulu.',
    cooldown: 1,
    category: 'utils',
    usage: 'banner [user]',
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Affiche la bannière du membre voulu.')
        .addUserOption(option => option
            .setName('utilisateur')
            .setDescription('L\'utilisateur voulu')
        )
        .addBooleanOption(option => option
            .setName('couleur')
            .setDescription('Affiche la couleur de la bannière plutôt que l\'image.')
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
})
export default class AvatarInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: CommandInteraction): Promise<InteractionResponse> {
        const options = interaction.options as CommandInteractionOptionResolver
        const user = (options.getMember('utilisateur') ?? interaction.member) as GuildMember
        const isColor = options.getBoolean('couleur') ?? false
        const fetchedUser = await user.user.fetch()
        const bannerUrl = fetchedUser.bannerURL({ size: 4096 })

        if (isColor) {
            if (!fetchedUser.hexAccentColor) {
                return interaction.reply({
                    content: `${user} n'a pas de bannière.`,
                    allowedMentions: { parse: [] }
                })
            }
            const embed = new EmbedBuilder()
                .setDescription(`**[${fetchedUser.hexAccentColor}](https://colorhexa.com/${fetchedUser.hexAccentColor})**`)
                .setColor(fetchedUser.hexAccentColor)

            return interaction.reply({
                content: `La bannière de ${user} est ${fetchedUser.hexAccentColor}.`,
                embeds: [ embed ],
                allowedMentions: { parse: [] }
            })
        }
        return interaction.reply({
            content: bannerUrl ? `Bannière de ${user}[ : ](${bannerUrl})` : `${user} ne possède pas de bannière.`,
            allowedMentions: { parse: [] }
        })
    }
}