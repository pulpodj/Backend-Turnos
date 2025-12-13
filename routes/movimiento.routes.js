const routes = require('express').Router();
const movimientoController = require('../controllers/movimiento.controllers');
const jwtVerify = require('../middleware/jwtVerify');

// Obtener listado de movimientos
routes.get('/movimientos', jwtVerify, movimientoController.getMovimientos);

// Obtener un movimiento específico
routes.get('/movimiento/:id', jwtVerify, movimientoController.getMovimiento);

// Obtener listado de movimientos
routes.get('/searchMovimientos', jwtVerify, movimientoController.getMovimientos);

// Agregar un movimiento
routes.post('/movimiento', jwtVerify, movimientoController.postMovimiento);

// Actualizar un movimiento
routes.put('/movimiento', jwtVerify, movimientoController.putMovimiento);

// Eliminar un movimiento
routes.delete('/movimiento/:id', jwtVerify, movimientoController.delMovimiento);

module.exports = routes;
