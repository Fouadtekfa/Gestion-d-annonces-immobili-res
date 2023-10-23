'use strict';

var utils = require('../utils/writer.js');
var Announce = require('../service/AnnounceService');


module.exports.getAllAnnounces = function findAnnounces (req, res, next, status) {
  Pet.findAnnounces(status)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};