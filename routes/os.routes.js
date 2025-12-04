const routes = require('express').Router();
const osController = require('../controllers/os.controllers');
const jwtVerify = require('../middleware/jwtVerify');

// Obtener listado
routes.get('/obras_sociales', jwtVerify, osController.getOSs);

// Obtener uno
routes.get('/obra_social/:id', jwtVerify, osController.getOS);

// Crear
routes.post('/obra_social', jwtVerify, osController.postOS);

// Actualizar
routes.put('/obra_social', jwtVerify, osController.putOS);

module.exports = routes;