const {poolPg} = require('../database/dbconfig');
const sql = require('mssql');
const {responseCreator} = require('../utils/utils')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_KEY;


/*Trael el listado de Usuarios*/
const getTurnos = async (req, res) =>{
    try {
        let turnos = await poolPg
                       .query('SELECT dbo.getTurnos($1) AS result', [req.query.fecha]);
        
        return res.status(200).send(turnos.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer los Turnos'});
    }
}

/*Trael el listado de Usuarios*/
const getTurnosCliente = async (req, res) =>{
    try {
        let turnos = await poolPg
                       .query('SELECT dbo.getTurnosCliente($1,$2) AS result', [req.query.id,req.query.fecha]);
        
        return res.status(200).send(turnos.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer los Turnos'});
    }
}

/*Trael el listado de Usuarios*/
const getTurnosProfesional = async (req, res) =>{
    try {
        let turnos = await poolPg
                       .query('SELECT dbo.getTurnosProfesional($1,$2) AS result', [req.query.id,req.query.fecha]);
        
        return res.status(200).send(turnos.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer los Turnos'});
    }
}

/*Trael un Usuario*/
const getTurno = async (req, res) =>{
    try {
        let turno = await poolPg   
        .query('SELECT dbo.getTurno($1) AS result', [req.params.id]);
        
        return res.status(200).send(turno.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer el Usuario'});
    }
}


/*Crea un nuevo Usuario */
const postTurno = async (req, res) => {
    try {
        const {idPaciente,idProfecional,fecha,horaIni,horaFin,obs,idTratamiento} = req.body;
        //if(idTratamiento===3){
            const query = `INSERT INTO dbo.turnos (paciente_id, profesional_id, tratamiento_id, fecha, hora_inicio, hora_fin, observaciones,baja)
                            VALUES ($1,$2,$3,$4,$5,$6,$7,false)
                            RETURNING * `;
        const values = [idPaciente,idProfecional,idTratamiento,fecha,horaIni,horaFin,obs];
        let respuesta = await poolPg.query(query, values);

        const respuestaFinal = { success: true,
                                 message: 'Turno creado correctamente.',
                                 turno:respuesta.rows[0] };
        return res.status(200).send(respuestaFinal);
        // }else{
        // const query = `SELECT dbo.postTurno($1,$2,$3,$4,$5,$6,$7)`;
        // const values = [idPaciente,idProfecional,fecha,horaIni,horaFin,obs,idTratamiento];
        // let respuesta = await poolPg.query(query, values);
        // return res.status(200).send(respuesta.rows[0]);    
        // }

        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}

/*Actualizar Usuario */
const putTurno = async (req, res) =>{
    try {
        const {id,idPaciente,idProfecional,fecha,horaIni,horaFin,obs,estado,idTratamiento} = req.body;

        const query = `SELECT dbo.putTurno($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
        const values = [id,idPaciente,idProfecional,fecha,horaIni,horaFin,obs,estado,idTratamiento];
        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}

/*Elimina un Usuario */
const delTurno = async (req,res) => {
    try {
        const id = req.params.id;

        const query = `SELECT dbo.deleteTurno($1)`;
        const values = [id];
        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}



module.exports = {
    getTurnos,
    getTurnosCliente,
    getTurnosProfesional,   
    getTurno,
    postTurno,
    putTurno,
    delTurno,
}