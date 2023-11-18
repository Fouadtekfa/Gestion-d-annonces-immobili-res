const Announce = require('./model/announce');
const User = require('./model/user');
var { makeExecutableSchema } = require("@graphql-tools/schema");
const typeDefs = `#graphql
  type Query {
    announces: [Announce]
    announceById(id: ID!): Announce
    userById(id: ID!): User
    commentsByAnnounceId(announceId: ID!): [Comment]
  }

  type Announce {
    _id: ID!
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

  type User {
    _id: ID!
    name: String
    first_name: String
    email: String
    password: String
    isAdmin: Boolean
  }

  type Mutation {
    createAnnounce(input: AnnounceInput!): Announce
    createCommentary(input: AddCommentInput!): Announce
    addCommentaryHistory(input: AddCommentHistoryInput!): Announce
    modifyAnnounce(input: AnnounceModifyInput!): Announce
    deleteAnnounce(id: ID): Announce
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

  input AnnounceModifyInput {
    _id: ID!
    announce: AnnounceInput
  }

  input PhotoInput {
    filename: String
    originalName: String
  }

  input AddCommentInput {
    comment: CommentInput
    announce_id: ID
  }

  input CommentInput {
    user_id: String
    commentary: String
  }

  input historyInput {
    id_user: String
    content: String
    date: String
    read: Boolean
  }

  input AddCommentHistoryInput {
    comments: [ CommentsInput ],
    announce_id: ID
  }

  input CommentsInput {
    user_id: String
    history: [historyInput]
  }
  
`;
// resolvers

const resolvers = {
  Query: {
    announces: async () => {
      try {
        const data = await Announce.find();
        if (data) {
          //renvoyer filename et originalName
          const formattedData = data.map(announce => ({
            _id: announce._id,
            ...announce.toObject(),
            photos: announce.photos.map(photo => ({
              filename: photo.filename,
              originalName: photo.originalName,
            })),
            date: announce.date.toString(),
            comments : announce.comments.map(comment => {
                comment.history = comment.history.map( h => { h.date = h.date.toString(); return h; } );
                return comment;
            } )
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
        var announce = await Announce.findById(id);
        announce = JSON.stringify(announce);
        announce = JSON.parse(announce);

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
    userById: async (_, { id }) => {
      try {
        const user = await User.findById(id);
        if (user) {
          return user;
        } else {
          throw new Error("aucune utilisateur trouvée pour cet ID");
        }
      } catch (error) {
        console.error(error);
        throw new Error("erreur lors de la récupération de l'utilisateur par ID");
      }
    },
    commentsByAnnounceId: async (_, { announceId }) => {
      try {
        var announce = await Announce.findById(announceId);
        announce = JSON.stringify(announce);
        announce = JSON.parse(announce);

        if (announce) {
          //faire un map pour afficher les commentaires 
          const comments = announce.comments.map(comment => ({
            user_id: comment.user_id,
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
        const newAnnounce = await Announce.create(input);
        return newAnnounce;
      } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la création de l'annonce");
      }
    },
    modifyAnnounce: async (_, { input }) => {
      try {
        const filter = { _id: input._id };
        const updatedAnnounce = await Announce.findOneAndUpdate(filter, input.announce);
        return updatedAnnounce;
      } catch (error) {
        throw new Error("Erreur lors de la modification de l'annonce");
      }
    },
    createCommentary: async (_, { input }) => {
      try {
        var announce = await Announce.findById(input.announce_id);
        if(!announce) {
          throw new Error("aucune annonce trouvée pour cet ID");
        }
        announce = JSON.stringify(announce);
        announce = JSON.parse(announce);

        const newComment = {
          user_id: input.comment.user_id,
          history: [ {
            id_user: input.comment.user_id,
            content: input.comment.commentary,
            date: new Date(),
            read: false
          } ]
        };

        announce.comments.push(newComment)

        const filter = { _id: input.announce_id };
        const updatedAnnounce = Announce.findOneAndReplace( filter, announce );
        return updatedAnnounce;
      } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la creationd de commentaire dans l'annonce");
      }
    },
    addCommentaryHistory: async (_, { input }) => {
      try {
        var announce = await Announce.findById(input.announce_id);
        if(!announce) {
          throw new Error("aucune annonce trouvée pour cet ID");
        }
        announce.comments = input.comments
        const filter = { _id:  announce._id };
        const newAnnounce = Announce.findOneAndReplace( filter, announce );
        return newAnnounce;
      } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de l'ajout de reponse dans l'annonce");
      } 
    },
    deleteAnnounce: async (_, { id }) => {
      try {
        let announce = await Announce.findOneAndDelete({_id: id});
        return announce;
      } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la suppression de l'annonce");
      } 
    }
    
  }
};



const schema = makeExecutableSchema({ typeDefs, resolvers });
module.exports=schema;

