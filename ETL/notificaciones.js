const {pool,poolMy,poolPg} = require('../database/dbconfig');
const sql = require('mssql');
const axios = require('axios');
const { date } = require('azure');
const moment = require('moment-timezone');
const { use } = require('react');
const urlPhysisWeb = "https://cuentas.cooperativalehmann.coop";
const userPhysis =  process.env.ADMIN_USER ;
const passPhysis =  process.env.ADMIN_PASSWORD ;


// Funcion para cargar los asientos en Server de Physis
async function actualizarRomaneos()  {

    await actualizarListaRomaneos();
    await enviarListaRomaneos(); 

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
        let scripts = `DELETE FROM dbo."Lista_Romaneos"
                       WHERE fechahora < NOW() - INTERVAL '5 days'; \n`;
        
        for(comp of listaCompFaltantes) {
          scripts +=  `INSERT INTO dbo."Lista_Romaneos"(
	cuenta, planta, silo, grano, cosecha, fechahora, bruto, tara, merma, neto, humedad, chofer, patente, kmsrec, cliente, nrocartadeporte, enviado) 
                      VALUES('${comp.cuenta}','${comp.planta}',${comp.silo},'${comp.grano}','${comp.cosecha}'
                      ,'${comp.fechahora}',${comp.bruto},${comp.tara},${comp.merma},${comp.neto},${comp.humedad}
                      ,'${comp.chofer}','${comp.patente}',${comp.kmsrec},'${comp.cliente}'
                      ,'${comp.nrocartadeporte}',false); \n`;
      };

      await poolPg.query(scripts)
      
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
            
    //   for(rom of listaRomBot) {
    //     cel = await celRomaneosLehmann(rom.cuenta);
        
    //     if(cel !== null && cel !== undefined && cel.length !== 0){
    //        let res = await enviarMesajeRomaneo(cel,rom);
    //       if(res){
    //         await actualizarRomaneoEnviado(rom.nrocartadeporte);
    //         console.log('Se enviaron los Romaneos Faltantes ');
    //       }else{
    //         console.log('Error al enviar el Romaneo: ',rom.nrocartadeporte);
    //       }
    //     }
    // };

    
      return true;    
  };      

  }catch(error){ 
      console.log(error);
      return false;
  }   
        

}


async function listaRomaneosBot(){
  try {
  let compBot = [];
  let respuesta = await poolPg
      .query(`SELECT  nrocartadeporte FROM dbo."Lista_Romaneos";`); 
  compBot = respuesta.rows;
  return compBot;
} catch (error) {
  console.log(error)
  return [];
}
}

