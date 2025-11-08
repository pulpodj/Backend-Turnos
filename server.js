var app = require('./app');
const cron = require('node-cron');
const notificaciones = require('./ETL/notificaciones');
const { connectPools } = require('./database/dbconfig');
 
var portconfig = process.env.PORT;

// Inicializar pools de conexión
connectPools().then(() => {
    app.listen(portconfig,async ()=>{
        console.log(`Servidor Corriendo en puerto ${portconfig}`);
        // Tarea que se ejecuta cada minuto

    });
}).catch(err => {
  console.error('Error al iniciar la aplicación:', err);
  process.exit(1);
})
