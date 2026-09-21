const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'tiendita',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
});

(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('Conexión a la base de datos establecida');
        conn.release();
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    }
})();

module.exports = pool;