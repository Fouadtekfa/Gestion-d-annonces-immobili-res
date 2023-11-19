var express = require('express');
var router = express.Router();
const Announce = require('../model/announce');
const hostname = 'localhost';
const port = 3000;
const { ObjectId } = require('mongodb');
var axios = require('axios');
const { requiresAuth } = require('express-openid-connect');
require("dotenv").config();
const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT_API}${process.env.APP_USE}`,
  withCredentials: true,
});

/* GET home page. */
// use requiresAuth() as middleware, but attention with login
// if the user es not authentifier the login page is not calling our localhost/login
// but the service directly, so the session after is not generated correctly
router.get('/create', function(req, res, next) {
  if( !req.session.user ) {
    res.redirect('/');
  } if( !req.session.user.isAdmin) {
    res.redirect('/');
  }

  res.render('announce', { 
    title: 'Creer un annonce',
    default_directory: 'http://' + hostname + ':' + port,
    user: req.session.user
   });
});

router.post('/create', async (req, res) => {
  let obj = { 
    name: req.body.name,
    type: req.body.type,
    published: req.body.published,
    status: req.body.status,
    description: req.body.description,
    price: parseInt(req.body.price),
    date: req.body.date,
    photos: req.body.photos ? req.body.photos : [],
    by: req.session.userId,
    comments: []
  };

  if( process.env.APP_USE == '/graphql') { // graphql
    const { token_type, access_token } = req.oidc.accessToken ? req.oidc.accessToken : { token_type: '', access_token: ''};
    let body = JSON.stringify({
      query: `#graphql
          mutation ($input: AnnounceInput!) {
              createAnnounce(input: $input) {
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
      `,
        variables: {
            input: obj
        }
      }); 
      api.post('/',  body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token_type} ${access_token}`,
       }
      }).then( r => {
        if( r.data.errors ) {
          let msg = 'une erreur s\'est produite lors de la création de l\'annonce : ' + r.data.errors.map( e => e.message ).join(', ');
          res.status(500).json({ message: msg });
          return;
        } 

        let annonce = r.data
        annonce = annonce.data.createAnnounce
        res.redirect('/');
      } ).catch( err => {
        console.log( err );
       });
  } else { // Swagger
    api.post('/announce/create', obj ).then( response => {
       res.redirect('/');
     }).catch( err => {
        console.error(err);
        res.status(500).json({ message: 'une erreur s\'est produite lors de la création de l\'annonce' });
     });
  }
});

router.post('/modify', async (req, res) => {
  let obj = { 
    name: req.body.name,
    type: req.body.type,
    published: req.body.published,
    status: req.body.status,
    description: req.body.description,
    price: parseInt(req.body.price),
    date: req.body.date,
    photos: req.body.photos ? req.body.photos : [],
    by: req.session.userId 
  };
  const announceId = req.body._id;
  if( process.env.APP_USE == '/graphql') { // graphql
    const { token_type, access_token } = req.oidc.accessToken ? req.oidc.accessToken : { token_type: '', access_token: ''};
    let body = JSON.stringify({
      query: `#graphql
          mutation ($input: AnnounceModifyInput!) {
            modifyAnnounce(input: $input) {
                  _id
              }
          }
        `,
        variables: {
            input: {
              _id: announceId,
              announce: obj
            }
        }
      });
      api.post('/',  body, {
        headers: {
          'Content-Type': 'application/json',
            Authorization: `${token_type} ${access_token}`,
       }

      }).then( r => {
      if( r.data.errors ) {
        let msg = 'une erreur s\'est produite lors de la modification de l\'annonce : ' + r.data.errors.map( e => e.message ).join(', ');
        res.status(500).json({ message: msg });
        return;
      } 
        let annonce = r.data
        annonce = annonce.data.modifyAnnounce
        res.redirect('/');
      } ).catch( err => {
        console.log( err );
       });
  } else { // Swagger
    api.put(`/announce/modify?_id=${req.body._id}`, obj ).then( response => {
      res.redirect('/');
    }).catch( err => {
       console.error(err);
       res.status(500).json({ message: 'une erreur s\'est produite lors de la création de l\'annonce' });
    });
  }
});

router.get('/all', function(req, res, next) {
  if( process.env.APP_USE == '/graphql') { // graphql
    console.log('finddddd');
    console.log(req.oidc.accessToken);
    const { token_type, access_token } = req.oidc.accessToken ? req.oidc.accessToken : { token_type: '', access_token: ''};
    console.log('check');
    let body = JSON.stringify({
      query: `#graphql
          query {
            announces {
              _id
              name
              type
              published
              status
              description
              price
              date
              photos {
                filename
                originalName
              }
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
        }`
      });
    api.post('/',  body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token_type} ${access_token}`,
     }
    }).then( r => {console.log('checking res');
    console.log(r);
      let annonces = r.data
      annonces = annonces.data.announces
      res.json(annonces);
    } ).catch( err => {
      console.log('errrorrrr');
      console.log( err );
     });
  } else { // Swagger
    api.get('/announces').then( response => {
     res.json(response.data);
    }).catch( err => {
     console.log( err );
    });
  }
});

router.get('/announce/:id', function(req, res, next) {
  const announceId = req.params.id;
  if( process.env.APP_USE == '/graphql') { // graphql
    const { token_type, access_token } = req.oidc.accessToken ? req.oidc.accessToken : { token_type: '', access_token: ''};
    let body = JSON.stringify({
      query: `#graphql
          query {
            announceById(id: "${announceId}") {
              _id
              name
              type
              published
              status
              description
              price
              date
              photos {
                filename
                originalName
              }
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
        }`
      }); 
      api.post('/',  body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token_type} ${access_token}`,
       }
      }).then( r => {
        let annonce = r.data
        annonce = annonce.data.announceById
        res.json(annonce);
      } ).catch( err => {
        console.log( err );
       });
  } else { // Swagger
    api.get(`/announce/${req.params.id}`).then( response => {
      res.json(response.data);
     }).catch( err => {
      console.log( err );
     });
  }
});

