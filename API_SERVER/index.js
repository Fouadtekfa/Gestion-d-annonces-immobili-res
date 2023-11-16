var http = require('http');
var serverPortSwagger = 4900;
var serverPortGraphQl = 4500;
var express = require('express');
var { createHandler } = require('graphql-http/lib/use/express');
const expressPlayground = require('graphql-playground-middleware-express').default
require("dotenv").config();
var mongoose = require ('mongoose');
(async () => {
  try {
    // Connexion à la base de données MongoDB
    await mongoose.connect(process.env.MDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Si la connexion réussit
    console.log('Connexion à MongoDB réussie');
  } catch (error) {
    // En cas d'échec de connexion
    console.error('Erreur de connexion à MongoDB :', error.message);
    //lever une exception
    throw new Error('Impossible de se connecter à la base de données MongoDB');
  }
})();


var { makeExecutableSchema } = require("@graphql-tools/schema");
const schema = require('./schemaGQL')
var oas3Tools = require('oas3-tools');
var path = require('path');
var options = {
  routing: {
      controllers: path.join(__dirname, './controllers')
  },
};


var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var swagger = expressAppConfig.getApp();



const graphql = express();
graphql.use('/graphql', createHandler({ schema }));
graphql.get('/playground', expressPlayground({ endpoint: '/graphql' }))
graphql.listen({ port: serverPortGraphQl });

console.log('Listening to port 4000. Open http://localhost:4500/playground to run queries.');

http.createServer(swagger).listen(serverPortSwagger, function () {
  console.log('Your server is listening on port %d (http://localhost:%d)', serverPortSwagger, serverPortSwagger);
  console.log('Swagger-ui is available on http://localhost:%d/docs', serverPortSwagger);
});

module.exports = graphql;
