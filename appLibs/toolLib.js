const fs = require("fs")
const path = require("path")

let activeTools = {
    "admin": {"ClientManager": true}
};


class Tool {
    constructor(toolFolderPath){
        this.toolFolderPath = toolFolderPath
    }
}

function registerTool(roles, toolName){
    roles.array.forEach( (role)=> {
        activeTools[role][toolName] = true
    });
}

function getModulesForRole(role){
    return activeTools[role]
}

module.exports = {
    activeTools
}

