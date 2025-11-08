const express = require('express');
const routes = express.Router();
const pacienteController = require('../controllers/paciente.controllers')
const jwtVerify = require('../middleware/jwtVerify');


/*Obtener Lista Usuarios*/
routes.get('/pacientes',jwtVerify,pacienteController.getPacientes);

//obtener usuario espesifico 
routes.get("/paciente/:id",jwtVerify,pacienteController.getPaciente);

//login de Paciente
routes.post("/loginPaciente",pacienteController.loginPaciente);

//Agregar un Paciente
routes.post("/paciente",jwtVerify,pacienteController.postPaciente)

//Actualizar un Paciente
routes.put("/paciente",jwtVerify,pacienteController.putPaciente)

//Eliminar un usuario
routes.delete("/paciente/:id",jwtVerify,pacienteController.delPaciente)


module.exports = routes