router.delete('/announce/:id', function(req, res, next) {
  const announceId = req.params.id;
  if( process.env.APP_USE == '/graphql') { // graphql
    const { token_type, access_token } = req.oidc.accessToken ? req.oidc.accessToken : { token_type: '', access_token: ''};
    let body = JSON.stringify({
      query: `#graphql
          mutation {
            deleteAnnounce(id: "${announceId}") {
              _id
            }
        }`
      }); 
      api.post('/',  body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token_type} ${access_token}`,
       }
      }).then( r => {
        let annonce = r.data
        annonce = annonce.data.deleteAnnounce
        res.json(annonce);
      } ).catch( err => {
        console.log( err );
       });
  } else {
    api.delete(`/announce/${req.params.id}`).then( r => {
      if( r.data.errors ) {
        let msg = 'une erreur s\'est produite lors de la suppression de l\'annonce : ' + r.data.errors.map( e => e.message ).join(', ');
        res.status(500).json({ message: msg });
        return;
      }

      res.json(r.data);
     }).catch( err => {
      console.log( err );
     });
  }
});

router.get('/announce/:id/commentaire', async (req, res) => {
  const announceId = req.params.id;
  if( process.env.APP_USE == '/graphql') { // Graphsql
    const { token_type, access_token } = req.oidc.accessToken ? req.oidc.accessToken : { token_type: '', access_token: ''};
    let body = JSON.stringify({
      query: `#graphql
          query {
            announceById(id: "${announceId}") {
              _id
              name
              type
              published
              status
              description
              price
              date
              photos {
                filename
                originalName
              }
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
        }`
      }); 
      api.post('/',  body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token_type} ${access_token}`,

       }
      }).then( r => {
        let annonce = r.data
        annonce = annonce.data.announceById
        res.render('commentaire', {
          announce: annonce,
          id: req.params.id,
          user: req.session.user
      });
      } ).catch( err => {
        console.log( err );
       });
  } else { // Swagger
    try {
      let announce = await api.get(`/announce/${announceId}`);
      announce = announce.data;
  
      res.render('commentaire', {
          announce: announce,
          id: req.params.id,
          user: req.session.user
      });
  
    } catch ( r ) {
      res.status(r.response.status).json({ message: r.response.data.error });
    }
  }
});


router.post('/announce/:id/commentaire/ajouter', async (req, res) => {
  const announceId = req.params.id;
  const { commentaire } = req.body;

  let obj = { 
    user_id: req.session.userId,
    commentary: commentaire
  }

  if (!req.session.userId) {
    return res.status(401).json({ message: 'Vous devez être connecté pour ajouter un commentaire' });
  }

  if( process.env.APP_USE == '/graphql') { 
    const { token_type, access_token } = req.oidc.accessToken ? req.oidc.accessToken : { token_type: '', access_token: ''};
    let body = JSON.stringify({
      query: `#graphql
          mutation ($input: AddCommentInput!) {
            createCommentary(input: $input) {
                  _id
              }
          }
        `,
        variables: {
            input: {
              comment : obj,
              announce_id : announceId
            }
        }
      }); 
      api.post('/',  body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token_type} ${access_token}`,
       }
      }).then( r => {
        if( r.data.errors ) {
          let msg = 'une erreur s\'est produite lors de l\'ajout d\'un commentaire : ' + r.data.errors.map( e => e.message ).join(', ');
          res.status(500).json({ message: msg });
          return;
        } 

        let annonce = r.data
        annonce = annonce.data.createCommentary
        res.redirect(`/announce/${announceId}/commentaire`);
      } ).catch( err => {
        console.log( err );
       });
  } else { // Swagger
    api.post(`/announce/${announceId}/commentaire/ajouter`, obj ).then( response => {
      res.redirect(`/announce/${announceId}/commentaire`);
    }).catch( r => {
      res.status(r.response.status).json({ message: r.response.data.error });
    });
  }
});

router.post('/announce/:id/commentaire/history', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Vous devez être connecté pour ajouter un commentaire' });
  }
  const announceId = req.params.id;
  if( process.env.APP_USE == '/graphql') { 
    const { token_type, access_token } = req.oidc.accessToken ? req.oidc.accessToken : { token_type: '', access_token: ''};
    let body = JSON.stringify({
      query: `#graphql
          mutation ($input: AddCommentHistoryInput!) {
            addCommentaryHistory(input: $input) {
                  _id
              }
          }
        `,
        variables: {
            input: {
              comments : req.body,
              announce_id : announceId
            }
        }
      }); 
      api.post('/',  body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token_type} ${access_token}`,
       }
      }).then( r => {
        if( r.data.errors ) {
          console.log(r.data.errors)
          let msg = 'une erreur s\'est produite lors de l\'ajout d\'une réponse : ' + r.data.errors.map( e => e.message ).join(', ');
          res.status(500).json({ message: msg }); 
          return;
        }

        let annonce = r.data
        annonce = annonce.data.addCommentaryHistory
        res.redirect(`/announce/${announceId}/commentaire`);
      } ).catch( err => {
        console.log( err );
       });
  } else { // Swagger
    api.post(`/announce/${announceId}/commentaire/history`, req.body ).then( response => {
      res.redirect(`/announce/${announceId}/commentaire`);
    }).catch( r => {
      res.status(r.response.status).json({ message: r.response.data.error });
    });
  }
});

module.exports = router;
