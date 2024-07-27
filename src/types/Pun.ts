export type TPun = {
    id: number
    idInServer: number
    toFind: string
    toAnswer: string
    type: 'includes' | 'endsWith' | 'startsWith'
    serverId: string
}