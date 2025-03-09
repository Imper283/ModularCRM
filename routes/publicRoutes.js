const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get("/", publicController.frontPage);

module.exports = router;