var express = require('express');
var router = express.Router();
const passport =require('passport');
const bcrypt = require('bcrypt');
const User=require('../model/users');
const hostname = 'localhost';
const port = 3000;


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
      
      console.log(name);
      console.log(name, first_name, email, password,ConfirmPassword);
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
      console.log(newUser);
      // Enregistrer l'utilisateur dans la base de données
      await newUser.save();
      console.log(newUser);
      res.redirect('/');

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'une erreur s\'est produite lors de l\'inscription'});
  }
});


module.exports = router;

