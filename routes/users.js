var express = require('express');
var router = express.Router();
const passport =require('passport');
const bcrypt = require('bcrypt');
const User = require('../model/users');
const hostname = 'localhost';
const port = 3000;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET page login */
router.get('/login', function(req, res, next) {
  res.render('login', { 
    title: 'login',
    default_directory: 'http://' + hostname + ':' + port
   });

});

router.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;
      
      // recherche email 
      const user = await User.findOne({ email });
      // repondre avec un code d'erreur 401 si l'utilisateur n'est pas trouvé ou si les informations d'identification sont incorrectes
      if (!user) {
          //return res.status(401).json({ message: 'email non trouvé.' });
      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
      
        }

      // vérification mdp
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
          // return res.status(401).json({ message: 'mdp incorrect.' });
          
          return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
      // maintient l'authentification de l'utilisateur en enregistrant son id dans la session 
      req.session.userId = user._id;
      req.session.username = user.username;
      res.redirect('/'); 

  } catch (error) {
      console.error(error);
      res.status(500).json({ message:'une erreur s\'est produite lors de l\'établissement de la connexion'});
  }
});

/* GET page de création d'utilisateur */
router.get('/createuser', function(req, res, next) {
  res.render('createUser', { 
    title: 'Creer un utilisateur',
    default_directory: 'http://' + hostname + ':' + port
   });

});

router.post('/createuser', async (req, res) => {
  try {
      // Récupérer les données du formulaire
      const {name, first_name, email, password,ConfirmPassword} = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'une adresse mail identique avait déjà été enregistrée.' });
      }
      if (password !== ConfirmPassword) {
        return res.status(400).json({ message: 'les mots de passe ne sont pas identiques' });
    }

      // Hacher le mot de passe algorithme de hachage sera exécuté 10 fois 
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Créer un nouvel utilisateur
      const newUser = new User({  name, first_name, email, password: hashedPassword , isAdmin:false});

      // Enregistrer l'utilisateur dans la base de données
      await newUser.save();

      res.redirect('/users/login');

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'une erreur s\'est produite lors de l\'inscription'});
  }
});
module.exports = router;
