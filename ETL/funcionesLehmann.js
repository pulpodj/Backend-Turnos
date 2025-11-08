const config = require('../database/dbconfig');
const sql = require('mssql');
const axios = require('axios');
const moment = require('moment-timezone');
const { use } = require('react');
const fbAccessToken = process.env.FB_WHATSAPP_TOKEN;

     



/*Envia un Mensaje con los datos del Romaneo*/
const enviarMesajeRomaneo  = async (listaCel,romaneo) => {
  try {
    if(!fbAccessToken){
      console.warn('FB_WHATSAPP_TOKEN no configurado, no se envían mensajes de WhatsApp.');
      return false;
    }
    for(cel of listaCel) {
      let data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": '"'+ cel.celular+'"',
        "type": "template",
        "template": {
          "name": "romaneos",
          "language": {
            "policy": "deterministic",
            "code": "es_AR"
          },
          "components": [
            {
              "type": "header",
              "parameters": [
                {
                  "type": "image",
                  "image": {
                    "link": "https://storage.googleapis.com/brocoly/65ddfee7bcaf74678a62bb6d/mediaResources/1732795784224.jpg"
                  }
                }
              ]
            },
            {
              "type": "body",
              "parameters": [
                { "type": "text","text": ''+ romaneo.cliente +'' },
                { "type": "text","text": ''+ romaneo.cuenta +'' },
                { "type": "text","text": ''+ romaneo.fecha +'' },       
                { "type": "text","text": ''+ romaneo.nrocartadeporte +'' },
                { "type": "text","text": ''+ romaneo.planta +'' },
                { "type": "text","text": ''+ romaneo.grano +'' },
                { "type": "text","text": ''+ romaneo.cosecha +'' },
                { "type": "text","text": ''+ romaneo.limpios +'' },
                { "type": "text","text": ''+ romaneo.humedad +'' },
                { "type": "text","text": ''+ romaneo.bruto +'' },
                { "type": "text","text": ''+ romaneo.tara +'' },
                { "type": "text","text": ''+ romaneo.neto +'' },
                { "type": "text","text": ''+ romaneo.merma +'' },
                { "type": "text","text": ''+ romaneo.chofer +'' },
                { "type": "text","text": ''+ romaneo.patente +'' },
                { "type": "text","text": ''+ romaneo.kmsrec +'' }
              ]
            }]
        }
      });

      let configP = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graph.facebook.com/v19.0/102241399436050/messages',
        headers: { 
            'Authorization': `Bearer ${fbAccessToken}`, 
            'Content-Type': 'application/json'
        },
        data : data
        };
        
    axios.request(configP)
        .then((response) => {
          console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
      };
    console.log('Mensaje Enviado a : ',listaCel);
    return true
 }catch(error){
     console.log('Error al enviar Alerta: ',error);
     return false;
     }
}



module.exports = {
  actualizarOrdenes
}