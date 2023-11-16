const Announce = require('./model/announce');
var { makeExecutableSchema } = require("@graphql-tools/schema");
const typeDefs = `
  type Query {
    announces: [Announce]
    announceById(id: ID!): Announce
    commentsByAnnounceId(announceId: ID!): [Comment]
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
    photos:[Photo]
    by: String
    comments: [Comment]
  }

  type Photo {
    filename: String
    originalName: String
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
  type Mutation {
    createAnnounce(input: AnnounceInput!): Announce
  }

  input AnnounceInput {
    name: String!
    type: String!
    published: Boolean!
    status: String
    description: String
    price: Float
    date: String
    photos: [PhotoInput]
    by: String
    comments: [CommentInput]
  }
  input PhotoInput {
    filename: String
    originalName: String
  }

  input CommentInput {
    user_id: String
    history: [CommentHistoryInput]
  }

  input CommentHistoryInput {
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
          //renvoyer filename et originalName
          const formattedData = data.map(announce => ({
            id: announce._id,
            ...announce.toObject(),
            photos: announce.photos.map(photo => ({
              filename: photo.filename,
              originalName: photo.originalName,
            })),
          }));

           return formattedData;
          //return data;
        } else {
          throw new Error("aucune annonce pour l'instant");
        }
      } catch (error) {
        console.error(error);
        throw new Error("erreur lors de la récupération des annonces");
      }
    },
    announceById: async (_, { id }) => {
      try {
        console.log("avant la requête à la base de données par ID");
        const announce = await Announce.findById(id);
        console.log("après la requête à la base de données par ID", announce);
        if (announce) {
          return announce;
        } else {
          throw new Error("aucune annonce trouvée pour cet ID");
        }
      } catch (error) {
        console.error(error);
        throw new Error("erreur lors de la récupération de l'annonce par ID");
      }
    },
    commentsByAnnounceId: async (_, { announceId }) => {
      try {
        console.log("Avant la requête à la base de données pour les commentaires");
        const announce = await Announce.findById(announceId);

        console.log("Après la requête à la base de données pour les commentaires", announce);
        
        if (announce) {
          //faire un map pour afficher les commentaires 
          const comments = announce.comments.map(comment => ({
            user_id: comment.user_id,
            history: comment.history.map(history => ({
              id_user: history.id_user,
              content: history.content,
              date: history.date.toLocaleString(),
              read: history.read,
            })),
          }));

          return comments;
        } else {
          throw new Error("Aucune annonce trouvée pour cet ID");
        }
      } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la récupération des commentaires par ID d'annonce");
      }
    },
  
  },


  Mutation: {
    createAnnounce: async (_, { input }) => {
      try {
        console.log("Avant la création de l'annonce dans la base de données");
        const newAnnounce = await Announce.create(input);
        console.log("Après la création de l'annonce dans la base de données", newAnnounce);
        return newAnnounce;
      } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la création de l'annonce");
      }
    },
  },

};



const schema = makeExecutableSchema({ typeDefs, resolvers });
module.exports=schema;

