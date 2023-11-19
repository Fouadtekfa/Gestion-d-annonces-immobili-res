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


const loggingMiddleware = (req, res, next) => {
  console.log("ip:", req.ip)
  next()
}


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


const context = async (req, res) => {//console.log('contextttt'); 
  const { authorization: token } = req ? req.headers : '';
  return { 
    token ,
    req: req,
    res: res
  };
};

const { expressjwt: jwt } = require('express-jwt');

const jwksRsa = require("jwks-rsa");
const { applyMiddleware } = require('graphql-middleware');
const { GraphQLError } = require('graphql');
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});


/**
 * Fonction middleware pour verifier notre token
 * @param {} resolve : resolve function prmise
 * @param {*} parent
 * @param {*} args 
 * @param {*} ctx : context
 * @param {*} info 
 * @returns 
 */
let check = async (resolve, parent, args, ctx, info) => {
  try {
    await new Promise((resolveJwt, rejectJwt) => {
      checkJwt(ctx().req, ctx().res, (err) => {
        if (err) {
          rejectJwt(err);
        } else {
          resolveJwt();
        }
      });
    });

    return resolve(parent, args, ctx, info);
  } catch (error) {
    return new GraphQLError(error.message);
  }
};


/**
 * Creation de middlewares pour verifier le token avant chaque appel
 */
const announceMiddleware = {
  Mutation: {
    createAnnounce: check,
    loginUser: check,
    createCommentary: check,
    addCommentaryHistory: check, 
    modifyAnnounce: check,
    deleteAnnounce: check
  }
}

const middleware = [announceMiddleware];

const schemaWithMiddleware = applyMiddleware(schema, ...middleware);

graphql.use(
  '/graphql',
  graphqlHTTP(async (req, res) => {
    const ctx = await context(req, res);
    return {
      schema: schemaWithMiddleware,
      rootValue: resolvers,
      context: () => ctx
    }
  })
)

graphql.get('/playground', expressPlayground({ endpoint: '/graphql' }));

graphql.listen({ port: serverPortGraphQl });

console.log(` =========== GRAPHQL ========= \n Listening on port ${serverPortGraphQl}. Open http://localhost:${serverPortGraphQl}/playground to run queries.`);

http.createServer(swagger).listen(serverPortSwagger, function () {
  console.log('\n\n=========== SWAGGER =========== \n Listening on port %s (http://localhost:%s)', serverPortSwagger, serverPortSwagger);
  console.log('Swagger-ui is available on http://localhost:%s/docs', serverPortSwagger);
});

module.exports = graphql;
