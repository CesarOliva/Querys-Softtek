const pool = require('../db');

// Definiciones (verificadas con los datos: 198 usuarios únicos, 159 visitaron
// ambos alguna vez):
// - solo_masaje: usuarios en Masaje pero NUNCA en Spa
// - solo_spa: usuarios en Spa pero NUNCA en Masaje
// - ambas: usuarios en AMBOS servicios alguna vez (intersección)
// - total_usuarios: UNION de ambos (solo_masaje + solo_spa + ambas = total)
// - visitas_masaje / visitas_spa: COUNT(*) de cada tabla
// - visitas_ambas: visitas (masaje + spa) hechas por usuarios que visitaron AMBOS
// - total_visitas: visitas_masaje + visitas_spa


//Cantidad total de usuarios (visitaron masaje o spa)
const getTotalUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total_usuarios
            FROM (
                SELECT DISTINCT id_empleado FROM Masaje
                UNION
                SELECT DISTINCT id_empleado FROM Spa
            ) AS todos
        `);

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener total de usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Cantidad total de visitas (masaje + spa)
const getTotalVisits = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM Masaje) +
                (SELECT COUNT(*) FROM Spa) AS total_visitas
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener total de visitas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Usuarios que visitan únicamente masajes + % frente a usuarios totales
const getUsersOnlyMassage = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            WITH
            masaje_users AS (SELECT DISTINCT id_empleado AS id FROM Masaje),
            spa_users AS (SELECT DISTINCT id_empleado AS id FROM Spa),
            todos AS (
                SELECT id FROM masaje_users
                UNION
                SELECT id FROM spa_users
            )
            SELECT
                (SELECT COUNT(*) FROM masaje_users WHERE id NOT IN (SELECT id FROM spa_users)) AS usuarios_solo_masaje,
                (SELECT COUNT(*) FROM todos) AS total_usuarios,
                ROUND(
                    100.0 * (SELECT COUNT(*) FROM masaje_users WHERE id NOT IN (SELECT id FROM spa_users)) /
                    NULLIF((SELECT COUNT(*) FROM todos), 0),
                    2
                ) AS porcentaje
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener usuarios solo masaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Cantidad total de visitas a masajes + % frente a visitas totales
const getVisitsMassage = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM Masaje) AS visitas_masaje,
                (SELECT COUNT(*) FROM Masaje) + (SELECT COUNT(*) FROM Spa) AS total_visitas,
                ROUND(
                    100.0 * (SELECT COUNT(*) FROM Masaje) /
                    NULLIF((SELECT COUNT(*) FROM Masaje) + (SELECT COUNT(*) FROM Spa), 0),
                    2
                ) AS porcentaje
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener visitas a masaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Usuarios que visitan únicamente spa + % frente a usuarios totales
const getUsersOnlySpa = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            WITH
            masaje_users AS (SELECT DISTINCT id_empleado AS id FROM Masaje),
            spa_users AS (SELECT DISTINCT id_empleado AS id FROM Spa),
            todos AS (
                SELECT id FROM masaje_users
                UNION
                SELECT id FROM spa_users
            )
            SELECT
                (SELECT COUNT(*) FROM spa_users WHERE id NOT IN (SELECT id FROM masaje_users)) AS usuarios_solo_spa,
                (SELECT COUNT(*) FROM todos) AS total_usuarios,
                ROUND(
                    100.0 * (SELECT COUNT(*) FROM spa_users WHERE id NOT IN (SELECT id FROM masaje_users)) /
                    NULLIF((SELECT COUNT(*) FROM todos), 0),
                    2
                ) AS porcentaje
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener usuarios solo spa:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Cantidad total de visitas a spa + % frente a visitas totales
const getVisitsSpa = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM Spa) AS visitas_spa,
                (SELECT COUNT(*) FROM Masaje) + (SELECT COUNT(*) FROM Spa) AS total_visitas,
                ROUND(
                    100.0 * (SELECT COUNT(*) FROM Spa) /
                    NULLIF((SELECT COUNT(*) FROM Masaje) + (SELECT COUNT(*) FROM Spa), 0),
                    2
                ) AS porcentaje
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener visitas a spa:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Usuarios que visitan ambas + % frente a usuarios totales

const getUsersBoth = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            WITH
            masaje_users AS (SELECT DISTINCT id_empleado AS id FROM Masaje),
            spa_users AS (SELECT DISTINCT id_empleado AS id FROM Spa),
            todos AS (
                SELECT id FROM masaje_users
                UNION
                SELECT id FROM spa_users
            ),
            ambas AS (
                SELECT m.id FROM masaje_users m
                INNER JOIN spa_users s ON s.id = m.id
            )
            SELECT
                (SELECT COUNT(*) FROM ambas) AS usuarios_ambas,
                (SELECT COUNT(*) FROM todos) AS total_usuarios,
                ROUND(
                    100.0 * (SELECT COUNT(*) FROM ambas) /
                    NULLIF((SELECT COUNT(*) FROM todos), 0),
                    2
                ) AS porcentaje
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener usuarios de ambas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Cantidad total de visitas a ambas + % frente a visitas totales

const getVisitsBoth = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            WITH
            masaje_users AS (SELECT DISTINCT id_empleado AS id FROM Masaje),
            spa_users AS (SELECT DISTINCT id_empleado AS id FROM Spa),
            ambas AS (
                SELECT m.id FROM masaje_users m
                INNER JOIN spa_users s ON s.id = m.id
            )
            SELECT
                (
                    (SELECT COUNT(*) FROM Masaje WHERE id_empleado IN (SELECT id FROM ambas)) +
                    (SELECT COUNT(*) FROM Spa WHERE id_empleado IN (SELECT id FROM ambas))
                ) AS visitas_ambas,
                (SELECT COUNT(*) FROM Masaje) + (SELECT COUNT(*) FROM Spa) AS total_visitas,
                ROUND(
                    100.0 * (
                        (SELECT COUNT(*) FROM Masaje WHERE id_empleado IN (SELECT id FROM ambas)) +
                        (SELECT COUNT(*) FROM Spa WHERE id_empleado IN (SELECT id FROM ambas))
                    ) /
                    NULLIF((SELECT COUNT(*) FROM Masaje) + (SELECT COUNT(*) FROM Spa), 0),
                    2
                ) AS porcentaje
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener visitas a ambas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Distribución por rangos de edad de 10 en 10 sobre TODOS los usuarios
//que visitaron al menos uno de los dos servicios.

const getEdadesRangos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            WITH todos AS (
                SELECT DISTINCT id_empleado AS id FROM Masaje
                UNION
                SELECT DISTINCT id_empleado AS id FROM Spa
            )
            SELECT
                CONCAT(FLOOR(e.edad / 10) * 10, '-', FLOOR(e.edad / 10) * 10 + 9) AS rango,
                FLOOR(e.edad / 10) * 10 AS orden,
                COUNT(DISTINCT e.id) AS cantidad,
                ROUND(
                    100.0 * COUNT(DISTINCT e.id) /
                    NULLIF((SELECT COUNT(*) FROM todos), 0),
                    2
                ) AS porcentaje
            FROM Empleados e
            INNER JOIN todos t ON t.id = e.id
            WHERE e.edad IS NOT NULL
            GROUP BY rango, orden
            ORDER BY orden
        `);

        res.json(rows);

    } catch (error) {
        console.error('Error al obtener distribución por rangos de edad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Distribución por género sobre TODOS los usuarios
//que visitaron al menos uno de los dos servicios.
//En la BD: 'H' = hombre, 'M' = mujer.

const getGeneroDistribucion = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            WITH todos AS (
                SELECT DISTINCT id_empleado AS id FROM Masaje
                UNION
                SELECT DISTINCT id_empleado AS id FROM Spa
            )
            SELECT
                CASE
                    WHEN e.genero = 'H' THEN 'Masculino'
                    WHEN e.genero = 'M' THEN 'Femenino'
                    ELSE 'No especificado'
                END AS genero,
                COUNT(DISTINCT e.id) AS cantidad,
                ROUND(
                    100.0 * COUNT(DISTINCT e.id) /
                    NULLIF((SELECT COUNT(*) FROM todos), 0),
                    2
                ) AS porcentaje
            FROM Empleados e
            INNER JOIN todos t ON t.id = e.id
            GROUP BY genero
            ORDER BY genero
        `);

        res.json(rows);

    } catch (error) {
        console.error('Error al obtener distribución por género:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Todos los usuarios que visitaron al menos un servicio, con su tipo:
//solo_masaje | solo_spa | ambas

const getUsuariosConTipo = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT
                e.id,
                e.nombre,
                e.apellido,
                e.genero,
                e.edad,
                CASE
                    WHEN m.id IS NOT NULL AND s.id IS NULL THEN 'solo_masaje'
                    WHEN s.id IS NOT NULL AND m.id IS NULL THEN 'solo_spa'
                    ELSE 'ambas'
                END AS tipo
            FROM Empleados e
            LEFT JOIN (SELECT DISTINCT id_empleado AS id FROM Masaje) m
                ON m.id = e.id
            LEFT JOIN (SELECT DISTINCT id_empleado AS id FROM Spa) s
                ON s.id = e.id
            WHERE m.id IS NOT NULL OR s.id IS NOT NULL
            ORDER BY e.id
        `);

        res.json(rows);

    } catch (error) {
        console.error('Error al obtener usuarios con tipo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


module.exports = {
    getTotalUsers,
    getTotalVisits,
    getUsersOnlyMassage,
    getVisitsMassage,
    getUsersOnlySpa,
    getVisitsSpa,
    getUsersBoth,
    getVisitsBoth,
    getEdadesRangos,
    getGeneroDistribucion,
    getUsuariosConTipo
};
