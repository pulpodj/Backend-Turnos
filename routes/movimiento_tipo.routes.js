const routes = require('express').Router();
const movimientoTipoController = require('../controllers/movimiento_tipo.controllers');
const jwtVerify = require('../middleware/jwtVerify');

// Obtener listado
routes.get('/movimiento_tipos', jwtVerify, movimientoTipoController.getMovimientoTipos);

// Obtener uno
routes.get('/movimiento_tipo/:id', jwtVerify, movimientoTipoController.getMovimientoTipo);

// Crear
routes.post('/movimiento_tipo', jwtVerify, movimientoTipoController.postMovimientoTipo);

// Actualizar
routes.put('/movimiento_tipo', jwtVerify, movimientoTipoController.putMovimientoTipo);

// Baja lógica
routes.delete('/movimiento_tipo/:id', jwtVerify, movimientoTipoController.delMovimientoTipo);

module.exports = routes;
