const express = require('express');

const router = express.Router();

const dashBoardController = require('../controllers/dashboardController');


// Cantidad total de TODOS los usuarios (visitaron masaje o spa)
router.get(
    '/services/usuarios/total',
    dashBoardController.getTotalUsers
);


// Cantidad total de TODAS las visitas (masaje + spa)
router.get(
    '/services/visitas/total',
    dashBoardController.getTotalVisits
);


// Usuarios que visitan únicamente masajes + % frente a usuarios totales
router.get(
    '/services/masaje/usuarios-solo',
    dashBoardController.getUsersOnlyMassage
);


// Cantidad total de visitas a masajes + % frente a visitas totales
// (reutilizada: antes contaba usuarios distintos, sin uso en el front)
router.get(
    '/services/masaje/total',
    dashBoardController.getVisitsMassage
);


// Usuarios que visitan únicamente spa + % frente a usuarios totales
router.get(
    '/services/spa/usuarios-solo',
    dashBoardController.getUsersOnlySpa
);


// Cantidad total de visitas a spa + % frente a visitas totales
// (reutilizada: antes contaba usuarios distintos, sin uso en el front)
router.get(
    '/services/spa/total',
    dashBoardController.getVisitsSpa
);


// Usuarios que visitan ambas + % frente a usuarios totales
// (reutilizada: antes contaba solo coincidencias de la misma semana,
// sin uso en el front)
router.get(
    '/services/repetidores/total',
    dashBoardController.getUsersBoth
);


// Cantidad total de visitas a ambas + % frente a visitas totales
router.get(
    '/services/ambas/visitas',
    dashBoardController.getVisitsBoth
);


// Distribución por rangos de edad de 10 en 10 (todos los usuarios)
router.get(
    '/services/edades/rangos',
    dashBoardController.getEdadesRangos
);


// Distribución por género (todos los usuarios)
router.get(
    '/services/genero/distribucion',
    dashBoardController.getGeneroDistribucion
);


// Todos los usuarios con su tipo (solo_masaje | solo_spa | ambas)
router.get(
    '/services/usuarios',
    dashBoardController.getUsuariosConTipo
);


module.exports = router;
