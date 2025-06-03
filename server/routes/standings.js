const express = require('express');
const router = express.Router();
const standingsController = require('../controllers/standingsController');

router.get('/', standingsController.getStandings);
router.get('/raw', standingsController.getStandingsRaw); 

module.exports = router;