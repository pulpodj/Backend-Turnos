const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
const usuarioRoutes = require('./routes/usuario.routes');
const pacienteRoutes = require('./routes/paciente.routes');
const profecionalRoutes = require('./routes/profecional.routes');
const turnoRoutes = require('./routes/turno.routes');
const movimientoRoutes = require('./routes/movimiento.routes');
const movimientoTipoRoutes = require('./routes/movimiento_tipo.routes');
const osRoutes = require('./routes/os.routes');
const historiaRoutes = require('./routes/historia_clinica.routes');

const jwt = require('jsonwebtoken');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var router = express.Router();
const basicAuth = require('express-basic-auth');

// Configurar límites para solicitudes JSON
app.use(express.json({ limit: '50mb' })); // Ajusta el límite según tus necesidades

// Configurar límites para solicitudes URL-encoded
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Ajusta el límite según tus necesidades

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use('/API',[
        usuarioRoutes,
        pacienteRoutes,
        profecionalRoutes,
        turnoRoutes,
        movimientoRoutes,
        movimientoTipoRoutes,
        osRoutes,
        historiaRoutes
        ]);  

    


module.exports = app;

