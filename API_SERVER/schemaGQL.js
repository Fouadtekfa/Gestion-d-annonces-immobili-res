const Announce = require('./model/announce');
var { makeExecutableSchema } = require("@graphql-tools/schema");
const typeDefs = `
  type Query {
    announces: [Announce]
  }

  type Announce {
    id: ID!
    name: String!
    type: String!
    published: Boolean!
    status: String
    description: String
    price: Float
    date: String
    photos: [String]
    by: String
    comments: [Comment]
  }

  type Comment {
    user_id: String
    history: [CommentHistory]
  }

  type CommentHistory {
    id_user: String
    content: String
    date: String
    read: Boolean
  }
`;


// resolvers

const resolvers = {
  Query: {
    announces: async () => {
      try {
        console.log("avant la requête à la base de données");
        const data = await Announce.find();
        console.log("après la requête à la base de données", data);
        if (data) {
          return data;
        } else {
          throw new Error("aucune annonce pour l'instant");
        }
      } catch (error) {
        console.error(error);
        throw new Error("erreur lors de la récupération des annonces");
      }
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
module.exports=schema;
