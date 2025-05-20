const logger = require("../appLibs/logger")
const { Pool } = require('pg')
require('dotenv').config()

let pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

pool.query('SELECT NOW()', (err, res) => {
  if(err) {
    logger.error(`Error: ${err}. Cannot connect to database, shutting down `)
    logger.warn(`Use "npm run dbInit" if database is not existant`)
    process.exit(1)
  } else {
    logger.info('Connected to the database');
  }
})

class DB {
  constructor(){
    this.pool = pool
  }
  isTableExist(tableName){
    this.pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = ${tableName}
      ) AS table_exists;`)
  }
}
const db = new DB()



module.exports = db;