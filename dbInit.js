const { Pool } = require('pg');
const { prompt } = require('enquirer');
require('dotenv').config()

let connectData = {};
let newDBData = {};
let useConfig;

async function checkDBconnection() {
  let pool = new Pool({
    user: "postgres",
    host: connectData.host,
    database: "postgres",
    password: connectData.password,
    port: connectData.port
  });
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Connected to the database');
    return true;
  } catch (err) {
    console.error(`Error: ${err}. Shutting down...`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function createDB() {
  let pool = new Pool({
    user: "postgres",
    host: connectData.host,
    database: "postgres",
    password: connectData.password,
    port: connectData.port
  });
  console.log(newDBData)
  try {
    let client = await pool.connect();
    try {
      await client.query(`CREATE ROLE ${newDBData.user} WITH
        LOGIN
        PASSWORD '${newDBData.password}'
        NOSUPERUSER
        NOCREATEDB
        NOCREATEROLE
        INHERIT
        NOREPLICATION
        CONNECTION LIMIT -1;`
      );
    } catch (error) {
      console.log(`Error during user creation: ${error}`)
    }
    try {
      await client.query(`CREATE DATABASE ${newDBData.name}
        WITH 
        OWNER = ${newDBData.user}
        TABLESPACE = pg_default
        CONNECTION LIMIT = -1;`
    );
    } catch (error) {
      console.log(`Error during DB creation: ${error}`)
      process.exit()
    }
    client.release();
    console.log('DB created!');
    
  } catch (err) {
    console.error(`Error: ${err}. Cannot connect to database, shutting down`);
    process.exit(1);
  } finally {
    await pool.end();
  }
  pool = new Pool({
    user: newDBData.user,
    host: connectData.host,
    database: newDBData.name,
    password: connectData.password,
    port: connectData.port
  });
  try {
    let client = await pool.connect();
    try {
      await client.query(`CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        login VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
        );`);
    } catch (error) {
      console.log(`Error during DB table creation: ${error}`)
      process.exit()
    }
    try {
      await client.query(`INSERT INTO users (name, email, role, login, password) VALUES ('Admin', 'template@test.test', 'Admin', 'Admin', 'Password121') RETURNING *`);
    } catch (error) {
      console.log(`Error during Admin User creation: ${error}`)
      process.exit()
    }
    client.release();
    console.log('DB table Users created with a admin user "Admin" with password "Password121"');
    return true
  } catch (err) {
    console.error(`Error: ${err}. Cannot connect to database, shutting down`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

let questions = [
  {
    type: 'input',
    name: 'host',
    message: 'DB host(default: localhost):',
    initial: "localhost"
  },
  {
    type: 'number',
    name: 'port',
    message: 'DB port(default: 5432):',
    initial: "5432"
  },
  {
    type: 'password',
    name: 'password',
    message: 'DB Admin password:'
  }
];

prompt(questions).then((answers) => {
  connectData = answers
  checkDBconnection().then(() => {
    if (process.env) {
      if (process.env.DB_USER != "" & process.env.DB_NAME != "" & process.env.DB_PASSWORD != "") {
        console.log(".env config file detected. Use that data to create new database?")
        let questions = [
          {
            type: 'confirm',
            name: "configUse"
          }
        ]
        prompt(questions).then((answers) => {
          useConfig = answers.configUse
          if (useConfig) {
            newDBData.user = process.env.DB_USER.toLowerCase()
            newDBData.name = process.env.DB_NAME.toLowerCase()
            newDBData.password = process.env.DB_PASSWORD
            createDB().then(()=>{
              console.log("DB created successfuly! Exiting program...")
              process.exit(0)
            })
          }
        })
      } else {
        console.log(".env config file detected, but its DB data is not full for DB creation")
      }
    }
    let questions = [
      {
        type: 'input',
        name: 'admin',
        message: 'DB admin user name:',
        initial: "CrmAdmin"
      },
      {
        type: 'number',
        name: 'name',
        message: 'DB name:',
        initial: "CrmDatabase"
      },
      {
        type: 'password',
        name: 'userPassword',
        message: 'DB Admin password:',
        initial: "CrmAdminPassword"
      }
    ];
    prompt(questions).then((answers) => {
      newDBData.user = answers.admin.toLowerCase()
      newDBData.name = answers.name.toLowerCase()
      newDBData.password = answers.userPassword
      createDB().then(()=>{
        console.log("DB created successfuly! Exiting program...")
        process.exit(0)
      })
    })

  })

});