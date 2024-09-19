import { createPool } from 'mysql2/promise'
import { config } from 'dotenv'

config()

const oldDb = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'old_kaide_db'
})

const newDb = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

const getUsers = async () => {
    try {
        const [rows] = await oldDb.query('SELECT * FROM User')

        for (const row of rows) {
            await newDb.query(
                `INSERT INTO User (id, name, jokes, banned, lang, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name)
                jokes = VALUES(jokes)
                updatedAt = VALUES(updatedAt)`,
                [row.id, row.name, row.jokes, 0, 'en', new Date(), new Date()]
            )
        }
    }
    catch (error) { console.error(error) }
}

const getChannels = async () => {
    try {
        const [rows] = await oldDb.query('SELECT * FROM Channel')

        for (const row of rows) {
            await newDb.query(
                `INSERT INTO Channel (id, name, jokes, serverId, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name)
                jokes = VALUES(jokes)
                updatedAt = VALUES(updatedAt)`,
                [row.id, row.name, row.jokes, row.serverId, new Date(), new Date()]
            )
        }
    }
    catch (error) { console.error(error) }
}

const getLeaveChannels = async () => {
    try {
        const [rows] = await oldDb.query('SELECT * FROM LeaveChannel')

        for (const row of rows) {
            await newDb.query(
                'INSERT INTO AnnouncementChannel (message, dm, isActivated, embedEnabled, type, serverId, channelId) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [row.leaveMessage, 0, row.isActivated, row.embed, 'leave', row.serverId, row.id]
            )
        }
    }
    catch (error) { console.error(error) }
}

const getServers = async () => {
    try {
        const [rows] = await oldDb.query('SELECT * FROM Server')

        for (const row of rows) {
            await newDb.query(
                `INSERT INTO Server (id, name, prefix, jokes, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                prefix = VALUES(prefix),
                jokes = VALUES(jokes),
                updatedAt = VALUES(updatedAt)`,
                [row.id, row.name, row.prefix, row.jokes, new Date(), new Date()]
            )
        }
    }
    catch (error) { console.error(error) }
}

const getTwitchNotifs = async () => {
    try {
        const [rows] = await oldDb.query('SELECT * FROM TwitchNotification')

        for (const row of rows) {
            await newDb.query(
                'INSERT INTO TwitchNotification (serverId, streamer, channelId, roleId, message, updateMessage, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [row.id, row.streamer, row.channelId, row.roleId, row.message, row.updateMessage, 1]
            )
        }
    }
    catch (error) { console.error(error) }
}

const getWelcomeChannels = async () => {
    try {
        const [rows] = await oldDb.query('SELECT * FROM WelcomeChannel')

        for (const row of rows) {
            await newDb.query(
                'INSERT INTO AnnouncementChannel (message, dm, isActivated, embedEnabled, type, serverId, channelId) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [row.welcomeMessage, row.dm, row.isActivated, row.embed, 'welcome', row.serverId, row.id]
            )
        }
    }
    catch (error) { console.error(error) }
}

const migrateData = async () => {
    try {
        await getUsers()
        await getServers()
        await getChannels()
        await getLeaveChannels()
        await getWelcomeChannels()
        await getTwitchNotifs()
    } catch (error) {
        console.error(error)
    } finally {
        await oldDb.end()
        await newDb.end()
    }
}

migrateData()
