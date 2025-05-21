const express = require('express');
const fs = require('fs');
const moduleRouter = express.Router();
const toolRouter = express.Router();
const logger = require('./logger')

//Permission name: RoleManage
class RoleUtils{
    #moduleName
    constructor(name){
        this.#moduleName = name
    }
    middlewareRolesToCheck(rolesAr){
        return (req, res, next)=>{
            if(req.tokenDecodeResult.role == "admin"){
                next()
            }else{
                rolesAr.forEach( (role)=> {
                    if(role == req.tokenDecodeResult.role){
                        next()
                    }
                });
            }
            res.status(403).json({ message: 'Ошибка доступа' });
        }
    }
}
function roleUtils(name){
    return new RoleUtils(name)
}

let activeTools = {};

//Permission name: ToolManage
class ToolManager{
    #moduleName
    constructor(name){
        this.#moduleName = name
    }
    createTool(name, roles, htmlPath, resourcesDir, ...args) {
        const basePath = `/${this.#moduleName}/${name}`;
        const middleware = args;
        
        // Обработчик основной страницы
        const pageHandler = (req, res) => {
            res.sendFile(htmlPath);
        };

        // Обработчик статических ресурсов с защитой от directory traversal
        const resourcesHandler = (req, res) => {
            // Получаем относительный путь к файлу
            const relativePath = req.path.replace(`${basePath}/resources/`, '');
            
            // Защита от directory traversal
            const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/g, '');
            
            const fullPath = path.join(resourcesDir, safePath);
            
            // Проверяем, что файл существует и находится внутри разрешенной директории
            fs.stat(fullPath, (err, stats) => {
                if (err || !stats.isFile()) {
                    return res.status(404).send('Not found');
                }

                // Определяем MIME-тип по расширению файла
                const mimeTypes = {
                    '.html': 'text/html',
                    '.js': 'text/javascript',
                    '.css': 'text/css',
                    '.json': 'application/json',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.svg': 'image/svg+xml',
                    '.woff': 'font/woff',
                    '.woff2': 'font/woff2',
                    '.ttf': 'font/ttf'
                };

                const ext = path.extname(fullPath);
                const contentType = mimeTypes[ext] || 'application/octet-stream';

                // Читаем и отправляем файл
                fs.readFile(fullPath, (err, data) => {
                    if (err) {
                        return res.status(500).send('Internal server error');
                    }
                    
                    res.set('Content-Type', contentType);
                    res.send(data);
                });
            });
        }
        // Регистрируем маршруты
        if (middleware.length > 0) {
            toolRouter.get(basePath, ...middleware, pageHandler);
            toolRouter.get(`${basePath}/resources/*`, ...middleware, resourcesHandler);
        } else {
            toolRouter.get(basePath, pageHandler);
            toolRouter.get(`${basePath}/resources/*`, resourcesHandler);
        }
        roles.forEach((role)=>{
            activeTools[role][name] = true
        })
    };
}
function toolManager(name){
    return new ToolManager(name)
}

//Permission name: RouteExpand
class RoutesExpansion{
    #moduleName
    constructor(name){
        this.#moduleName = name
    }
    createGetRoute(route, ...args) {
        const path = `/${this.#moduleName}/${route}`;
        const callback = args[args.length - 1];
        const middleware = args.slice(0, -1);
        if (middleware.length > 0) {
            moduleRouter.get(path, ...middleware, callback);
        } else {
            moduleRouter.get(path, callback);
        }
    }
    createPostRoute(route, ...args) {
        const path = `/${this.#moduleName}/${route}`;
        const callback = args[args.length - 1];
        const middleware = args.slice(0, -1);
        if (middleware.length > 0) {
            moduleRouter.post(path, ...middleware, callback);
        } else {
            moduleRouter.post(path, callback);
        }
    }
}
function routerExpansion(moduleName){
    return new RoutesExpansion(moduleName)
}

module.exports = {
    roleUtils,
    toolManager,
    routerExpansion,
    toolRouter,
    moduleRouter
}
