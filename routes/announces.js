var express = require('express');
var router = express.Router();
const hostname = 'localhost';
const port = 3000;

/* GET home page. */
router.get('/create', function(req, res, next) {
  res.render('announce', { 
    title: 'Creer un annonce',
    default_directory: 'http://' + hostname + ':' + port
   });
});

module.exports = router;
