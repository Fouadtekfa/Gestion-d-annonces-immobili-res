'use strict';

var utils = require('../utils/writer.js');
var User = require('../service/UserService');

module.exports.addUser = function (req, res, next, body) {
    console.log('add userrrr');
    console.log(body);
    User.addUser(body)
      .then(function (response) {
        utils.writeJson(res, response);
      })
      .catch(function (error) {
        if (error.status) {
          res.status(error.status).json({ error: error.message });
        } else {
          console.log(error);
          res.status(500).json({ error: 'Erreur lors de la création d\'un utilisateur' });
        }
    });
  };