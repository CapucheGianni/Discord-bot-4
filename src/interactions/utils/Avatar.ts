import {
    AutocompleteInteraction,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionsBitField,
    CommandInteractionOptionResolver,
    GuildMember,
    InteractionResponse
} from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { InteractionDecorator } from '../../utils/Decorators.js'

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
})
export default class AvatarInteraction extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> { }

    public async execute(client: Bot, interaction: ChatInputCommandInteraction): Promise<InteractionResponse> {
        const options = interaction.options as CommandInteractionOptionResolver
        const member = (options.getMember('utilisateur') ?? interaction.member) as GuildMember | null
        const globalAvatarURL = member ? member.user.displayAvatarURL({ size: 4096 }) : interaction.user.displayAvatarURL({ size: 4096 })
        const localAvatarURL = member ? member.avatarURL({ size: 4096 }) : null

        if (localAvatarURL) {
            return interaction.reply({
                content: `Photos de profil [locale](${localAvatarURL}) et [globale](${globalAvatarURL}) de ${member}:`,
                allowedMentions: { parse: [] }
            })
        }
        return interaction.reply({
            content: `Photo de profil [globale](${globalAvatarURL}) de ${member}:`,
            allowedMentions: { parse: [] }
        })
    }
}