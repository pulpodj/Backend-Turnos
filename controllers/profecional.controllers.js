const {poolPg} = require('../database/dbconfig');
const sql = require('mssql');
const {responseCreator} = require('../utils/utils')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_KEY;

//Login de Usuario
const loginProfesional = async (req,res) => {
    try {
        console.log('Logueo - Común');
        const usuLogin = req.body.usuario;
        const passLogin = req.body.clave;

        //chequeo si me pasaron los datos
        if(!usuLogin||!passLogin){
            return res.status(400).send({msg:`Datos del Login incompletos`})
        }
        //busco el usuario en la base
        console.log(usuLogin);   
        
        const query = `Select * From dbo.profesional Where usuario = $1`;
        const values = [usuLogin];
        let usuario = await poolPg.query(query, values);

        let user = usuario.rows[0];
        

        if(!user){
            return res.status(404).send({
                msg:`Usuarios o Contraseña Incorrecto`
            }) 
        }

        const result = await bcrypt.compare(passLogin,user.clave)
        
        if(!result){
            return res.status(404).send({
                msg:`Usuarios o Contraseña Incorrecto`
            }) 
        }
        
        user.clave = undefined;
        const token = jwt.sign(user, secret, { expiresIn: process.env.JWT_TIME_EXPIRES });
      
        // Decodificamos para obtener iat
        const decoded = jwt.decode(token);

        return res.status(201).send({
            msg:`Autenticación Exitosa`,
            token:token,
            user,
            iat: decoded.iat
        })

    } catch (error) {
        return responseCreator(res,500,'Error al querer hacer el Login')
    }
    

}


const loginAuthProfesional = async (req,res) => {
    try {
        console.log('Logueo - Auth');

        const auth = req.params.auth;

        if (!auth) {
            return res.status(400).send('Faltan credenciales');
        }
    
        // Decodificar el Base64
        const decodedCredentials = Buffer.from(auth, 'base64').toString('utf-8');
        let [usuLogin, passLogin] = decodedCredentials.split(':');

        usuLogin = usuLogin.slice(1); ;
        passLogin = passLogin.slice(0,-1);

        console.log(usuLogin);
        console.log(passLogin);

        let pool = await sql.connect(config.config3);
       
        //chequeo si me pasaron los datos
        if(!usuLogin||!passLogin){
            return res.status(400).send({msg:`Datos del Login incompletos`})
        }
        //busco el usuario en la base
        const usuario = await pool.request()
        .input('usuario',sql.VarChar,usuLogin)    
        .query("Select * From db_bot.dbo.usuario Where usuario = @usuario");
        sql.close();
        let user = usuario.recordsets[0][0];

        if(!user){
            return res.status(404).send({
                msg:`Usuarios o Contraseña Incorrecto`
            }) 
        }

        const result = await bcrypt.compare(passLogin,user.password)
        
        if(!result){
            return res.status(404).send({
                msg:`Usuarios o Contraseña Incorrecto`
            }) 
        }
        
        user.password = undefined;
        const token = jwt.sign(user, secret)
      
        return res.status(201).send({
            msg:`Autenticación Exitosa`,
            token:token,
            user
        })

    } catch (error) {
        return responseCreator(res,500,'Error al querer hacer el Login')
    }
    

}



/*Trael el listado de Usuarios*/
const getProfesionales = async (req, res) =>{
    try {
        let profecionales = await poolPg
                       .query('SELECT dbo.getProfesionales() AS result');
        
        return res.status(200).send(profecionales.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer los Usuarios'});
    }
}

/*Trael un Usuario*/
const getProfesional = async (req, res) =>{
    try {
        let profecional = await poolPg    
        .query('SELECT dbo.getProfesional($1) AS result', [req.params.id]);
        
        return res.status(200).send(profecional.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer el Usuario'});
    }
}


/*Crea un nuevo Usuario */
const postProfesional = async (req, res) => {
    try {
        const {nombre,especialidad,celular,mail,usuario,clave} = req.body;
        const passHash = await bcrypt.hash( clave,saltRounds); 
        
        const query = `SELECT dbo.postProfesional($1,$2,$3,$4,$5,$6)`;
        const values = [nombre,especialidad,celular,mail,usuario, passHash];
        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}

/*Actualizar Usuario */
const putProfesional = async (req, res) =>{
    try {
        const {id,nombre,especialidad,celular,mail,usuario,baja} = req.body;

        const query = `SELECT dbo.putProfesional($1,$2,$3,$4,$5,$6,$7)`;
        const values = [id,nombre,especialidad,celular,mail,usuario, baja];
        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}

/*Elimina un Usuario */
const delProfesional = async (req,res) => {
    try {
        const id = req.params.id;

        const query = `SELECT dbo.deleteProfesional($1)`;
        const values = [id];
        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}



module.exports = {
    loginProfesional,
    getProfesional,
    getProfesionales,
    postProfesional,
    putProfesional,
    delProfesional,
}