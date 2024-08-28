import {
    SlashCommandBuilder,
    EmbedBuilder,
    CommandInteraction,
    CommandInteractionOptionResolver,
    AutocompleteInteraction,
    PermissionsBitField,
    Collection,
    GuildMember,
    InteractionResponse
} from 'discord.js'
import Fuse from 'fuse.js'

import { Bot } from '../../classes/Bot.js'
import { InteractionModule } from '../../classes/ModuleImports.js'
import { InteractionDecorator } from '../../utils/Decorators.js'
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
        const interactions = this._removeInteractionWithNoAccess(interaction.member as GuildMember, client.modules.interactions).map(interaction => ({
            name: interaction.name,
            interaction
        }))
        const fuse = new Fuse(interactions, {
            keys: ['name'],
            threshold: 0.2
        })
        const result = fuse.search(focusedValue)

        if (!result.length)
            return interaction.respond(
                interactions.map(interaction => ({ name: interaction.name, value: interaction.name }))
            )
        await interaction.respond(
            result.map(choice => ({ name: choice.item.name, value: choice.item.name }))
        )
    }

    public async execute(client: Bot, interaction: CommandInteraction): Promise<InteractionResponse> {
        const options = interaction.options as CommandInteractionOptionResolver
        const interactionName = options.getString('commande')
        const embed = new EmbedBuilder()
            .setFooter({
                text: `Intéraction effectuée par ${interaction.user.username} | ${client.user!.username} V${client.version}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(`#ffc800`)

        if (interactionName) {
            const cmd = client.modules.interactions.find(int => int.data && int.data.name === interactionName)

            if (!cmd) {
                return interaction.reply({
                    content: `La commande \`${interactionName}\` n'existe pas !`,
                    ephemeral: true
                })
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
        } else {
            embed.setTitle('Liste des commandes 📚')
                .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                .setDescription(`Voici la liste des intéractions disponibles :\n\n${this._removeInteractionWithNoAccess(interaction.member as GuildMember, client.modules.interactions).map((interactions) => `\`/${interactions.data.name}\` - ${interactions.data.description}`).join('\n')}`)
        }
        return interaction.reply({ embeds: [embed] })
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

        const filteredInteractions = new Collection<string, InteractionModule>()
        interactions.forEach((interaction, key) => {
            if (!interaction.data.default_member_permissions)
                return
            if (user.permissions.has(BigInt(interaction.data.default_member_permissions)))
                filteredInteractions.set(key, interaction)
        })

        return filteredInteractions
    }
}