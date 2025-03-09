const fs = require('fs');
const path = require('path');

function loadModules(){
    let roles = {};
    const moduleDirs = fs.readdirSync(path.join(global.appRoot, 'Modules'));
    moduleDirs.forEach(dir => {
        try {
            const modulePath = path.join(global.appRoot, 'Modules', dir);
            const info = JSON.parse(fs.readFileSync(path.join(modulePath, 'info.json')));
            info.roles.forEach(role => {
                roles[role] = roles[role] || {}
                roles[role][info.name] = roles[role][info.name] || `/modules/${dir}/module.html`
            })
        } catch (error) {
            console.log(`Error during module "${dir}" loading: `, error)
        }
        
    });
    return roles;
};

global.modulesRoles = loadModules()

function getAvailableModules(req, res) {
    let userRole;
    const roles = global.modulesRoles
    try {
        userRole = req.tokenDecodeResult.role;
        
    } catch (error) {
        return res.sendStatus(400);
    }
    
    if (!roles[userRole]) {
        return res.sendStatus(404);
    }
    const availableModules = roles[userRole];
    const transformedModules = {};
    for (const [moduleName, modulePath] of Object.entries(availableModules)) {
        transformedModules[moduleName] = `/api/module/request/${moduleName}`;
    }
    res.json(transformedModules);
}


function moduleRoleValidation(req, res) {
    const roles = global.modulesRoles
    let userRole;
    let moduleName;
    try {
        userRole = req.tokenDecodeResult.role;
        moduleName = req.params.name;
    } catch (error) {
        return res.sendStatus(400);
    }
    let modulePath;
    try {
        modulePath = roles[userRole][moduleName];
        res.sendFile(path.join(global.appRoot, modulePath));
    } catch (error) {
        return res.sendStatus(404);
    }
}

module.exports = {
    moduleRoleValidation,
    getAvailableModules
}