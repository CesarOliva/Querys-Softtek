const express = require('express');

const router = express.Router();

const clientController = require('../controllers/clientController');

router.get('/clients', clientController.getClients);
router.get('/clients/risk', clientController.getClientsRisk);
router.get('/clients/high-spent', clientController.getClientsHighSpent);

module.exports = router;