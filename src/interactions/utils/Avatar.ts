import {
    AutocompleteInteraction,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionsBitField,
    CommandInteractionOptionResolver,
    GuildMember,
    InteractionResponse,
    ApplicationIntegrationType,
    InteractionContextType
} from 'discord.js'

import Bot from '@src/classes/Bot.js'
import { InteractionModule } from '@src/classes/ModuleImports.js'
import { InteractionDecorator } from '@src/utils/Decorators.js'

@InteractionDecorator({
    name: 'avatar',
    description: 'Affiche la photo de profil du membre voulu.',
    cooldown: 1,
    category: 'utils',
    usage: 'avatar [user]',
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Affiche la photo de profil du membre voulu.')
        .addUserOption(option => option
            .setName('utilisateur')
            .setDescription('L\'utilisateur voulu')
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
})
export default class AvatarInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: ChatInputCommandInteraction): Promise<InteractionResponse> {
        const options = interaction.options as CommandInteractionOptionResolver
        const member = (options.getMember('utilisateur') ?? interaction.member) as GuildMember | null
        const userFromOptions = options.getUser('utilisateur') ?? interaction.user
        const user = member && member.user && 'displayAvatarURL' in member.user ? member.user : userFromOptions
        const localAvatarURL = member && 'avatarUrl' in member ? member.avatarURL({ size: 4096 }) : null

        if (localAvatarURL) {
            return interaction.reply({
                content: `Photos de profil [locale](${localAvatarURL}) et [globale](${user?.displayAvatarURL({ size: 4096 })}) de ${member}:`,
                allowedMentions: { parse: [] }
            })
        }
        return interaction.reply({
            content: `Photo de profil [globale](${user?.displayAvatarURL({ size: 4096 })}) de ${user}:`,
            allowedMentions: { parse: [] }
        })
    }
}