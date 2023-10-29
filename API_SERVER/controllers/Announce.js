'use strict';

var utils = require('../utils/writer.js');
var Announce = require('../service/AnnounceService');

module.exports.getAllAnnounces = function (req, res, next, status) {
  Announce.findAnnounces(status)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAnnounceById = function ( req, res, next, id ) {
  Announce.findAnnounce(id)
  .then(function (response) {
    utils.writeJson(res, response);
  })
  .catch(function (response) {
    utils.writeJson(res, response);
  });
}