async function listaRomaneosPhysis(){
  try {
    let compPhysis = [];
    const request = pool.request();
    let respuesta = await request
      .query(`exec DW_Lehmann.dbo.BOT_CargarListaRomaneos`);
    compPhysis = respuesta.recordsets[0];  
    return compPhysis;
  } catch (error) {
    console.log(error)
    return [];
  }
  
}

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
        cel =  '543404650015'; //await celRomaneosLehmann(rom.cuenta);
        
        if(cel !== null && cel !== undefined && cel.length !== 0){
           let res = true //await enviarMesajeRomaneo(cel,rom);
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

async function listaRomaneosBotNoEnviados(){
  try {
  let compBot = [];
  let respuesta = await poolPg
      .query(`SELECT
  cuenta,
  planta,
  silo,
  grano,
  cosecha,
  to_char(fechahora, 'DD-MM-YYYY')                           AS fecha,
  to_char(round(bruto),  'FM999G999G999G999')                AS bruto,
  to_char(round(tara),   'FM999G999G999G999')                AS tara,
  to_char(round(merma),  'FM999G999G999G999')                AS merma,
  to_char(round(neto),   'FM999G999G999G999')                AS neto,
  to_char(round(neto),   'FM999G999G999G999')                AS limpios,
  round(humedad::numeric, 2)                                 AS humedad,
  chofer,
  patente,
  kmsrec,
  cliente,
  nrocartadeporte,
  enviado
FROM  dbo."Lista_Romaneos"
WHERE enviado = false;`);
  compBot = respuesta.rows;  
  return compBot;
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

async function actualizarRomaneoEnviado(nroCP){
  try {
  
    await poolPg
      .query(`UPDATE dbo."Lista_Romaneos" 
              SET enviado = true 
              WHERE nrocartadeporte = '${nroCP}'`);
  
    return true;
} catch (error) {
    console.log(error)
    return false;
}
}

async function sincronizarEstados() {
 // await sincronizarEstadosSolicitudFondos();
  await sincronizarEstadosSolicitudAdelanto();
  
}


const sincronizarEstadosSolicitudFondos = async () => {
  try {
    const resultPg = await poolPg.query(`
      SELECT id_tickets AS id, estado_anterior 
      FROM dbo.solicitud 
      WHERE cerrado = false
    `);

    const solicitudes = resultPg.rows.map(row => ({
      id: Number(row.id),
      estado_anterior: row.estado_anterior
    }));

    if (solicitudes.length === 0) {
      console.log('No hay solicitudes de Fondo abiertas.');
      return;
    }

    const ids = solicitudes.map(s => s.id);

    const [resultMy] = await poolMy.query(`
      SELECT id, status 
      FROM glpi.glpi_tickets 
      WHERE id IN (?)
    `, [ids]);

    for (const sol of solicitudes) {
      const ticket = resultMy.find(t => Number(t.id) === sol.id);
      const nuevo_estado = ticket ? ticket.status : null;

      if (nuevo_estado !== null && nuevo_estado !== sol.estado_anterior) {
        // Ejecutar funciones solo si el estado cambió
       // await postWooticEstadoSA(sol.id, nuevo_estado,'Actualizado por API Lehmann');
        await actualizarBaseEstadoSF(sol.id, nuevo_estado);
        console.log(`Estado actualizado para ID ${sol.id}: viejo:${sol.estado_anterior} - nuevo: ${nuevo_estado}`);

      }
    }

  } catch (error) {
    console.error('Error al sincronizar estados:', error);
  }
};


const sincronizarEstadosSolicitudAdelanto = async () => {
  try {
    const resultPg = await poolPg.query(`
      SELECT id_tickets AS id, estado_anterior 
      FROM dbo.solicitud_adel_hacienda 
      WHERE cerrado = false
    `);

      

    const solicitudes = resultPg.rows.map(row => ({
      id: Number(row.id),
      estado_anterior: row.estado_anterior
    }));

    if (solicitudes.length === 0) {
      console.log('No hay solicitudes Adelanto abiertas.');
      return;
    }

    const ids = solicitudes.map(s => s.id);
    
    const [resultMy] = await poolMy.query(`
      SELECT t.id
     , t.status 
     , (SELECT left(Right(plugin_fields_tipofielddropdowns_id,3),1)
		FROM glpi.glpi_plugin_fields_ticketfechadepagos
		Where items_id = t.id ) as aprobado
      FROM glpi.glpi_tickets t 
      WHERE t.id IN (?)
    `, [ids]);

    for (const sol of solicitudes) {
      const ticket = resultMy.find(t => Number(t.id) === sol.id);
      const nuevo_estado = ticket ? ticket.status : null;

      if (nuevo_estado !== null && nuevo_estado !== sol.estado_anterior) {
        // Ejecutar funciones solo si el estado cambió
       
        await actualizarBaseEstadoSA(sol.id, nuevo_estado);

        let estado = '';
        switch (nuevo_estado) {
        case 1: estado = 'IN_PROGRESS';            
            break;
        case 5:  (ticket.aprobado === 1 ) ? estado = 'ACCEPTED': estado = 'REJECTED' ;            
            break;  
        case 6: estado = 'CLOSED'; 
            break;    
        default:
            break;
      }
      
      await postWooticEstadoSA(sol.id,estado,'Actualizado por API Lehmann');

      }
      
    }

  } catch (error) {
    console.error('Error al sincronizar estados:', error);
  }
};

async function actualizarBaseEstadoSA(id,nuevo_estado){
    
  const sql = `UPDATE dbo.solicitud_adel_hacienda
              SET estado_anterior = ${nuevo_estado}
              WHERE id_tickets = ${id};`;
      
    try {
    await poolPg.query(sql);
    return true; 

   }catch (err) {
    // Si ves PROTOCOL_CONNECTION_LOST o similar, el pool lo maneja, pero lo registramos:
    console.error('Error al ejecutar la consulta MySQL:', err.message);
    return false;
  }
}

async function actualizarBaseEstadoSF(id,nuevo_estado){
    
  const sql = `UPDATE dbo.solicitud
              SET estado_anterior = ${nuevo_estado}
              WHERE id_tickets = ${id};`;
      
    try {
    await poolPg.query(sql);
    return true; 

   }catch (err) {
    // Si ves PROTOCOL_CONNECTION_LOST o similar, el pool lo maneja, pero lo registramos:
    console.error('Error al ejecutar la consulta MySQL:', err.message);
    return false;
  }
}


async function postWooticEstadoSA(id,nuevo_estado,obs){
  
  const URL_WTC = process.env.URL_WTC;
  const USER_WTC = process.env.USER_WTC;
  const PASS_WTC = process.env.PASS_WTC;
  
 let body = JSON.stringify({
  "email": USER_WTC,
  "password": PASS_WTC
});

try {
// Obtengo el Token de sesión de GLPI
const init = await axios.post(`${URL_WTC}/auth/signin`,body, {
              headers: {'Content-Type': 'application/json'}});
          
const token = init.data.accessToken;

let tipeStamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');;

let data = JSON.stringify({
  "idTicket": id,
  "timestamp": tipeStamp,
  "estado": nuevo_estado,
  "obs": obs
});


let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${URL_WTC}/webhook/ticket-status`,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`               
        },
    data: data
};
        
axios.request(config)
     .then((response) => {
        console.log(response.data);                   
});

//await poolPg.query(sql);
return true; 

  }catch (err) {
    // Si ves PROTOCOL_CONNECTION_LOST o similar, el pool lo maneja, pero lo registramos:
    console.error('Error al conserver Wootic:', err.message);
    return false;
  }
}

module.exports = {
  actualizarRomaneos,
  sincronizarEstados,
  postWooticEstadoSA
}