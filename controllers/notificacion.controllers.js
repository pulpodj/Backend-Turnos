const {poolPg} = require('../database/dbconfig');
const sql = require('mssql');
const {responseCreator} = require('../utils/utils')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_KEY;
const nodemailer = require('nodemailer');



/*Crea un nuevo Usuario */
const postMailNotificacion = async (req, res) => {
    try {
        const {nombre,apellido,mail,telefono} = req.body;
        
        const texto = `La persona ${nombre} ${apellido} ha solicitado un turno.
        Mail: ${mail}
        Teléfono: ${telefono}`;
        
        const respuesta = await enviarMailError(texto);

        if (respuesta) {
            return res.status(200).send({msg:'Mail enviado correctamente'});
        } else {
            return res.status(404).send({msg:'No se pudo enviar el mail'}); 
        }
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}


/* Funcion para enviar por mail los errores del proxi de Bica*/
async function enviarMailError(texto) {
   try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.USUARIO_MAIL,
                pass: process.env.PASS_MAIL
            },
            connectionTimeout: 10000,  // 10 segundos
            greetingTimeout: 10000,
            socketTimeout: 10000
        });
        
        let mailOptions = {
            from: process.env.USUARIO_MAIL,
            to: 'neffenpioli@gmail.com',
            subject: 'Pedido de Turno - Sistema de Turnos',
            text: texto
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: ' + info.response);
        return true;
        
    } catch (error) {
        console.log('Error al enviar correo:', error);
        return false;
    }
}




module.exports = {
    postMailNotificacion
}