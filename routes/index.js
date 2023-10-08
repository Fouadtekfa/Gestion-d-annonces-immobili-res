var multer = require( 'multer' );
var path = require( 'path' );

var express = require('express');
const moment = require('moment');
var router = express.Router();

const hostname = 'localhost';
const port = 3000;
const acceptedImages = ['image/jpg', 'image/jpeg', 'image/png'];

const multerImages = multer( {
  storage: multer.diskStorage( {
    destination: path.join( __dirname, '../public/images/uploads'),
    filename: ( req, file, cb ) => {
      cb( null, file.originalname);
    }
  }),
  fileFilter: ( req, file, cb ) => {
    if( acceptedImages.includes( file.mimetype ) ) cb( null, true )
    else {
      cb( new Error( 'Fichiers acceptés : ' + acceptedImages.join( ', ' ) ) );
    }
  },
  limits: {
    fieldSize: 10000000
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Announces',    
    default_directory: 'http://' + hostname + ':' + port,
    user: req.session.user
   });
});

router.post('/upload', multerImages.array( 'image' ), function(req, res, next) {
  console.log('check fileeee');
  console.log(req.file);console.log(req.files);
  res.sendStatus( 200 );
});

module.exports = router;
