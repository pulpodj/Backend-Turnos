const routes = require('express').Router();
const movimientoOrigenController = require('../controllers/movimiento_origen.controllers');
const jwtVerify = require('../middleware/jwtVerify');

// Obtener listado
routes.get('/movimiento_origenes', jwtVerify, movimientoOrigenController.getMovimientoOrigenes);

// Obtener uno
routes.get('/movimiento_origen/:id', jwtVerify, movimientoOrigenController.getMovimientoOrigen);

// Crear
routes.post('/movimiento_origen', jwtVerify, movimientoOrigenController.postMovimientoOrigen);

// Actualizar
routes.put('/movimiento_origen', jwtVerify, movimientoOrigenController.putMovimientoOrigen);

// Baja lógica
routes.delete('/movimiento_origen/:id', jwtVerify, movimientoOrigenController.delMovimientoOrigen);

module.exports = routes;
