const routes = require('express').Router();
const historiaClinicaController = require('../controllers/historia_clinica.controllers');
const jwtVerify = require('../middleware/jwtVerify');

// Obtener historias clínicas de un paciente
routes.get('/historias-clinicas/:id_paciente', jwtVerify, historiaClinicaController.getHistoriasClinicas);

// Obtener una historia clínica puntual
routes.get('/historia-clinica/:id/:id_paciente', jwtVerify, historiaClinicaController.getHistoriaClinica);

// Crear historia clínica
routes.post('/historia-clinica', jwtVerify, historiaClinicaController.postHistoriaClinica);

// Actualizar historia clínica
routes.put('/historia-clinica', jwtVerify, historiaClinicaController.putHistoriaClinica);

// Eliminar historia clínica (baja lógica)
routes.delete('/historia-clinica/:id/:id_paciente', jwtVerify, historiaClinicaController.delHistoriaClinica);

module.exports = routes;
