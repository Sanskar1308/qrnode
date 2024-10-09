const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Campaign API',
    description: 'API documentation for Campaign Operations',
  },
  host: 'localhost:3000',  // Adjust this according to your host
  schemes: ['http'],  // Change to 'https' if necessary
};

const outputFile = './swagger-output.json';  // File where Swagger will be generated
const endpointsFiles = ['./index.js'];  // Path to your main server file where routes are defined

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('./index.js'); // Start your server after the documentation is generated
});
