const express = require('express');
const routes = express.Router();
const usuarioController = require('../controllers/usuario.controllers')
const jwtVerify = require('../middleware/jwtVerify');


/*Obtener Lista Usuarios*/
routes.get('/usuarios',jwtVerify,usuarioController.getUsuarios);

//obtener usuario espesifico 
routes.get("/usuario/:id",jwtVerify,usuarioController.getUsuario);

//login de Usuario
routes.post("/login",usuarioController.login);

//Agregar un usuario
routes.post("/usuario",jwtVerify,usuarioController.postUsuario)

//Actualizar un usuario
routes.put("/usuario",jwtVerify,usuarioController.putUsuario)

//Eliminar un usuario
routes.delete("/usuario/:id",jwtVerify,usuarioController.delUsuario)

module.exports = routes