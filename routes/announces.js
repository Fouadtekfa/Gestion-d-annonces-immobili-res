var express = require('express');
var router = express.Router();
const Announce = require('../model/announce');
const hostname = 'localhost';
const port = 3000;
const { ObjectId } = require('mongodb');



/* GET home page. */
router.get('/create', function(req, res, next) {
  res.render('announce', { 
    title: 'Creer un annonce',
    default_directory: 'http://' + hostname + ':' + port
   });
});

router.post('/create', async (req, res) => {
  try {

    let obj = { 
      name: req.body.name,
      type: req.body.type,
      published: req.body.published,
      status: req.body.status,
      description: req.body.description,
      price: req.body.price,
      date: req.body.date,
      photos: req.body.photos ? req.body.photos : [],
      by: req.session.userId 
    };

    // créer une nouvelle annonce
    const newAnnounce = new Announce(obj);

    // enregistrez l'annonce dans la base de données
    await newAnnounce.save();
    res.redirect('/'); // rediriger l'utilisateur vers la page d'accueil
  } catch (error) {
    console.error(error);
    //pour indiquer au client qu'une erreur interne du serveur s'est produite lors de la création de l'annonce
    res.status(500).json({ message: 'une erreur s\'est produite lors de la création de l\'annonce' });
  }
});

router.post('/modify', async (req, res) => {
  try {

    let obj = { 
      name: req.body.name,
      type: req.body.type,
      published: req.body.published,
      status: req.body.status,
      description: req.body.description,
      price: req.body.price,
      date: req.body.date,
      photos: req.body.photos ? req.body.photos : [],
      by: req.session.userId 
    };

    const filter = { _id:  req.body._id };

    // créer une nouvelle annonce
    let doc = await Announce.findOneAndUpdate(filter, obj);
    res.redirect(`/announces/create?id=${req.body._id}`); // rediriger l'utilisateur vers la page d'accueil
  } catch (error) {
    console.error(error);
    //pour indiquer au client qu'une erreur interne du serveur s'est produite lors de la modification de l'annonce
    res.status(500).json({ message: 'une erreur s\'est produite lors de la modification de l\'annonce' });
  }
});

router.get('/all', function(req, res, next) {
  Announce.find({}).then( function( announces ) {
    res.json( announces );
  }).catch( function( err ) {
    console.log( err );
  } );
});

router.get('/announce/:id', function(req, res, next) {
  Announce.findOne({
    _id: req.params.id
  }).then( function( announce ) {
    res.json( announce );
  }).catch( function( err ) {
    console.log('error');
    console.log( err );
  } );
});


module.exports = router;
