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
        let usuarios = await poolPg.request
                       .query('SELECT dbo.getUsuarios() AS result');
        
        return res.status(200).send(usuarios.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer los Usuarios'});
    }
}

/*Trael un Usuario*/
const getTurno = async (req, res) =>{
    try {
        let usuario = await poolPg.request    
        .query('SELECT dbo.getUsuario($1) AS result', [req.query.id]);
        
        return res.status(200).send(usuario.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer el Usuario'});
    }
}


/*Crea un nuevo Usuario */
const postTurno = async (req, res) => {
    try {
        const {nombre,perfil,celular,mail,usuario,clave} = req.body;
        const passHash = await bcrypt.hash( req.body.clave,saltRounds); 
        
        const query = `SELECT dbo.postUsuario($1,$2,$3,$4,$5,$6)`;
        const values = [nombre,perfil,celular,mail,usuario, passHash];
        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}

/*Actualizar Usuario */
const putTurno = async (req, res) =>{
    try {
        const {id,nombre,perfil,celular,mail,usuario,baja} = req.body;

        const query = `SELECT dbo.putUsuario($1,$2,$3,$4,$5,$6,$7)`;
        const values = [id,nombre,perfil,celular,mail,usuario, baja];
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
        const {id} = req.body;

        const query = `SELECT dbo.deleteUsuario($1)`;
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
    getTurno,
    postTurno,
    putTurno,
    delTurno,
}