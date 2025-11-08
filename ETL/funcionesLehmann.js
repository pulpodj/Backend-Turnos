const config = require('../database/dbconfig');
const sql = require('mssql');
const axios = require('axios');
const { date } = require('azure');
const moment = require('moment-timezone');
const { use } = require('react');
const urlPhysisWeb = "https://cuentas.cooperativalehmann.coop";
const userPhysis =  process.env.ADMIN_USER ;
const passPhysis =  process.env.ADMIN_PASSWORD ;
const fbAccessToken = process.env.FB_WHATSAPP_TOKEN;

// Funcion para cargar los asientos en Server de Physis
async function actualizarOrdenes()  {

    //await actualizarListaRomaneos();
    //await enviarListaRomaneos(); 

}


// Funcion para cargar los asientos en Server de Physis
async function actualizarListaRomaneos()  {
    try {
     
      let listaCompFaltantes = [];

      let listaCompBot = await listaRomaneosBot();
      let listaCompPhysis = await listaRomaneosPhysis();
      
      listaCompFaltantes = listaCompPhysis.filter(
        comp => !listaCompBot.some(item => item.nrocartadeporte === comp.nrocartadeporte)
      );  


      if(listaCompFaltantes.length === 0) {
        console.log('No hay datos para Importar :');
     
        return false;
    }else{
        let scripts = `delete 
                      from db_bot.dbo.Lista_Romaneos
                      Where fechahora < DATEADD(day,-5,getDATE())  \n`;
        
        for(comp of listaCompFaltantes) {
          scripts +=  `INSERT INTO db_bot.dbo.Lista_Romaneos (cuenta,planta,silo,grano,cosecha,fechahora,bruto,tara,merma,neto,humedad,chofer,patente,kmsrec,cliente,nrocartadeporte,enviado) 
                      VALUES('${comp.cuenta}','${comp.planta}',${comp.silo},'${comp.grano}','${comp.cosecha}'
                      ,'${comp.fechahora}',${comp.bruto},${comp.tara},${comp.merma},${comp.neto},${comp.humedad}
                      ,'${comp.chofer}','${comp.patente}',${comp.kmsrec},'${comp.cliente}'
                      ,'${comp.nrocartadeporte}',0) \n`;
      };

      await guardarScript(scripts)
      
      console.log('Se agregaron los Romaneos Faltantes ');
       
        return true;    
    };      
  
    }catch(error){ 
        console.log(error);
        return false;
    }   
          

}

// Funcion para cargar los asientos en Server de Physis
async function enviarListaRomaneos()  {
  try {
    let listaRomBot = await listaRomaneosBotNoEnviados();
    let cel = '';

    if(listaRomBot.length === 0) {
      console.log('No hay Romaneos para Enviar :');
    //  await actualizarURLCompProv();
      return false;
  }else{
            
      for(rom of listaRomBot) {
        cel = await celRomaneosLehmann(rom.cuenta);
        
        if(cel !== null && cel !== undefined && cel.length !== 0){
           let res = await enviarMesajeRomaneo(cel,rom);
          if(res){
            await actualizarRomaneoEnviado(rom.nrocartadeporte);
            console.log('Se enviaron los Romaneos Faltantes ');
          }else{
            console.log('Error al enviar el Romaneo: ',rom.nrocartadeporte);
          }
        }
    };

    
      return true;    
  };      

  }catch(error){ 
      console.log(error);
      return false;
  }   
        

}


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

async function guardarScript(scripts){
  try {
    const pool = await sql.connect(config.config3);
    await pool.request().query(scripts);
    sql.close();
  } catch (error) {
    console.log(error)
  }
  

}

async function listaRomaneosPhysis(){
  try {
    let compPhysis = [];
    const pool = await sql.connect(config.config);
    let respuesta = await pool.request()
      .query(`exec DW_Lehmann.dbo.BOT_CargarListaRomaneos`);
    sql.close();
    compPhysis = respuesta.recordsets[0];  
    return compPhysis;
  } catch (error) {
    console.log(error)
    return [];
  }
  
}

async function celRomaneosLehmann(cuenta){
  try {
    
    const pool = await sql.connect(config.config4);
    let respuesta = await pool.request()
      .query(`exec DB_Georeferencia.dbo.celRomaneo ${cuenta}`);
    sql.close();
      return respuesta.recordset;  
  } catch (error) {
    console.log(error)
    return [];
  }
  
}

async function listaRomaneosBot(){
  try {
  let compBot = [];
  const pool = await sql.connect(config.config3);
  let respuesta = await pool.request()
      .query(`SELECT nrocartadeporte FROM db_bot.dbo.Lista_Romaneos`);
  sql.close();
  compBot = respuesta.recordsets[0];  
  return compBot;
} catch (error) {
  console.log(error)
  return [];
}
}

