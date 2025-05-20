const jwt = require('jsonwebtoken');
const pool = require('../dataBase/db').pool;
require('dotenv').config()

function authenticateToken(req, res, next) {
    let result = tokenProcess(req)
    if(result.tokenProcessStatus != 200){
        return res.sendStatus(result.tokenProcessStatus)
    }else{
        req.tokenDecodeResult = result.tokenDecodeResult
        next()
    }
}

function tokenProcess(req){
    let result = {};
    let token;
    let id;
    try {
        token = req.cookies.session
        id = req.cookies.id
    } catch (error) {
        result.tokenProcessStatus = 401
        return result
    }
    if(typeof token === 'undefined'){
        result.tokenProcessStatus = 401
        return result
    }
    jwt.verify(token, id+process.env.SESSION_SECRET_KEY, (err, decode) => {
        if(err){
            result.tokenProcessStatus = 403
            return result
        };
        result.tokenProcessStatus = 200
        result.tokenDecodeResult = decode
    });
    return result;
}

async function generateToken(login, password) {
    let user = await pool.query('SELECT * FROM users WHERE login = $1 AND password = $2', [login, password]);
    user = user.rows[0]
    return jwt.sign({
        userId: user.id,
        role: user.role
    },
    user.id+process.env.SESSION_SECRET_KEY,
    { expiresIn: '1h' });
}



function isAdmin(req, res, next){
    if(req.tokenDecodeResult.role == "admin"){
        next()
    }
    res.sendStatus(403)
}

module.exports = {
    tokenProcess,
    authenticateToken,
    generateToken,
    isAdmin
}