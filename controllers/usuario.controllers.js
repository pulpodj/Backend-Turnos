const {poolPg} = require('../database/dbconfig');
const sql = require('mssql');
const {responseCreator} = require('../utils/utils')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_KEY;

//Login de Usuario
const login = async (req,res) => {
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
        
        const query = `Select * From dbo.usuario Where usuario = $1`;
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


const loginAuth = async (req,res) => {
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
const getUsuarios = async (req, res) =>{
    try {
        let usuarios = await poolPg
                       .query('SELECT dbo.getUsuarios() AS result');              
        
        return res.status(200).send(usuarios.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer los Usuarios'});
    }
}

/*Trael un Usuario*/
const getUsuario = async (req, res) =>{
    try {
        let usuario = await poolPg    
        .query('SELECT dbo.getUsuario($1) AS result', [req.params.id]);
        
        return res.status(200).send(usuario.rows[0].result);
    }catch(error){
        console.log(error);
        return res.status(500).send({msg:'Error al traer el Usuario'});
    }
}


/*Crea un nuevo Usuario */
const postUsuario = async (req, res) => {
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
const putUsuario = async (req, res) =>{
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
const delUsuario = async (req,res) => {
    try {
        const id = req.params.id;

        const query = `SELECT dbo.deleteUsuario($1)`;
        const values = [id];
        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
        } catch(err){
            console.log(`Se presentó un error en el procedimiento ${err}`);
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}

//Aprobacion de Socio por Cuit
const postAprobacion = async (req, res) => {
    try {
        let cuit = req.body.cuit;
        if (!cuit || parseInt(cuit) === 0 || cuit.length != 11) {
            return res.status(400).send({msg: 'Cuit Invalido'});
        }
        let request = pool.request();
        let usuario = await request
            .input('cuit',sql.VarChar,req.body.cuit)
            .execute("DW_Lehmann.dbo.postAprovacionUsuario");
        if (!usuario.recordset[0]) {
            return res.status(401).send({KYB: 1,id_socio:0,msg: 'Cuit no existe en DB'});
        }

        let baja = await request
            .query(`Select FechaBaja as baja
                    From Phy_WinSiges_00576_01_00001_0100.dbo.CuentasAuxi
                    Where IdCtaAuxi = ${usuario.recordset[0].id_socio} and IdAuxi = 1`);
                    
        if (!baja.recordset[0].baja) {
            return res.status(200).send({KyB:0, id_socio:usuario.recordset[0].id_socio, msg:'Socio Validado'});
        }
        else{            
            return res.status(402).send({KYB: 1,id_socio:usuario.recordset[0].id_socio,msg: 'Socio dado de baja'});
        }
        } catch(err){
            return res.status(500).send({msg:`Se presentó un error en el procedimiento ${err}`});
    }
}

module.exports = {
    login,
    loginAuth,
    getUsuarios,
    getUsuario,
    postUsuario,
    putUsuario,
    delUsuario,
    postAprobacion
}