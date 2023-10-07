var express = require('express');
var router = express.Router();
const Announce = require('../model/announce');

const hostname = 'localhost';
const port = 3000;

/* GET home page. */
router.get('/create', function(req, res, next) {
  res.render('announce', { 
    title: 'Creer un annonce',
    default_directory: 'http://' + hostname + ':' + port
   });
});

router.post('/create', async (req, res) => {
  try {
    // recuperer les données du formulaire
    const { name, type, published, status, description, price, date, photos } = req.body;
    // créer une nouvelle annonce
    const newAnnounce = new Announce({
      name,
      type,
      published,
      status,
      description,
      price,
      date,
      photos,
    });

    // enregistrez l'annonce dans la base de données
    await newAnnounce.save();
    res.redirect('/'); // rediriger l'utilisateur vers la page d'accueil
  } catch (error) {
    console.error(error);
    //pour indiquer au client qu'une erreur interne du serveur s'est produite lors de la création de l'annonce
    res.status(500).json({ message: 'une erreur s\'est produite lors de la création de l\'annonce' });
  }
});


module.exports = router;
