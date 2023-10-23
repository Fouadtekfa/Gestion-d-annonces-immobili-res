'use strict';

exports.getAllAnnounces = function(status) {
    return new Promise(function(resolve, reject) {
        Announce.find({}).then( function( announces ) {
            let resp['application/json'] = announces;
            resolve(resp[Object.keys(resp)[0]]);
          }).catch( function( err ) {
            reject();
          } );
    });
  }