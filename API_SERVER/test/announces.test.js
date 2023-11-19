
const { GraphQLClient } = require('graphql-request');
const { expect } = require('chai');
// configuration des variables d'environnement
require("dotenv").config();
const serverPortGraphQl = process.env.serverPortGraphQl;
const token = process.env.TOKEN_API;

// import du schéma GraphQL et des résolveurs
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('../schemaGQL');
const resolvers = require('../resolversGQL');
const { create } = require('../model/announce');

// création du schéma exécutable
const schema = makeExecutableSchema({ typeDefs, resolvers });

// définition de l'URL du serveur GraphQL
const url = `http://localhost:${serverPortGraphQl}/graphql`;

// création d'un client GraphQL
const client = new GraphQLClient(url, { headers: {} });

// test GraphQL pour récupérer toutes les annonces
describe('GraphQL Announces Tests', () => {
  it('should get all announces', async () => {
    // ecriture de la requête GraphQL
    const query = `
      {
        announces {
          _id
          name
          type
          published
          status
          description
          price
          date
          by
          photos {
            filename
            originalName
          }
          comments {
            user_id
            history {
              id_user
              content
              date
              read
            }
          }
        }
      }
    `;

    // exécution de la requête GraphQL
    const response = await client.request(query);
   // console.log(response);

    // vérification de la réponse
    expect(response).to.have.property('announces').that.is.an('array');
  });

  
  // test GraphQL pour créer une nouvelle annonce avec des commentaires
  const client = new GraphQLClient(url, { headers: { Authorization: `Bearer ${token}` } });
    it('should create an announce without commentary', async () => {
      // requête GraphQL pour créer une annonce sans commentaire
      const query = `
      mutation CreateAnnounce {
        createAnnounce(
            input: {
                name: "Announce TEST!!!!"
                type: "Vente"
                published: false
                status: "Disponible"
                description: "fezze"
                price: 855
                date: "2023-10-11T00:00:00.000Z"
                by: "6521673f72ccb5fe5be0e795"
            }
        ) {
            _id
            name
            type
            published
            status
            description
            price
            date
            by
            comments {
              user_id
              history {
                id_user
                content
                date
                read
              }
            }
        }
      }
      `;
  
      //la requête GraphQL
      const response = await client.request(query);
      //console.log(response);
  
      //  la réponse
      expect(response).to.have.property('createAnnounce').that.is.an('object');
      const createdAnnounce = response.createAnnounce;
      //console.log(createdAnnounce);
      expect(createdAnnounce).to.have.property('comments').that.is.an('array').that.is.empty;
      createdAnnounceId = createdAnnounce._id;
      console.log("=======================================================================================================")
      console.log(createdAnnounceId)
    });
   


  it('should create a new commentary for an announce', async () => {
    // ID dans notre bas 
    const announceId = "655a654cd8c430d3caf4a2eb";
    const userId = "655a6df0b28e46421e206d37";
  
    const mutation = `
      mutation CreateCommentary {
        createCommentary(
          input: {
            comment: {
              commentary: "mon commentaire"
              user_id: "${userId}"
            }
            announce_id: "${announceId}"
          }
        ) {
          _id
          name
          type
          published
          status
          description
          price
          date
          by
        }
      }
    `;
  
    try {
      // exécution de la requête GraphQL avec le token 
      const response = await client.request(mutation, {}, { headers: { Authorization: `Bearer ${token}` } });
      //console.log(response);
  
      expect(response).to.have.property('createCommentary').that.is.an('object');
      expect(response.createCommentary).to.have.property('_id');
      expect(response.createCommentary).to.have.property('name');
      expect(response.createCommentary).to.have.property('type');
      expect(response.createCommentary).to.have.property('published');
      expect(response.createCommentary).to.have.property('status');
      expect(response.createCommentary).to.have.property('description');
      expect(response.createCommentary).to.have.property('price');
      expect(response.createCommentary).to.have.property('date');
      expect(response.createCommentary).to.have.property('by');
    } catch (error) {
      console.error(error);
      
      throw new Error("erreur lors de la création du commentaire d'une l'annonce");
    }
  });
  
});
