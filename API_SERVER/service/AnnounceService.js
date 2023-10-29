'use strict';

exports.findAnnounces = function(status) {
    console.log('getttttt!!!!');
    const Announce = require('../model/announce');
    return new Promise(function(resolve, reject) {
        Announce.find({}).then( function( announces ) {
            let resp = {};
            resp['application/json'] = announces;
            let send = resp[Object.keys(resp)[0]] 
            console.log('send!!!');
            console.log(send);
            resolve(send);
          }).catch( function( err ) {
            reject();
          } );
    });
  }