async function actualizarRomaneoEnviado(nroCP){
  try {
  
    const pool = await sql.connect(config.config3);
    await pool.request()
      .query(`UPDATE db_bot.dbo.Lista_Romaneos 
              SET enviado = 1 
              WHERE nrocartadeporte = '${nroCP}'`);
    sql.close();
  
    return true;
} catch (error) {
    console.log(error)
    return false;
}
}

async function listaRomaneosBotNoEnviados(){
  try {
  let compBot = [];
  const pool = await sql.connect(config.config3);
  let respuesta = await pool.request()
      .query(`SELECT cuenta
                    ,planta
                    ,silo
                    ,grano
                    ,cosecha
                    ,fecha = FORMAT(fechahora,'dd-MM-yyyy')
                    ,bruto = FORMAT(bruto, 'N0', 'es-AR')
                    ,tara = FORMAT(tara, 'N0', 'es-AR')
                    ,merma = FORMAT(merma, 'N0', 'es-AR')
                    ,neto = FORMAT((bruto - tara), 'N0', 'es-AR')
                    ,limpios = FORMAT(neto , 'N0', 'es-AR')
                    ,humedad = ROUND(humedad ,2)
                    ,chofer
                    ,patente
                    ,kmsrec
                    ,cliente
                    ,nrocartadeporte
                    ,enviado
              FROM db_bot.dbo.Lista_Romaneos
              Where enviado = 0`);
  sql.close();
  compBot = respuesta.recordsets[0];  
  return compBot;
} catch (error) {
  console.log(error)
  return [];
}
}

async function cargarComprHacSinContraparte(){

await actListaCreditosCompletos();
await actListaComprHacSinContraparte();

}

async function  actListaComprHacSinContraparte(){
  try {
    const pool = await sql.connect(config.config);
    await pool.request().query(`exec DW_Lehmann.dbo.BI_CargarComprHacSinContraparte`);
    sql.close();
    console.log('Lista Comprobantes Hacienda Actualizada')
  } catch (error) {
    console.log(error)
  }
  

}

async function  actListaCreditosCompletos(){
  try {
    const pool = await sql.connect(config.config);
    let credito  = await pool.request()
                    .query(`exec Phy_WinSiges_00576_01_00001_0100.dbo.spRptCreditoDisponibleCompleto 0,1`);
    sql.close();
    let scripts = 'truncate table DW_Lehmann.dbo.BI_CreditosDisponiblesComnpletos \n';
    const creditos = credito.recordsets[0];   
    //console.log(creditos)      
    creditos.forEach((cred) => {
      scripts +=  `INSERT INTO DW_Lehmann.dbo.BI_CreditosDisponiblesComnpletos
           (IdCtaAuxi
           ,MonedaSigno
           ,IdMoneda
           ,Moneda
           ,Monto
           ,Valores
           ,ValoresApagar
           ,PedidosPendientes
           ,RemitosPendientes
           ,LotesPendientes
           ,CerealValorizado
           ,FacturasPendientes
           ,ReferenciadosSAfectar
           ,Utilizado
           ,Disponible)
     VALUES
           (${cred.IdCtaAuxi}
           ,'${cred.MonedaSigno}'
           ,'${cred.IdMoneda}'
           ,'${cred.Moneda}'
           ,${cred.Monto}
           ,${cred.Valores}
           ,${cred.ValoresApagar}
           ,${cred.PedidosPendientes}
           ,${cred.RemitosPendientes}
           ,${cred.LotesPendientes}
           ,${cred.CerealValorizado}
           ,${cred.FacturasPendientes}
           ,${cred.ReferenciadosSAfectar}
           ,${cred.Utilizado}
           ,${cred.Disponible})\n`;
      });
    
    await pool.request().query(scripts);
    
    console.log('Lista de creditos dsiponible Actualizada')
  } catch (error) {
    console.log(error)
  }
  

}

// Funcion para cargar los asientos en Server de Physis
async function URLComprobante(idEjercicio,idComprobante)  {
    try {
        const usuario = {
            username: userPhysis,
            password: passPhysis,
            idSerial: "00576_01",
            idEmpresa: "00001"
        }
    
        let respuesta = await axios.post(`${urlPhysisWeb}/phy2service/api/core/auth`, usuario);
        let token = respuesta.data.token;
        let urlFinal;
        let urlPDF = await axios.get(`${urlPhysisWeb}/phy2service/api/pdf?idEjercicio=${idEjercicio}&idComprobante=${idComprobante}&unificado=true`, {
                headers: { 'Authorization': `Bearer ${token}` }
        });
        
        urlFinal = urlPDF.data.datos.url;
        urlFinal = urlFinal.substring(20,(urlFinal.length))
        urlFinal = urlPhysisWeb +'/' +urlFinal;
        
        return(urlFinal);   
    } catch (error) {
        console.log(error);
        //enviarMailError(error,'Error al Atualizar las URLs de Comprobnates de Proveedores');
    }
    
}

