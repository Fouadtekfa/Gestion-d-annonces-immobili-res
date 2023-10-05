var express = require('express');
var router = express.Router();
const hostname = 'localhost';
const port = 3000;
/* GET page login */
router.get('/login', function(req, res, next) {
    res.render('login', { 
      title: 'login',
      default_directory: 'http://' + hostname + ':' + port
     });
  
  });

  module.exports = router;