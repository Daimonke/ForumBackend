import mysql from 'mysql2/promise'

const con = mysql.createPool({
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DBPORT,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 800,
    queueLimit: 0
})

export default con