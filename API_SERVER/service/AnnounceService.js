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
            reject();
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
        resp['application/json'] = announce;
        let send = resp[Object.keys(resp)[0]] 
        resolve(send);
      }).catch( function( err ) {
        reject();
      } );
  });
}
