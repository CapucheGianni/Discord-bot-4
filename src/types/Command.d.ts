export type TCommand = {
    name: string
    enabled: boolean
    createdAt: Date
    updatedAt: Date
}

export type TCategory =
    'utils' |
    'moderation' |
    'administration' |
    'fun' |
    'owner'