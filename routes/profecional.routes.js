const express = require('express');
const routes = express.Router();
const profecionalController = require('../controllers/profecional.controllers')
const jwtVerify = require('../middleware/jwtVerify');


/*Obtener Lista Usuarios*/
routes.get('/profesionales',jwtVerify,profecionalController.getProfesionales);

//obtener usuario espesifico 
routes.get("/profesional/:id",jwtVerify,profecionalController.getProfesional);

//login de Paciente
routes.post("/loginProfesional",profecionalController.loginProfesional);

//Agregar un Paciente
routes.post("/profesional",jwtVerify,profecionalController.postProfesional)

//Actualizar un Paciente
routes.put("/profesional",jwtVerify,profecionalController.putProfesional)

//Eliminar un usuario
routes.delete("/profesional/:id",jwtVerify,profecionalController.delProfesional)


module.exports = routes