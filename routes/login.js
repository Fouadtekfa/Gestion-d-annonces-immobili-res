var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../model/users');
const hostname = 'localhost';
const port = 3000;

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
        console.log(email , password);
        
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
        // console.log("===================================================")
        // console.log(req.session);
        req.session.username = user.username;
        res.redirect('/'); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ message:'une erreur s\'est produite lors de l\'établissement de la connexion'});
    }
});


  module.exports = router;