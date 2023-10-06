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
var createUserRouter=require('./routes/createuser');
var loginUserRouter=require('./routes/login');

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


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/announces', announcesRouter);
app.use('/',createUserRouter);
app.use("/",loginUserRouter);
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
