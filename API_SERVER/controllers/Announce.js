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
  .catch(function (error) {
    console.log('error');
    if (error.status) {
      console.log('check status'); console.log(error);
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
    }
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

module.exports.addCommentary = function (req, res, next, body, idAnnounce) {
  Announce.addCommentary( body, idAnnounce )
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
      }
    });
};

module.exports.addCommentaryHistory = function (req, res, next, body, idAnnounce) {
  Announce.addCommentaryHistory( body, idAnnounce )
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (error) {
      if (error.status) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de l\'ajout d\'historique dans le commentaire' });
      }
  });
};