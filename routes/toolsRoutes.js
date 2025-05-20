const express = require('express');
const router = express.Router();
const authentication = require('../appLibs/authLib');

router.use(authentication.authenticateToken)

router.get('/tool/request/:name', modules.moduleRoleValidation);
router.get('/tool/getAvailable', modules.getAvailableModules);

module.exports = router;