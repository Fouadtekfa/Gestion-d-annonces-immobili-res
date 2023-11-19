var createError = require('http-errors');
var express = require('express');
var mongoose = require ('mongoose');
require("dotenv").config();
var path = require('path');
var cookieParser = require('cookie-parser');

var logger = require('morgan');
const session = require('express-session');
const passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var announcesRouter = require('./routes/announces');
var commentaireRouter=require('./routes/announces')

var app = express();
const key = generateSecretKey(32); 
console.log(key);
// connexion bdd 
(async () => {
  try {
    // Connexion à la base de données MongoDB
    await mongoose.connect(process.env.MDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Si la connexion réussit
    console.log('Connexion à MongoDB réussie');
  } catch (error) {
    // En cas d'échec de connexion
    console.error('Erreur de connexion à MongoDB :', error.message);
    //lever une exception
    throw new Error('Impossible de se connecter à la base de données MongoDB');
  }
})();

//crreer une session 
app.use(
  session({
    secret:key , // Clé secrète pour signer les cookies de session
    resave: false, // Ne pas enregistrer la session si elle n'a pas été modifiée
    saveUninitialized: true, // Enregistrer une nouvelle session même si elle est vide
  })
);

app.use((req, res, next) => {
  //console.log('Session:', req.session);
  next();
});

/**
 * Authentication
 * authRequired => is a boolean property 
 * that configures Express OpenID Connect to require 
 * authentication for all routes when you set it to true.
 * For this project, we'll have a mix of public and protected routes. As such, you set this property to false. 
 * 
 * auth0Logout => is another boolean value that enables 
 * the Auth0 logout feature, 
 * which lets you log out a user of the Auth0 session. 
 * When implementing logout functionality in an application, 
 * there are typically three sessions layers you need to consider:
 */
const { auth } = require('express-openid-connect');

app.use(
  auth({
    issuerBaseURL: process.env.AUTH0_DOMAIN,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: process.env.SESSION_SECRET,
    authRequired: false,
    auth0Logout: true,
    clientSecret: process.env.CLIENT_SECRET,
    authorizationParams: {
      response_type: "code",
      audience: process.env.AUTH0_AUDIENCE,
    },
  })
);

/* We define res.locals within a middleware function handler. 
This object lets you pass data around your Express application. 
There is one caveat about using res.locals: 
these values only live within an individual request. A
As soon as the request-response cycle is complete, 
the values are gone. 
This isn't a problem for our application since each time a user 
requests a route from the browser, 
the request-response cycle starts all over again.
*/
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.oidc.isAuthenticated();
  res.locals.activeRoute = req.originalUrl;
  next();
});

var axios = require('axios');
const { requiresAuth } = require('express-openid-connect');
const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT_API}${process.env.APP_USE}`,
  withCredentials: true,
});

app.get('/external-api', (req, res) => {
  res.render('/');
});

app.get('/external-api/public-message', async (req, res) => {
  let message;

  try {
    const body = await api.get(`http://localhost:6060/api/messages/public-message`);
    message = body.data.message;
  } catch (e) {
    console.log(e);
    message = 'Unable to retrieve message.';
  }

  console.log(message);
});

app.get('/external-api/protected-message', requiresAuth(), async (req, res) => {
  //const { token_type, access_token } = req.oidc.accessToken;
  let message;

  try {
    const body = await api.get(
      `http://localhost:6060/api/messages/protected-message`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN_API}`,
        },
      },
    );

    message = body.data.message;
  } catch (e) {
    message = 'Unable to retrieve message.';
  }
  console.log(message);
});


// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/css', express.static(path.join(__dirname, 'node_modules/boxicons/css')))
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/boxicons/fonts')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/boxicons/dist')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/moment/src')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/moment/src/lib/utils')))


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/announces', announcesRouter);
//pour le teste 
app.use('/', commentaireRouter);
//commentaire
//login
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function generateSecretKey(length) { 
  // caractères possibles pour la clé secrète
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // Crée un tableau de caractères aléatoires de la longueur spécifiée
  const characterArray = Array.from({ length }, () => {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters.charAt(randomIndex);
  });

  // Concatène les caractères en une seule chaîne pour former la clé secrète
  const secretKey = characterArray.join('');
  return secretKey;
}


module.exports = app;
