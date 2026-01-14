const express = require('express');
const routes = express.Router();
const notificacionController = require('../controllers/notificacion.controllers');
const jwtVerify = require('../middleware/jwtVerify');
const fixedToken = require('../middleware/fixedToken');


// Obtener listado de notificaciones
routes.get('/notificaciones', jwtVerify, notificacionController.getNotificaciones);

// Obtener una notificación puntual
routes.get('/notificacion/:id', jwtVerify, notificacionController.getNotificacion);

// Crear notificación
routes.post('/notificacion', notificacionController.postNotificacion);

// Actualizar notificación
routes.put('/notificacion', jwtVerify, notificacionController.putNotificacion);

// Eliminar notificación (baja lógica)
routes.delete('/notificacion/:id', jwtVerify, notificacionController.delNotificacion);

module.exports = routes;

//Agregar un turno
routes.post("/enviarMail",jwtVerify,notificacionController.postMailNotificacion);




module.exports = routes