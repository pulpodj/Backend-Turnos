const { responseCreator } = require('../utils/utils');


// Generar el token una vez
const FIXED_TOKEN = process.env.FIXED_TOKEN;

// Muestra el token (hazlo solo para propósitos de prueba)
//console.log('Token fijo generado:', FIXED_TOKEN);


async function fixedToken (req,res,next){
    try {
        let token =  req.headers.authorization;
        
        if(!token)
        {
            response.status(401).send({
                error: 'Es necesario un token de autentificación'
            });
            return;
        };

        if(token.startsWith('Bearer ')){
            token = token.slice(7, token.length);
        }

        if (token !== FIXED_TOKEN) {
            return res.status(403).json({ error: 'Token inválido' });
          }

        next();

    } catch (error) {
        return responseCreator(res,401,'Error al Ingresar, token no valido')
    }

};


// Exporta el token para usarlo en otras partes de tu aplicación
module.exports = fixedToken ;