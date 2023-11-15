
// Node dependencies
// - express
// - graphql-http
// - graphql-playground-middleware-express
// - @graphql-tools/schema
var http = require('http');
var serverPortSwagger = 4900;
var serverPortGraphQl = 4500;
var express = require('express');
var { createHandler } = require('graphql-http/lib/use/express');
const expressPlayground = require('graphql-playground-middleware-express').default

var { makeExecutableSchema } = require("@graphql-tools/schema");


const fakeDatabase = {
    users: [
      {
        id: "1",
        name: "toto",
        email: "toto@mail.com",
        purchases: [
          { id: "1", date: "2021-03-01", good: "1", quantity: 3 },
          { id: "2", date: "2021-10-12", good: "2", quantity: 1 },
        ],
      },
      {
        id: "2",
        name: "tata",
        email: "tata@mail.com",
        purchases: [
          { id: "1", date: "2020-01-01", good: "2", quantity: 1 },
          { id: "2", date: "2021-02-01", good: "2", quantity: 1 },
        ],
      },
    ],
    goods: [
      { id: "1", name: "good stuff", price: "23.32" },
      { id: "2", name: "bad stuff", price: "123.32" },
    ],
  };
  
  
  const typeDefs = `
    type Query {
      hello: String
      users(filterName: String): [User]
      user(id: ID!): User
      goods: [Good]
    }
    type Mutation {
      createPurchaseForUser(userId: ID!, goodId: ID!, quantity: Int!): Purchase
    }
    type User {
        id:ID!
        name: String!
        email:String!
        purchases: [Purchase]!
    }
    type Purchase {
      id: ID!
      date: Date
      good: Good
      quantity: Int
    }
    type Good {
      id:ID!
      name: String!
      price: Float!
    }
    scalar Date
  
  `;
  
  
  const resolvers = {
    Purchase: {
      good:  (root, args, context) => {
        return fakeDatabase.goods.find((g) => g.id === root.good);
      },
    },
    Query: {
      hello: () => "Hello!",
      user: (root, args, context) => {
        const u = fakeDatabase.users.find((u) => u.id === args.id);
        return u;
      },
      users: (root, args, context) => {
        if (args.filterName)
          return fakeDatabase.users.filter((u) => u.name.includes(args.filterName))
        return fakeDatabase.users
      },
      goods: () => fakeDatabase.goods
    },
    Mutation: {
      createPurchaseForUser: (root, {userId, goodId, quantity}, context) => {
        const user = fakeDatabase.users.find((u) => u.id === userId);
        const good = fakeDatabase.goods.find((g) => g.id === goodId);
        if (typeof user === 'undefined')  throw new Error('User not found')
        if (typeof good === 'undefined')  throw new Error('Good not found')
        const today = new Date();
        const purchase = {id : user.purchases.length, date:today.toDateString(), good: good.id, quantity};
        user.purchases.push(purchase)
        return purchase
      }
    }
    
  };
  
const schema = makeExecutableSchema({ typeDefs, resolvers });

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

console.log('Listening to port 4000. Open http://localhost:4000/playground to run queries.');

http.createServer(swagger).listen(serverPortSwagger, function () {
  console.log('Your server is listening on port %d (http://localhost:%d)', serverPortSwagger, serverPortSwagger);
  console.log('Swagger-ui is available on http://localhost:%d/docs', serverPortSwagger);
});

module.exports = graphql;
