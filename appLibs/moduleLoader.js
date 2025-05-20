const logger = require('./logger')
const fs = require('fs');
const path = require('path');
const vm = require('node:vm')
const db = require("../dataBase/db");

const extensions = require('./moduleExtentions')

// Первым ключом следует обращение к разрешению из файла info.json
// Вторым ключом, следует то, как код внутри модуля, будет обращаться к разрешённой библиотеке
let basicPermissions = {
    Object,
    Function,
    Array,
    Math,
    Date,
    JSON,
    Promise,
    setTimeout,
    setInterval
}
let modulesRoutes = {
    "DataBase": {"db": db},
    "Logging": {"logger": logger},
    "RoutesExpansion": {"REQUIRE_MODULEDATA_FLAG": true, "router": extensions.routerExpansion},
    "ToolManaging": {"REQUIRE_MODULEDATA_FLAG": true, "toolManager": extensions.toolManager}
}

let activeModules = {}

class ModuleCodeExecutor{
    constructor(context){
        this.context = context
    }
    execute(path){
        let executeCode = new vm.Script(fs.readFileSync(path))
        executeCode.runInNewContext(this.context)
    }
    executeWithInput(path, inputObj){
        let executeCode = new vm.Script(fs.readFileSync(path))
        let contextWithInputObj = {...this.context, ...inputObj}
        executeCode.runInNewContext(contextWithInputObj)
    }
}

class Module{
    constructor(name, executor, moduleScripts){
        this.name = name
        this.executor = executor
        this.moduleScripts = moduleScripts
    }
    init(){
        this.executor.execute(this.moduleScripts["init.js"])
    }
    update(){
        this.executor.execute(this.moduleScripts["update.js"])
    }
}

function scriptsModule(name, context, moduleScripts){
    let executor = new ModuleCodeExecutor(context)
    return new Module(name,executor,moduleScripts)
}

function loadModules(){
    logger.info("Loading modules")
    // Считываем директорию модулей и проходимся по каждой директории
    const moduleDirs = fs.readdirSync(path.join(global.appRoot, 'modules'));
    moduleDirs.forEach(
        (dir)=>{
            if(fs.existsSync(path.join(global.appRoot, 'modules', dir))){
                if(!fs.lstatSync(path.join(global.appRoot, 'modules', dir)).isDirectory()){
                    return
                }
            }else{
                return
            }
            // Загрузка модуля
            try {
                const modulePath = path.join(global.appRoot, 'modules', dir);
                const info = JSON.parse(fs.readFileSync(path.join(modulePath, 'info.json')));
                let isErrorOccured = false
                switch (info.status) {
                    case "enabled":
                        let scripts = fs.readdirSync(path.join(modulePath, 'scripts'))
                        let moduleScripts = {}
                        if(scripts){
                            for(let j in scripts){
                                moduleScripts[scripts[j]] = path.join(modulePath, 'scripts', scripts[j])
                            }
                        }
                        let permissions = {}
                        info.npmModuleDependency.forEach((npmModule)=>{
                            try {
                                permissions[npmModule] = require(npmModule)
                            } catch (error){
                                logger.warn(`No such npm module: ${error}`)
                                isErrorOccured = true
                                return
                            }
                        })
                        info.permissions.forEach(
                            (permission)=>{
                                try {
                                    if(modulesRoutes[permission]){
                                        if(modulesRoutes[permission]["REQUIRE_MODULEDATA_FLAG"]){
                                            delete modulesRoutes[permission]["REQUIRE_MODULEDATA_FLAG"]
                                            Object.keys(modulesRoutes[permission]).forEach(
                                                (permissionLib)=>{
                                                    permissions[permissionLib] = modulesRoutes[permission][permissionLib](info.name)
                                                }
                                            )
                                        }else{
                                            Object.keys(modulesRoutes[permission]).forEach(
                                                (permissionLib)=>{
                                                    permissions[permissionLib] = modulesRoutes[permission][permissionLib]
                                                }
                                            )
                                        }

                                    }else{
                                        logger.warn(`Unkown permission ${modulesRoutes[permission]} in module ${dir}`)
                                    }
                                } catch (error) {
                                    logger.warn(`Error during permissions assinging in module ${dir} ${error}`)
                                    isErrorOccured = true
                                    return
                                }
                            }
                        )
                        if(!isErrorOccured){
                            let module = scriptsModule(info.name,permissions,moduleScripts)
                            activeModules[info.name] = module
                            module.init()
                        }
                        break;
                    case "disabled":
                        return
                    default:
                        logger.warn(`Parse error, in module ${dir}. Unkown status: ${info.status}`)
                        break;
                }
            } catch (error) {
                logger.warn(`Error ${error} during module in ${dir}`)
            }
        }
    )
    let activeModulesKeys = Object.keys(activeModules)
    logger.info(`Loading modules complete. Loaded ${activeModulesKeys.length} modules`)
    for(let i in activeModulesKeys){
        let module = activeModulesKeys[i]
        logger.info(`${Number(i)+1}. ${module}`)
    }
};


module.exports = {
    activeModules,
    loadModules
}