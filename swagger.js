const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

var portconfig = process.env.PORT;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Plataforma Lehmann Go 2.0',
      version: '1.0.0',
      description: 'Documentación Swagger para las APIs de la Plataforma de Lehmann Go 2',
    },
    servers: [
        {
        url: 'https://plataformalg2.cooperativalehmann.coop', // Cambiá según tu entorno
        }
            ],
    components: {
        securitySchemes: {
        bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
                  }
                }
              },
      security: [
            {
              bearerAuth: [],
            }
              ],
  },
  apis: ['./controllers/*.js'], // Documentación en los archivos de rutas
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
