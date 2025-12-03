const express = require('express');
const routes = express.Router();
const turnoController = require('../controllers/turno.controllers');
const jwtVerify = require('../middleware/jwtVerify');
const fixedToken = require('../middleware/fixedToken');

//Obtiene la lista de turnos
routes.get("/turnos",jwtVerify,turnoController.getTurnos)

//Obtiene un turno en particular 
routes.get("/turno/:id",jwtVerify,turnoController.getTurno)

//Obtiene un turno en particular 
routes.get("/turnosProfecional",jwtVerify,turnoController.getTurnosProfecional)

//Obtiene un turno en particular 
routes.get("/turnosCliente",jwtVerify,turnoController.getTurnosCliente)

//Agregar un turno
routes.post("/turno",jwtVerify,turnoController.postTurno)

//Modificar un Turno
routes.put("/turno",jwtVerify,turnoController.putTurno)

//Borrar un turno
routes.delete("/turno/:id",jwtVerify,turnoController.delTurno)


module.exports = routes