const logger = require("../appLibs/logger")
const pool = require('../dataBase/db').pool;
const authentication = require('../appLibs/authLib');

exports.login = async (req, res) => {
    const { login, password } = req.body;
    let user;
    try {
        let poolReq = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
        user = await poolReq.rows[0]
    } catch (error) {
        return res.status(401).json({ message: 'Пользователь не существует' });
    }
    if (password === user.password) {
        const token = await authentication.generateToken(login, password);
        res.cookie('name', user.name , {
            // httpOnly: true,
            maxAge: 3600000
        });
        res.cookie('session', token, {
            // httpOnly: true,
            maxAge: 3600000 // 3600 - secs * 1000 For whatever reasson express seems to use miliseconds, instead of seconds :/
        });
        res.cookie('id', user.id , {
            // httpOnly: true,
            maxAge: 3600000
        });
        return res.status(200).json({ message: 'Аутентификация успешна' });
    }else{
        return res.status(401).json({ message: 'Неправильный пароль' });
    }
};

exports.logout = async (req, res) => {
    try {
        res.cookie('session', null, { maxAge: 0 });
        return res.status(200).json({ message: 'Выход успешно выполнен' });
    } catch (error) {
        return res.status(400)
    }
}