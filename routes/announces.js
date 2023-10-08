var express = require('express');
var router = express.Router();
const Announce = require('../model/announce');
const hostname = 'localhost';
const port = 3000;
const { ObjectId } = require('mongodb');



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

router.delete('/announce/:id', function(req, res, next) {
  Announce.findOneAndDelete({
    _id: req.params.id
  }).then( function( announce ) {
    res.json( announce );
  }).catch( function( err ) {
    console.log('error');
    console.log( err );
  } );
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


// router.get('/announce/:id/commentaire', async (req, res) => {
//   try {
//     const announceId = req.params.id;
//     const announce = await Announce.findById(announceId);

//     if (!announce) {
//       return res.status(404).json({ message: 'Annonce non trouvée' });
//     }

//     const comments = announce.comments;

//     console.log(announce.comments);
//     res.render('commentaire', {
//       comments,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
//   }
// });


router.get('/announce/:id/commentaire', async (req, res) => {
  try {
    const announceId = req.params.id;
    const announce = await Announce.findById(announceId);

    if (!announce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    const comments = announce.comments;

    console.log(announce.comments);
    res.render('commentaire', {
        comments: 
        comments,
        id: req.params.id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
  }
});


router.post('/announce/:id/commentaire/ajouter', async (req, res) => {
  try {
    const announceId = req.params.id;
    console.log("====================================================================")
    console.log(announceId)
    const { user_id, commentaire } = req.body;
    console.log("====================================================================")

     console.log(req.session.userId);
    // Vérifiez si l'utilisateur est connecté en contentvérifiant la session
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Vous devez être connecté pour ajouter un commentaire' });
    }
    //console.log(commentaire,user_id);

    const announce = await Announce.findById(announceId);

    if (!announce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    console.log("=========comm=============================")
    console.log(commentaire)
    const newComment = {
      user_id: req.session.userId, // Utilisez l'ID de l'utilisateur connecté
      history: [{
        id_user: req.session.userId,
        commentaire,
      }],
    };


    announce.comments.push(newComment);
    await announce.save();

    res.redirect(`/announce/${announceId}/commentaire`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
  }
});

module.exports = router;
