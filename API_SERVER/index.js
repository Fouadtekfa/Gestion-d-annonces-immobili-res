var http = require('http');

var express = require('express');
var { createHandler } = require('graphql-http/lib/use/express');
const expressPlayground = require('graphql-playground-middleware-express').default
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const isTokenValid = require('./src/validate');
require("dotenv").config();

const serverPortSwagger = process.env.serverPortSwagger;
const serverPortGraphQl = process.env.serverPortGraphQl;

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
const typeDefs = require('./schemaGQL')
const resolvers = require('./resolversGQL');
var oas3Tools = require('oas3-tools');
var path = require('path');
var options = {
  routing: {
      controllers: path.join(__dirname, './controllers')
  },
};


var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var swagger = expressAppConfig.getApp();


const { buildSchema } = require("graphql");
const graphql = express();
const schema = makeExecutableSchema({ typeDefs, resolvers });
//const schema = buildSchema(typeDefs)
//graphql.use('/graphql', createHandler({ schema }));
//graphql.get('/playground', expressPlayground({ endpoint: '/graphql' }))


const context = async req => {
  const { authorization: token } = req.headers;
  return { token };
};

graphql.use(
  '/graphql',
  graphqlHTTP(async (req) => ({
    schema,
    rootValue: resolvers,
    context: () => context(req)
  })),
);
graphql.get('/playground', expressPlayground({ endpoint: '/graphql' }));

graphql.listen({ port: serverPortGraphQl });

console.log(` =========== GRAPHQL ========= \n Listening on port ${serverPortGraphQl}. Open http://localhost:${serverPortGraphQl}/playground to run queries.`);

http.createServer(swagger).listen(serverPortSwagger, function () {
  console.log('\n\n=========== SWAGGER =========== \n Listening on port %s (http://localhost:%s)', serverPortSwagger, serverPortSwagger);
  console.log('Swagger-ui is available on http://localhost:%s/docs', serverPortSwagger);
});

module.exports = graphql;
