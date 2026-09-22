const pool = require('../db');

const getClients = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM VW_Clientes_Info');

        res.json(rows);

        console.log('Clientes obtenidos correctamente');
    } catch (error) {
        console.error('Error al obtener clientes:', error.message);

        res.status(500).json({
            error: 'No se pudieron obtener los clientes'
        });
    }
};

module.exports = {
    getClients,
}