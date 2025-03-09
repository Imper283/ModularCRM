const { Pool } = require('pg')
require('dotenv').config()

async function usersTableCheck(pool){
  const createTableQuery = `
  DO $$
  BEGIN
      IF NOT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename = 'users'
      ) THEN
          CREATE TABLE users (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL,
              role VARCHAR(50) NOT NULL,
              login VARCHAR(50) NOT NULL,
              password VARCHAR(255) NOT NULL
          );
          INSERT INTO users (name, email, role, login, password) VALUES ("Admin", "noEmail", "admin", "Admin121", "Password121");
          RAISE NOTICE 'Таблица users успешно создана.';
      ELSE
          RAISE NOTICE 'Таблица users уже существует.';
      END IF;
  END $$;
  `;

  try {
      await pool.query(createTableQuery);
  } catch (err) {
      console.error('Ошибка создания таблицы users:', err);
  }
};

class DB {
  constructor(){
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
    this.pool.query('SELECT NOW()', (err, res) => {
      if(err) {
        console.error('Error connecting to the database', err.stack);
        process.exit(1)
      } else {
        console.log('Connected to the database:', res.rows);
      }
    });
    usersTableCheck(this.pool)
  }
}
const db = new DB()



module.exports = db;