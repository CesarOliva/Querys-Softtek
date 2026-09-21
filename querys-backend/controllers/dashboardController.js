const pool = require('../db');

// Definiciones (cada semana hay dos servicios: Spa y Masaje):
// - solo_masaje: usuarios en Masaje pero NUNCA en Spa (estricto)
// - solo_spa: usuarios en Spa pero NUNCA en Masaje (estricto)
// - ambas: usuarios que fueron a AMBOS servicios ALGUNA VEZ EN LA MISMA
//   SEMANA (vista_empleados_tramposos, YEARWEEK)
// - total_usuarios: UNION de ambos (incluye usuarios "mixtos": fueron a ambos
//   pero nunca la misma semana, fuera de las 3 categorías)
// - visitas_masaje / visitas_spa: COUNT(*) de cada tabla
// - visitas_ambas: filas de la vista (pares masaje+spa misma semana)
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

//Usuarios que visitan únicamente masajes.
const getUsersOnlyMassage = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS usuarios_solo_masaje
            FROM (SELECT DISTINCT id_empleado AS id FROM Masaje) AS usuarios_masaje
            LEFT JOIN (SELECT DISTINCT id_empleado AS id FROM Spa) AS usuarios_spa
            ON usuarios_spa.id = usuarios_masaje.id
            WHERE usuarios_spa.id IS NULL
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener usuarios solo masaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Cantidad total de visitas a masajes.
const getVisitsMassage = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS visitas_masaje
            FROM Masaje
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener visitas a masaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Usuarios que visitan únicamente spa.
const getUsersOnlySpa = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS usuarios_solo_spa
            FROM (SELECT DISTINCT id_empleado AS id FROM Spa) AS usuarios_spa
            LEFT JOIN (SELECT DISTINCT id_empleado AS id FROM Masaje) AS usuarios_masaje
            ON usuarios_masaje.id = usuarios_spa.id
            WHERE usuarios_masaje.id IS NULL
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener usuarios solo spa:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Cantidad total de visitas a spa.
const getVisitsSpa = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS visitas_spa
            FROM Spa
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener visitas a spa:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Usuarios que fueron a ambas ALGUNA VEZ EN LA MISMA SEMANA.
const getUsersBoth = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(DISTINCT id) AS usuarios_ambas
            FROM vista_empleados_tramposos
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener usuarios de ambas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Cantidad total de visitas a ambas en la misma semana
const getVisitsBoth = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS visitas_ambas
            FROM vista_empleados_tramposos
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener visitas a ambas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Edades de los usuarios
const getEdades = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.id, e.edad
            FROM Empleados e
            WHERE e.id IN (
                SELECT DISTINCT id_empleado FROM Masaje
                UNION
                SELECT DISTINCT id_empleado FROM Spa
            )
            AND e.edad IS NOT NULL
            ORDER BY e.edad
        `);

        res.json(rows);

    } catch (error) {
        console.error('Error al obtener edades:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Género de los usuarios que visitaron al menos uno de los dos servicios
const getGeneros = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.id, e.genero
            FROM Empleados e
            WHERE e.id IN (
                SELECT DISTINCT id_empleado FROM Masaje
                UNION
                SELECT DISTINCT id_empleado FROM Spa
            )
            ORDER BY e.id
        `);

        res.json(rows);

    } catch (error) {
        console.error('Error al obtener géneros:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


//Todos los usuarios que visitaron al menos un servicio, con su tipo:
//solo_masaje | solo_spa | ambas (misma semana) | mixto (ambos pero nunca la misma semana)
const getUsuariosConTipo = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT
                empleado.id,
                empleado.nombre,
                empleado.apellido,
                empleado.genero,
                empleado.edad,
                CASE
                    WHEN usuarios_masaje.id IS NOT NULL AND usuarios_spa.id IS NULL THEN 'solo_masaje'
                    WHEN usuarios_spa.id IS NOT NULL AND usuarios_spa.id IS NULL THEN 'solo_spa'
                    WHEN vista.id IS NOT NULL THEN 'ambas'
                    ELSE 'mixto'
                END AS tipo
            FROM Empleados empleado
            LEFT JOIN (SELECT DISTINCT id_empleado AS id FROM Masaje) usuarios_masaje
                ON usuarios_masaje.id = empleado.id
            LEFT JOIN (SELECT DISTINCT id_empleado AS id FROM Spa) usuarios_spa
                ON usuarios_spa.id = empleado.id
            LEFT JOIN (SELECT DISTINCT id FROM vista_empleados_tramposos) vista
                ON vista.id = empleado.id
            WHERE usuarios_masaje.id IS NOT NULL OR usuarios_spa.id IS NOT NULL
            ORDER BY empleado.id
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
    getEdades,
    getGeneros,
    getUsuariosConTipo
};
