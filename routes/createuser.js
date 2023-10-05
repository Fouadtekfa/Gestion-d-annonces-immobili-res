var express = require('express');
var router = express.Router();
const hostname = 'localhost';
const port = 3000;

/* GET page de création d'utilisateur */
router.get('/createuser', function(req, res, next) {
  res.render('createUser', { 
    title: 'Creer un utilisateur',
    default_directory: 'http://' + hostname + ':' + port
   });

});


module.exports = router;

