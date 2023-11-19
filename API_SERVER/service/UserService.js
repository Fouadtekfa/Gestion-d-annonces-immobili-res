'use strict';
const User = require('../model/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.addUser = function(body) {
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

/**
 * Logs user into the system
 * 
 *
 * username String The user name for login
 * password String The password for login in clear text
 * returns String
 **/
exports.loginUser = function(email,password) {
  return new Promise(async function(resolve, reject) {
    try {
      const user = await User.findOne({ email });
      
      if ( !user ) {
        const error = new Error( 'Mot de passe ou utilisateur invalide' );
        error.status = 401;
        return reject(error);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        const error = new Error( 'Mot de passe ou utilisateur invalide' );
        error.status = 401;
        return reject(error);
      }

      let resp = {};
      let token = crypto.randomBytes(32).toString('hex');

      let usr = {
        auth: true,
        user: user,
        token: token
      }

      resp['application/json'] = usr;
      console.log('senddd');
      let send = resp[Object.keys(resp)[0]] 
      console.log(send);
      resolve( send );
    } catch (err){
      reject( err );
    }

    /*var examples = {};
    examples['application/json'] = {
      "bytes": [],
      "empty": true
    };*/

    /*if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }*/
  });
}
