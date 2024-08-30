export type TDiscordEvents =
    'applicationCommandPermissionsUpdate' |
    'autoModerationActionExecution' |
    'autoModerationRuleCreate' |
    'autoModerationRuleDelete' |
    'autoModerationRuleUpdate' |
    'ready' |
    'entitlementCreate' |
    'entitlementDelete' |
    'entitlementUpdate' |
    'guildAuditLogEntryCreate' |
    'guildAvailable' |
    'guildCreate' |
    'guildDelete' |
    'guildUpdate' |
    'guildUnavailable' |
    'guildMemberAdd' |
    'guildMemberRemove' |
    'guildMemberUpdate' |
    'guildMemberAvailable' |
    'guildMembersChunk' |
    'guildIntegrationsUpdate' |
    'roleCreate' |
    'roleDelete' |
    'inviteCreate' |
    'inviteDelete' |
    'roleUpdate' |
    'emojiCreate' |
    'emojiDelete' |
    'emojiUpdate' |
    'guildBanAdd' |
    'guildBanRemove' |
    'channelCreate' |
    'channelDelete' |
    'channelUpdate' |
    'channelPinsUpdate' |
    'messageCreate' |
    'messageDelete' |
    'messageUpdate' |
    'messageDeleteBulk' |
    'messagePollVoteAdd' |
    'messagePollVoteRemove' |
    'messageReactionAdd' |
    'messageReactionRemove' |
    'messageReactionRemoveAll' |
    'messageReactionRemoveEmoji' |
    'threadCreate' |
    'threadDelete' |
    'threadUpdate' |
    'threadListSync' |
    'threadMemberUpdate' |
    'threadMembersUpdate' |
    'userUpdate' |
    'presenceUpdate' |
    'voiceServerUpdate' |
    'voiceStateUpdate' |
    'typingStart' |
    'webhookUpdate' |
    'interactionCreate' |
    'error' |
    'warn' |
    'debug' |
    'cacheSweep' |
    'shardDisconnect' |
    'shardError' |
    'shardReconnecting' |
    'shardReady' |
    'shardResume' |
    'invalidated' |
    'raw' |
    'stageInstanceCreate' |
    'stageInstanceUpdate' |
    'stageInstanceDelete' |
    'stickerCreate' |
    'stickerDelete' |
    'stickerUpdate' |
    'guildScheduledEventCreate' |
    'guildScheduledEventUpdate' |
    'guildScheduledEventDelete' |
    'guildScheduledEventUserAdd' |
    'guildScheduledEventUserRemove'

export type TEventType = 'on' | 'once'

export enum ApplicationIntegrationTypes {
    GUILD_INSTALL = 0,
    USER_INSTALL = 1
}

export enum InteractionContextTypes {
    GUILD = 0,
    BOT_DM = 1,
    PRIVATE_CHANNEL = 2
}