const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const REGION = 'us-east-1';
const USER_POOL_ID = 'us-east-1_XXXXXXX';
const AUDIENCE = 'tu-client-id-de-cognito';
const ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

module.exports = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `${ISSUER}/.well-known/jwks.json`,
  }),
  algorithms: ['RS256'],
  issuer: ISSUER,
  audience: AUDIENCE,
  credentialsRequired: true,
  getToken: req => {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      return req.headers.authorization.slice(7);
    }
    return null;
  }
});


