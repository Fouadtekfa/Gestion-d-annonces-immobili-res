var express = require('express');
var router = express.Router();
const passport =require('passport');
const bcrypt = require('bcrypt');
const User = require('../model/users');
const hostname = 'localhost';
const port = 3000;
var axios = require('axios');
const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT_API}${process.env.APP_USE}`,
  withCredentials: true,
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET page login */
router.get('/login', function(req, res, next) {
  if( req.session.user ) {
    res.redirect('/');
  }

  res.render('login', { 
    title: 'login',
    default_directory: 'http://' + hostname + ':' + port,
    user: req.session.user
   });
});

router.get('/user/:id', function(req, res, next) {
  const userId = req.params.id;
  if( process.env.APP_USE == '/graphql') { // graphql
    let body = JSON.stringify({
      query: `#graphql
          query {
            userById(id: "${userId}") {
                _id
                name
                first_name
                email
                isAdmin
            }
        }`
      }); 
      api.post('/',  body, {
        headers: {
          'Content-Type': 'application/json',
       }
      }).then( r => {
        let usr = r.data
        usr = usr.data.userById
        res.json(usr);
      } ).catch( err => {
        console.log( err );
       });
  } else {
    User.findOne({
      _id: req.params.id
    }).then( function( usr ) {
      res.json( usr );
    }).catch( function( err ) {
      console.log('error');
      console.log( err );
    } );
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if( process.env.APP_USE == '/graphql') {
    try {
        
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
        req.session.user = user;
        res.redirect('/'); 
      } catch (error) {
        console.error(error);
        res.status(500).json({ message:'une erreur s\'est produite lors de l\'établissement de la connexion'});
      }
    } else {
      api.post(`/user/login/`, {email: email, password: password}).then( response => {
        let auth = response.data;
        req.session.userId = auth.user._id;
        req.session.user = auth.user;
        req.session.token = auth.token;
        res.redirect('/'); 
       }).catch( r => {
        res.status(r.response.status).json({ message: r.response.data.error });
       });
  }
});

router.get('/logou', async (req, res) => {
  req.session.destroy();
  res.redirect('/');
} );

/* GET page de création d'utilisateur */
router.get('/createuser', function(req, res, next) {
  res.render('createUser', { 
    title: 'Creer un utilisateur',
    default_directory: 'http://' + hostname + ':' + port
   });

});

router.post('/createuser', async (req, res) => {
  const {name, first_name, email, password,ConfirmPassword} = req.body;

  let obj = {
    user: new User({  name, first_name, email, password, isAdmin:false}),
    ConfirmPassword: ConfirmPassword
  }

  api.post(`/createuser`, obj ).then( response => {
    res.redirect('/users/login');
  }).catch( r => {
    res.status(r.response.status).json({ message: r.response.data.error });
  });
});
module.exports = router;
