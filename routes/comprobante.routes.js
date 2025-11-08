const express = require('express');
const routes = express.Router();
const compController = require('../controllers/comprobante.controllers');
const jwtVerify = require('../middleware/jwtVerify');
const fixedToken = require('../middleware/fixedToken');


/*Obtener url donde se aloja el PDF de un comprobante*/
routes.post("/pdf",jwtVerify,compController.postPDF);

/*Obtener listado de comprobantes Pendientes de cobrar */
routes.get("/listaMontosPendientes/:id",jwtVerify,compController.getListaMontosPendientes);

/*Obtener listado de productos Pendientes de retirar de Agroinsumos de un Socio*/
routes.get("/prodPendientesRetiroAgro/:id",jwtVerify,compController.getListaProdPendRetirarAgro);

/*Obtener listado de productos Pendientes de retirar de Nutrución Animal de un Socio*/
routes.get("/prodPendientesRetiroNA/:id",jwtVerify,compController.getListaProdPendRetirarNA);

/*Obtener listado de los ultimos x comprobantes de Hacienda */
routes.get("/ultimosCompHacienda/:id",jwtVerify,compController.getUltimosCompHacienda);

/*Obtener listado de los ultimos x comprobantes de Agroinsumos */
routes.get("/ultimosCompAgroinsumos/:id",jwtVerify,compController.getUltimosCompAgro);


/*Obtener listado de los ultimos x comprobantes de Nutrición Animal */
routes.get("/ultimosCompNA/:id",jwtVerify,compController.getUltimosCompNA);


/*Obtener listado de los ultimos x comprobantes de Acopio */
routes.get("/ultimosCompAcopio/:id",jwtVerify,compController.getUltimosCompAcopio);


/*Obtener listado de los ultimos x comprobantes de Seguros */
routes.get("/ultimosCompSeguros/:id",jwtVerify,compController.getUltimosCompSeguros);


module.exports = routes