'use strict';
const Announce = require('../model/announce');
const User = require('../model/user');
/**
 * Get all annonces
 * @returns 
 */
exports.findAnnounces = function() {
    return new Promise(function(resolve, reject) {
        Announce.find({}).then( function( announces ) {
            let resp = {};
            resp['application/json'] = announces;
            let send = resp[Object.keys(resp)[0]] 
            resolve(send);
          }).catch( function( err ) {
            reject(err);
          } );
    });
}

/**
 * Obtenir un annonce par id
 * @param {String} id 
 * @returns 
 */
exports.findAnnounce = function(id) {
  return new Promise(function(resolve, reject) {
      Announce.findOne({
        _id: id
      }).then( function( announce ) {
        let resp = {};
        if( announce == null ) {
          const error = new Error('Announce not found');
          error.status = 404;
          reject(error);
        }
        resp['application/json'] = announce;
        let send = resp[Object.keys(resp)[0]] 
        resolve(send);
      }).catch( function( err ) {
        reject(err);
      } );
  });
}

exports.createAnnounce = function(body) {
  return new Promise(async function(resolve, reject) {
    try {
      const newAnnounce = new Announce(body);
      await newAnnounce.save();
      resolve(newAnnounce);
    } catch (error) {
      reject( error )
    }
  });
}

exports.updateAnnounce = function(body, id) {
  return new Promise(async function(resolve, reject) {
    try {
      const filter = { _id: id };
      let announce = await Announce.findOneAndUpdate(filter, body);
      resolve(announce);
    } catch (error) {
      reject(error);
    }
  });
}

exports.deleteAnnounce = function(id) {
  return new Promise(async function(resolve, reject) {
    try {
      let announce = await Announce.findOneAndDelete({_id: id});
      if(!announce) {
        const error = new Error('Announce not found');
        error.status = 404;
        reject(error);
      }
      resolve(announce);
    } catch( error ) {
      reject(error);
    }
  });
}

exports.addCommentary = function(body, id) {
  return new Promise(function(resolve, reject) {
    User.findById(body.user_id).then( user => {
      if(!user) {
        const error = new Error('User not found');
        error.status = 404;
        reject(error);
      }
      return user;
    }).then(user => {
      Announce.findById(id).then( announce => {
        if(!announce) {
          const error = new Error('Announce not found');
          error.status = 404;
          reject(error);
        }
  
        const newComment = {
          user_id: body.user_id,
          history: [ {
            id_user: body.user_id,
            content: body.commentary,
            date: new Date(),
            read: false
          } ]
        };
        announce.comments.push(newComment)
        
        const filter = { _id:  announce._id };
        Announce.findOneAndReplace( filter, announce ).then( r => {
          resolve(newComment);
        }).catch( err => {
          reject(err);
        });
      } ).catch( err => {
        reject( err );
      }).catch(err => {
        console.log('error');
        reject(err);
      })
    })
  });
}

exports.addCommentaryHistory = function(body, id) {
  return new Promise(function(resolve, reject) {
    Announce.findById(id).then( announce => {
      if(!announce) {
        const error = new Error('Announce not found');
        error.status = 404;
        reject(error);
      }
      announce.comments = body
      const filter = { _id:  announce._id };
      Announce.findOneAndReplace( filter, announce ).then( r => {
        resolve(announce.comments);
      }).catch( err => {
        reject(err);
      });
    } ).catch( err => {
      reject( err );
    })
  });
}