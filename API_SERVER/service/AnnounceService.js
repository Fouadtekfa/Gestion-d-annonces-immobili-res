'use strict';
const Announce = require('../model/announce');
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
      resolve();
    } catch (error) {
      reject( error )
    }
  });
}

exports.updateAnnounce = function(body, id) {
  return new Promise(async function(resolve, reject) {
    try {
      const filter = { _id: id };
      await Announce.findOneAndUpdate(filter, body);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

exports.deleteAnnounce = function(id) {
  return new Promise(async function(resolve, reject) {
    try {
      let announce = await Announce.findOneAndDelete({_id: id});
      resolve(announce);
    } catch( error ) {
      reject(error);
    }
  });
}

exports.addCommentary = function(body, id) {
  return new Promise(function(resolve, reject) {
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
        resolve();
      }).catch( err => {
        reject(err);
      });
    } ).catch( err => {
      reject( err );
    })
  });
}