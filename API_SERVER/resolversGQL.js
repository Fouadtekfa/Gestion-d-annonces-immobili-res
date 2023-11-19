const Announce = require('./model/announce');
const User = require('./model/user');
var { makeExecutableSchema } = require("@graphql-tools/schema");
const isTokenValid = require('./src/validate');
const { checkJwt } = require('./src/checkJwt');
var mongoose = require ('mongoose');
const { GraphQLError } = require('graphql');


const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require("jwks-rsa");
const createJwtMiddleware = () => {
  return jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256'],
  });
};


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
    loginUser: async (_, { input }, context) => {
      const { firstname, email } = input;
      const user = await User.findOne({ 'email': email });

      if ( !user ) { // Create
        let newUser = new User(input);
        await newUser.save();
        let resp = {};
        resp['application/json'] = newUser;
        let send = resp[Object.keys(resp)[0]] 
        return(send);
      } else { // Login, return the user
        let resp = {};
        resp['application/json'] = user;
        let send = resp[Object.keys(resp)[0]] 
        return(send);
      }
      
      return;
      

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        const error = new Error( 'Mot de passe ou utilisateur invalide' );
        error.status = 401;
        return reject(error);
      }

      let resp = {};
      let token = crypto.randomBytes(32).toString('hex');

      let usr = {
        auth: true,
        user: user,
        token: token
      }

      resp['application/json'] = usr;
      console.log('senddd');
      let send = resp[Object.keys(resp)[0]] 
      console.log(send);
      resolve( send );
    },
    createAnnounce: async (_, { input }, context) => {
      const { db, token } = await context();
      const { error } = await isTokenValid(token);

      if (error) {
        return new GraphQLError(error);
      }

      try {
        const newAnnounce = await Announce.create(input);
        return newAnnounce;
      } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la création de l'annonce");
      }
    },
    modifyAnnounce: async (_, { input }, context) => {
      const { db, token } = await context();
      const { error } = await isTokenValid(token);

      if (error) {
        console.log('new err');;
        return new GraphQLError(error);
      }

      try {
        const filter = { _id: input._id };
        var announce = await Announce.findById(input._id);
        const updatedAnnounce = await Announce.findOneAndUpdate(filter, input.announce);
        return updatedAnnounce;
      } catch (error) {
        throw new Error("Erreur lors de la modification de l'annonce");
      }
    },
    createCommentary: async (_, { input }, context) => {
      const { db, token } = await context();
      const { error } = await isTokenValid(token);

      if (error) {
        return new GraphQLError(error);
      }

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
    addCommentaryHistory: async (_, { input }, context) => {
      const { db, token } = await context();
      const { error } = await isTokenValid(token);

      if (error) {
        return new GraphQLError(error);
      }

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
    deleteAnnounce: async (_, { id }, context) => {
      const { db, token } = await context();
      const { error } = await isTokenValid(token);

      if (error) {
        console.log('new err');;
        return new GraphQLError(error);
      }

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



//const schema = makeExecutableSchema({ typeDefs, resolvers });
module.exports=resolvers;

