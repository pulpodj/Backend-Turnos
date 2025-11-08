const {poolPg} = require('../database/dbconfig');
const sql = require('mssql');
const {responseCreator} = require('../utils/utils')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_KEY;

//Login de Usuario
const loginPaciente = async (req,res) => {
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
        
        const query = `Select * From dbo.paciente Where usuario = $1`;
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


const loginAuthPaciente = async (req,res) => {
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
        .query("Select * From db_bot.dbo.paciente Where usuario = @usuario");
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
        
        user.clave = undefined;
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
const getPacientes = async (req, res) =>{
    try {
        let pacientes = await poolPg
                       .query('SELECT dbo.getPacientes() AS result');
        
        return res.status(200).send(pacientes.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer los Pacientes'});
    }
}

/*Trael un Usuario*/
const getPaciente = async (req, res) =>{
    try {
        let paciente = await poolPg  
        .query('SELECT dbo.getPaciente($1) AS result', [req.params.id]);
        
        return res.status(200).send(paciente.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer el Paciente'});
    }
}


/*Crea un nuevo Usuario */
const postPaciente = async (req, res) => {
    try {
        const {nombre,dni,celular,mail,fechaNacimiento,direccion,usuario,clave,idObraSocial} = req.body;
        const passHash = await bcrypt.hash( clave,saltRounds); 
        
        const query = `SELECT dbo.postPaciente($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
        const values = [nombre,dni,celular,mail,fechaNacimiento,direccion,usuario, passHash,idObraSocial];
        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}

/*Actualizar Usuario */
const putPaciente = async (req, res) =>{
    try {
        const {id,nombre,dni,celular,mail,fechaNacimiento,direccion,usuario,clave,idObraSocial} = req.body;
        const passHash = await bcrypt.hash( clave,saltRounds); 
        const query = `SELECT dbo.putPaciente($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
        const values = [id,nombre,dni,celular,mail,fechaNacimiento,direccion,usuario,passHash,idObraSocial];
        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}

/*Elimina un Usuario */
const delPaciente = async (req,res) => {
    try {
        const id = req.params.id;

        const query = `SELECT dbo.deletePaciente($1)`;
        const values = [id];
        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}



module.exports = {
    loginPaciente,
    getPacientes,
    getPaciente,
    postPaciente,
    putPaciente,
    delPaciente,
}