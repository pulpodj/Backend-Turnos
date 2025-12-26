const express = require('express');
const routes = express.Router();
const notificacionController = require('../controllers/notificacion.controllers');
const jwtVerify = require('../middleware/jwtVerify');
const fixedToken = require('../middleware/fixedToken');


//Agregar un turno
routes.post("/enviarMail",jwtVerify,notificacionController.postMailNotificacion);




module.exports = routes