const pool = require('../db');

const getClients = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM VW_Clientes_Info');

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener clientes:', error.message);

        res.status(500).json({
            error: 'No se pudieron obtener los clientes'
        });
    }
};

const getBestSellers = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT productos_clientes.nombre, SUM(productos_pedidos.cantidad) AS Cantidad, productos_clientes.precio * SUM(productos_pedidos.cantidad) AS total_ventas
            FROM productos_pedidos
            INNER JOIN productos_clientes ON productos_pedidos.id_producto = productos_clientes.id_producto
            GROUP BY productos_clientes.nombre, productos_clientes.precio
            ORDER BY cantidad DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los libros más ve:', error.message);
    }
};

module.exports = {
    getClients,
    getBestSellers,
}