var express = require('express');
var router = express.Router();
const Announce = require('../model/announce');
const hostname = 'localhost';
const port = 3000;
const { ObjectId } = require('mongodb');
var axios = require('axios');
const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT_API}`,
  withCredentials: true,
});

/* GET home page. */
router.get('/create', function(req, res, next) {
  if( !req.session.user ) {
    res.redirect('/');
  } if( !req.session.user.isAdmin) {
    res.redirect('/');
  }

  res.render('announce', { 
    title: 'Creer un annonce',
    default_directory: 'http://' + hostname + ':' + port
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

  api.post('/announce/create', obj ).then( response => {
     res.redirect('/');
   }).catch( err => {
      console.error(err);
      res.status(500).json({ message: 'une erreur s\'est produite lors de la création de l\'annonce' });
   });
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

  api.put(`/announce/modify?_id=${req.body._id}`, obj ).then( response => {
    res.redirect('/');
  }).catch( err => {
     console.error(err);
     res.status(500).json({ message: 'une erreur s\'est produite lors de la création de l\'annonce' });
  });
});

router.get('/all', function(req, res, next) {
 api.get('/announces').then( response => {
  res.json(response.data);
 }).catch( err => {
  console.log( err );
 });
});

router.get('/announce/:id', function(req, res, next) {
  api.get(`/announce/${req.params.id}`).then( response => {
    res.json(response.data);
   }).catch( err => {
    console.log( err );
   });
});

router.delete('/announce/:id', function(req, res, next) {
  api.delete(`/announce/${req.params.id}`).then( response => {
    res.json(response.data);
   }).catch( err => {
    console.log( err );
   });
});

router.get('/commentaire', (req, res) => {
  // Simuler des données de commentaires pour le test ==> ca marche 
  const comments = [
    { history: [{ content: 'Commentaire 1', date: new Date() }] },
    { history: [{ content: 'Commentaire 2', date: new Date() }] },
    { history: [{ content: 'Commentaire 2', date: new Date() }] },
    { history: [{ content: 'Commentaire 2', date: new Date() }] },
    { history: [{ content: 'Commentaire 2', date: new Date() }] },
    { history: [{ content: 'Commentaire 2', date: new Date() }] },
    { history: [{ content: 'Commentaire 2', date: new Date() }] },
    { history: [{ content: 'Commentaire 2', date: new Date() }] },
    { history: [{ content: 'Commentaire 2', date: new Date() }] },
    { history: [{ content: 'Commentaire 2', date: new Date() }] },
    { history: [{ content: 'Commentaire 2', date: new Date() }] },
  ];

   
  res.render('commentaire', { comments });
});

router.get('/announce/:id/commentaire', async (req, res) => {
  try {
    const announceId = req.params.id;
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
});


router.post('/announce/:id/commentaire/ajouter', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Vous devez être connecté pour ajouter un commentaire' });
  }

  const announceId = req.params.id;
  const { commentaire } = req.body;

  let obj = { 
    user_id: req.session.userId,
    commentary: commentaire
  }

  api.post(`/announce/${announceId}/commentaire/ajouter`, obj ).then( response => {
    res.redirect(`/announce/${announceId}/commentaire`);
  }).catch( r => {
    res.status(r.response.status).json({ message: r.response.data.error });
  });
});

router.post('/announce/:id/commentaire/history', async (req, res) => {
  try {
    
    const announceId = req.params.id;
    
    // Vérifiez si l'utilisateur est connecté en contentvérifiant la session
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Vous devez être connecté pour ajouter un commentaire' });
    }
    
    const announce = await Announce.findById(announceId);

    if (!announce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    announce.comments = req.body
    
    const filter = { _id:  announce._id };
    // créer une nouvelle annonce
    let doc = await Announce.findOneAndReplace( filter, announce );

    res.redirect(`/announce/${announceId}/commentaire`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
  }
});

module.exports = router;
