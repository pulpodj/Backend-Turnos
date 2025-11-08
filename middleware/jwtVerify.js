const jwt = require ('jsonwebtoken');
const secret = process.env.JWT_KEY;
const { responseCreator } = require('../utils/utils');

async function jwtVerify(req,res,next){
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

        const payload = jwt.verify(token,secret)

        req.user = payload;

        next();

    } catch (error) {
        return responseCreator(res,401,'Error al Ingresar, token no valido')
    }

};

module.exports = jwtVerify