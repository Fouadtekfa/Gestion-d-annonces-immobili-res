'use strict';

var path = require('path');
var http = require('http');
require("dotenv").config();
var mongoose = require ('mongoose');

var oas3Tools = require('oas3-tools');
var serverPort = 8080;

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

// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();

// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});
