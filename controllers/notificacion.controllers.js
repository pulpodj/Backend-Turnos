const {poolPg} = require('../database/dbconfig');
const sql = require('mssql');
const {responseCreator} = require('../utils/utils')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_KEY;
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

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
        // Crear cliente OAuth2
        const oauth2Client = new OAuth2(
            process.env.GMAIL_CLIENT_ID,      // Client ID
            process.env.GMAIL_CLIENT_SECRET,  // Client Secret
            "https://developers.google.com/oauthplayground" // Redirect URL
        );

        // Configurar refresh token
        oauth2Client.setCredentials({
            refresh_token: process.env.GMAIL_REFRESH_TOKEN
        });

        // Obtener access token
        const accessToken = await oauth2Client.getAccessToken();

        // Configurar transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USUARIO_MAIL,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                accessToken: accessToken.token
            }
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