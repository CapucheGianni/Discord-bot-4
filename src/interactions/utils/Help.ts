import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, CommandInteractionOptionResolver, AutocompleteInteraction, PermissionsBitField, Collection, GuildMember } from 'discord.js'
import { InteractionDecorator } from '../../utils/Decorators.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { Bot } from '../../classes/Bot.js'
import { getSafeEnv, isTruthy } from '../../utils/TypeGuards.js'

@InteractionDecorator({
    name: 'help',
    description: 'Affiche les intéractions disponibles',
    cooldown: 3,
    category: 'utils',
    usage: 'help [interaction]',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche les intéractions disponibles')
        .addStringOption((option) => option
            .setName('commande')
            .setDescription('La commande à afficher')
            .setAutocomplete(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
})
export default class Help extends InteractionModule {
    public async autoComplete(client: Bot, interaction: AutocompleteInteraction): Promise<void> {
        const options = interaction.options as CommandInteractionOptionResolver
        const focusedValue = options.getFocused()
        const interactionNames = this._removeInteractionWithNoAccess(interaction.member as GuildMember, client.modules.interactions).filter(interaction => {
            return interaction.name.startsWith(focusedValue)
        })

        await interaction.respond(
            interactionNames.map(choice => ({ name: choice.name, value: choice.name }))
        )
    }

    public async execute(client: Bot, interaction: CommandInteraction): Promise<void> {
        const options = interaction.options as CommandInteractionOptionResolver
        const interactionName = options.getString('commande')
        const embed = new EmbedBuilder()

        if (interactionName) {
            const cmd = client.modules.interactions.find(int => int.data && int.data.name === interactionName)

            if (!cmd) {
                interaction.reply({
                    content: `La command \`${interactionName}\` n'existe pas !`,
                    ephemeral: true
                })
                return
            }
            embed.setTitle(`Commande \`${cmd.data.name}\` 📚`)
                .setDescription('Voici les informations sur l\'intéraction demandée :')
                .addFields(
                    {
                        name: 'Description',
                        value: cmd.data.description
                    },
                    {
                        name: 'Usage',
                        value: `\`/${cmd.data.name}\``,
                        inline: true
                    },
                    {
                        name: 'Permissions',
                        value: this._formatPermission(cmd.data.default_member_permissions),
                        inline: true
                    },
                    {
                        name: 'Options',
                        value: cmd.data.options.length ? `>>> ${cmd.data.options.map((option) => `\`${option.toJSON().name}\`: ${option.toJSON().description} - ${option.toJSON().required ? 'requis' : 'non requis'}`).join('\n')}` : 'Aucune option disponible'
                    }
                )
                .setFooter({
                    text: `Commande effectuée par ${interaction.user.username} | ${client.user!.username} V${client.version}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()
                .setColor('#ffc800')
        } else {
            embed.setTitle('Liste des commandes 📚')
                .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                .setDescription(`Voici la liste des intéractions disponibles :\n\n${this._removeInteractionWithNoAccess(interaction.member as GuildMember, client.modules.interactions).map((interactions) => `\`/${interactions.data.name}\` - ${interactions.data.description}`).join('\n')}`)
                .setFooter({
                    text: `Commande effectuée par ${interaction.user.username} | ${client.user!.username} V${client.version}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()
                .setColor(`#ffc800`)
        }
        await interaction.reply({ embeds: [embed] })
    }

    private _formatPermission(permissionValue: string | null | undefined): string {
        if (!isTruthy(permissionValue))
            return 'Aucune permission requise'

        const permissionBigInt = BigInt(permissionValue)
        return Object.keys(PermissionsBitField.Flags).find(key =>
            PermissionsBitField.Flags[key as keyof typeof PermissionsBitField.Flags] === permissionBigInt
        ) || 'Aucune permission requise'
    }

    private _removeInteractionWithNoAccess(user: GuildMember, interactions: Collection<string, InteractionModule>): Collection<string, InteractionModule> {
        if (user.id === getSafeEnv(process.env.OWNER_ID, 'OWNER_ID'))
            return interactions

        const filteredInteractions = new Collection<string, InteractionModule>();
        interactions.forEach((interaction, key) => {
            if (!interaction.data.default_member_permissions)
                return
            if (user.permissions.has(BigInt(interaction.data.default_member_permissions)))
                filteredInteractions.set(key, interaction)
        })

        return filteredInteractions
    }
}