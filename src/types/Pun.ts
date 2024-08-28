export type TPun = {
    id: number
    toFind: string
    toAnswer: string
    type: 'includes' | 'endsWith' | 'startsWith'
    createdAt: Date
    updatedAt: Date
    serverId: string
    idInServer: number
}