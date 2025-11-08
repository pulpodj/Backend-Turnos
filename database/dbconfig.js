const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const sql = require('mssql');
const {Pool} = require('pg');

// Configuración del pool de conexiones
const poolConfig = {
    max: 10, // máximo número de conexiones en el pool
    min: 0,  // mínimo número de conexiones en el pool
    idleTimeoutMillis: 30000, // tiempo máximo que una conexión puede estar inactiva
    acquireTimeoutMillis: 30000, // tiempo máximo para adquirir una conexión
    createTimeoutMillis: 30000, // tiempo máximo para crear una conexión
    destroyTimeoutMillis: 5000, // tiempo máximo para destruir una conexión
    reapIntervalMillis: 1000, // intervalo para verificar conexiones inactivas
    createRetryIntervalMillis: 100, // intervalo entre intentos de crear conexión
};



const configPG = {
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: 10,             // Máximo de conexiones
  idleTimeoutMillis: 30000, // Tiempo de inactividad permitido
  connectionTimeoutMillis: 30000, // Tiempo máximo para establecer conexión
  ssl: {
    rejectUnauthorized: false // 🔥 clave para Render / Heroku / Neon
  }
}

// Configuración del pool
const poolPg = new Pool(configPG);


// Conectar pools
const connectPools = async () => {
    try {
        console.log('Conectando pools de conexión...');
        
        // Probar conexión PostgreSQL
        poolPg.connect()
        .then(client => {
            console.log('Conexión exitosa a PostgreSQL Portal');
            client.release();
        })
        .catch(err => {
            console.error('Error al conectar con PostgreSQL Portal:', err);
        });
        
    } catch (err) {
        console.error('Error al conectar los pools:', err);
    }
};



module.exports = {
        poolPg,
        connectPools
};