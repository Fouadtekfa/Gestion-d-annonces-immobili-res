var express = require('express');
var router = express.Router();
const hostname = 'localhost';
const port = 3000;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Express',    
    default_directory: 'http://' + hostname + ':' + port
   });
});

module.exports = router;
