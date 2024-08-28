import {
    Message,
    EmbedBuilder,
    PermissionsBitField,
    GuildMember,
    Collection,
    User
} from 'discord.js'

import { Bot } from '../../classes/Bot.js'
import { CommandModule } from '../../classes/ModuleImports.js'
import { CommandDecorator } from '../../utils/Decorators.js'
import { getSafeEnv, isTruthy } from '../../utils/TypeGuards.js'

@CommandDecorator({
    name: 'help',
    description: 'Affiche les intéractions disponibles.',
    cooldown: 3,
    permissions: [],
    category: 'utils',
    usage: 'help [command]',
    aliases: ['h', 'aide']
})
export default class HelpCommand extends CommandModule {
    public async execute(client: Bot, command: Message, args: string[]): Promise<void | Message> {
        const commandName: string | undefined = args[0]
        const embed = new EmbedBuilder()
            .setFooter({
                text: `Intéraction effectuée par ${command.author.username} | ${client.user?.username} V${client.version}`,
                iconURL: command.author.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(`#ffc800`)

        if (commandName) {
            const cmd = client.modules.commands.find(cmd => cmd.name === commandName)

            if (!cmd)
                return command.reply(`La commande \`${commandName}\` n'existe pas !`)
            embed.setTitle(`Commande \`${cmd.name}\` 📚`)
                .setDescription('Voici les informations sur la commande demandée :')
                .addFields(
                    {
                        name: 'Description',
                        value: cmd.description
                    },
                    {
                        name: 'Usage',
                        value: cmd.usage,
                        inline: true
                    },
                    {
                        name: 'Permissions',
                        value: cmd.permissions.length ? cmd.permissions.map(perm => perm).join(', ') : 'Aucune permission requise.',
                        inline: true
                    }
                )
        } else {
            const prefix = command.guildId ? (await client.database.getGuild(command.guildId)).prefix : client.user?.username

            embed.setTitle('Liste des commandes 📚')
                .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                .setDescription(`Voici la liste des intéractions disponibles :\n\n${this._removeCommandWithNoAccess(command.member as GuildMember ?? command.author, client.modules.commands, command).map((commands) => `\`${prefix}${commands.name}\` - ${commands.description}`).join('\n')}`)
        }
        return command.reply({ embeds: [embed] })
    }

    private _removeCommandWithNoAccess(user: GuildMember | User, commands: Collection<string, CommandModule>, message: Message): Collection<string, CommandModule> {
        if (user.id === getSafeEnv(process.env.OWNER_ID, 'OWNER_ID'))
            return commands

        const isGuildMember = (user: GuildMember | User): user is GuildMember => (user as GuildMember).permissions !== undefined
        const filteredCommands = new Collection<string, CommandModule>()
        commands.forEach(async (command, key) => {
            if (command.category === 'owner')
                return
            if (isGuildMember(user) && await this.checkPermissions(message, user, command.permissions))
                filteredCommands.set(key, command)
        })

        return filteredCommands
    }
}