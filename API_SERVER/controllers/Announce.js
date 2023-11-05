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

module.exports.addAnnounce = function (req, res, next, body) {
  Announce.createAnnounce(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
  });
};

module.exports.updateAnnounce = function (req, res, next, body) {
  Announce.updateAnnounce(body, req.query._id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
  });
};

module.exports.deleteAnnounce = function (req, res, next, id) {
  Announce.deleteAnnounce(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};