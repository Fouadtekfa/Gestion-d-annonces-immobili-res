'use strict';

exports.getAllAnnounces = function(status) {
    console.log('getttttt!!!!');
    const Announce = require('../model/announce');
    return new Promise(function(resolve, reject) {
        Announce.find({}).then( function( announces ) {
            let resp = {};
            resp['application/json'] = announces;
            resolve(resp[Object.keys(resp)[0]]);
          }).catch( function( err ) {
            reject();
          } );
    });
  }