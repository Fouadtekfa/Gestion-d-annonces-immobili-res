'use strict';
const User = require('../model/user');
const bcrypt = require('bcrypt');

exports.addUser = function(body) {
  console.log('check boddyyy'); console.log(body.user);
    return new Promise(async function(resolve, reject) {
      try {
        let email = body.user.email;
        // Vérifier si l'utilisateur existe déjà
        let existingUser = await  User.findOne({ email });
        if ( existingUser ) {
          const error = new Error( 'une adresse mail identique avait déjà été enregistrée.' );
          error.status = 400;
          return reject(error);
        }

        if (body.user.password !== body.ConfirmPassword) {
          const error = new Error( 'les mots de passe ne sont pas identiques' );
          error.status = 400;
          return reject(error);
        }
        
        body.user.password = await bcrypt.hash(body.user.password, 10); 
        // Créer un nouvel utilisateur
        const newUser = new User(body.user);
        await newUser.save();
        resolve( newUser );
      } catch( err ) {
        reject( err );
      }
    });
  }