// Funcion que de devuelve el resumen por vencimiento de un socio
async function resumenPorVencimiento(idSocio,inicio,fin)  {
    try {     
        const usuario = {
            username: userPhysis,
            password: passPhysis,
            idSerial: "00576_01",
            idEmpresa: "00001"
        }
    
        let respuestaT = await axios.post(`${urlPhysisWeb}/phy2service/api/core/auth`, usuario);
        let token = respuestaT.data.token;
        
        let respuestaR = await axios.get(`${urlPhysisWeb}/phy2service/api/siges/resumen-por-vencimiento?idAuxi=1&idCtaAuxi=${idSocio}&fechaDesde=${inicio}&fechaHasta=${fin}&multimoneda=false`, {
                headers: { 'Authorization': `Bearer ${token}` }
        });
             

        return(respuestaR.data.datos);   
    } catch (error) {
        console.log(error);
        //enviarMailError(error,'Error al Atualizar las URLs de Comprobnates de Proveedores');
    }
    
}

// Funcion que de devuelve el resumen de duenta de un socio
async function resumenDeCuenta(idSocio,inicio,fin)  {
    try {
         const usuario = {
            username: userPhysis,
            password: passPhysis,
            idSerial: "00576_01",
            idEmpresa: "00001"
        }
    
        let respuestaT = await axios.post(`${urlPhysisWeb}/phy2service/api/core/auth`, usuario);
        let token = respuestaT.data.token;
        let resumen;
        let respuestaR = await axios.get(`${urlPhysisWeb}/phy2service/api/siges/resumen-de-cuenta?idAuxi=1&idCtaAuxi=${idSocio}&fechaDesde=${inicio}&fechaHasta=${fin}`, {
                headers: { 'Authorization': `Bearer ${token}` }
        });
        
        resumen = respuestaR.data.datos;
                
        return(resumen);   
    } catch (error) {
        console.log(error);
        //enviarMailError(error,'Error al Atualizar las URLs de Comprobnates de Proveedores');
    }
    
}


// Funcion para cargar los asientos en Server de Physis
async function resumenDeCuentaPDF(idSocio,inicio,fin)  {
    try {
         const usuario = {
            username: userPhysis,
            password: passPhysis,
            idSerial: "00576_01",
            idEmpresa: "00001"
        }
    
        let respuestaT = await axios.post(`${urlPhysisWeb}/phy2service/api/core/auth`, usuario);
        let token = respuestaT.data.token;
        
        let respuestaR = await axios.get(`${urlPhysisWeb}/phy2service/api/siges/resumen-de-cuenta/pdf?idAuxi=1&idCtaAuxi=${idSocio}&fechaDesde=${inicio}&fechaHasta=${fin}`, {
                headers: { 'Authorization': `Bearer ${token}` }
        });
               
        return(respuestaR.data.Datos.Nombre);   
    } catch (error) {
        console.log(error);
        //enviarMailError(error,'Error al Atualizar las URLs de Comprobnates de Proveedores');
    }
    
}

// Funcion para cargar los asientos en Server de Physis
async function resumenPorVencimientoPDF(idSocio,inicio,fin)  {
    try {
         const usuario = {
            username: userPhysis,
            password: passPhysis,
            idSerial: "00576_01",
            idEmpresa: "00001"
        }
    
        let respuestaT = await axios.post(`${urlPhysisWeb}/phy2service/api/core/auth`, usuario);
        let token = respuestaT.data.token;
        
        let respuestaR = await axios.get(`${urlPhysisWeb}/phy2service/api/siges/resumen-por-vencimiento/pdf?idAuxi=1&idCtaAuxi=${idSocio}&fechaDesde=${inicio}&fechaHasta=${fin}`, {
                headers: { 'Authorization': `Bearer ${token}` }
        });
               
        return(respuestaR.data.Datos.Nombre);   
    } catch (error) {
        console.log(error);
        //enviarMailError(error,'Error al Atualizar las URLs de Comprobnates de Proveedores');
    }
    
}

module.exports = {
  actualizarOrdenes,
  cargarComprHacSinContraparte,
  URLComprobante,
  resumenPorVencimiento,
  resumenDeCuenta,
  resumenDeCuentaPDF,
  resumenPorVencimientoPDF
}