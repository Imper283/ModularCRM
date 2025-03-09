const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authentication = require('../appLibs/authLib');
const modules = require('../appLibs/moduleLoader');

router.use(authentication.authenticateToken)

router.get('/users', authentication.isAdmin, userController.getUsers);
router.post('/users', authentication.isAdmin, userController.createUser);
router.put('/users/:id', authentication.isAdmin, userController.updateUser);
router.delete('/users/:id', authentication.isAdmin, userController.deleteUser);

router.get('/search/user/:search', authentication.isAdmin, userController.searchUser);


router.get('/module/request/:name', modules.moduleRoleValidation);
router.get('/module/getAvailable', modules.getAvailableModules);


module.exports = router;