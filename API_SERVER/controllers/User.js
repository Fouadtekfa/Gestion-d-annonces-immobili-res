'use strict';

var utils = require('../utils/writer.js');
var User = require('../service/UserService');

module.exports.addUser = function (req, res, next, body) {
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

module.exports.loginUser = function loginUser (req, res, next, body) {
  User.loginUser(body.email, body.password)
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
  