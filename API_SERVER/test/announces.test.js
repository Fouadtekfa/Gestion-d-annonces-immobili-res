
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
    console.log(response);

    // vérification de la réponse
    expect(response).to.have.property('announces').that.is.an('array');
  });

  // test GraphQL pour créer une nouvelle annonce avec des commentaires
  const client = new GraphQLClient(url, { headers: { Authorization: `Bearer ${token}` } });
  describe('GraphQL Announce Creation Tests', () => {
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
      console.log(response);
  
      //  la réponse
      expect(response).to.have.property('createAnnounce').that.is.an('object');
      const createdAnnounce = response.createAnnounce;
      console.log(createdAnnounce);
      expect(createdAnnounce).to.have.property('comments').that.is.an('array').that.is.empty;
    });
  
  });

  //  nettoyage de la base de données 
  after(async () => {

  });
});
