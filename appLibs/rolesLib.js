const fs = require("fs")
const path = require("path")

class role{
    constructor(name, flags){
        this.name = name
        this.flags = flags
    }
}

function rolesLoader(){
    const rolesDirs = fs.readdirSync(path.join(global.appRoot, 'roles'));
    // И да я знаю что в js есть foreach, но он выглядит мерзко и его структура просто срёт в то как я читаю свой код, и потому что это мой проект, я буду городить свою парашу, не просто для проекта, но для души!! xd
    for(let i in rolesDirs){
        let role = rolesDirs[i]
        try {
            let roleData = JSON.parse(fs.readFileSync(path.join(global.appRoot,"roles",role)))
        } catch (error) {
            
        }

    }
}