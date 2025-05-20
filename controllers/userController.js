const pool = require('../dataBase/db').pool;

exports.getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUser = async (req, res) => {
    const { id } = req.body
    try {
        const result = await pool.query('SELECT * FROM users WHERE id LIKE $1', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchUser = async (req, res) => {
    const { search } = req.params
    try {
        const result = await pool.query('SELECT * FROM users WHERE name LIKE $1 OR email LIKE $1 OR login LIKE $1', [search]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    const { name, email, role, login, password } = req.body;
    try {
        const result = await pool.query('INSERT INTO users (name, email, role, login, password) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, email, role, login, password]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, login, password } = req.body;
    try {
        const result = await pool.query('UPDATE users SET name = $1, email = $2, role = $3, login = $4, password = $5 WHERE id = $6 RETURNING *', [name, email, role, login, password, id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};