var express = require("express");
var router = express.Router();

var fs = require("fs");
var path = require("path");
var jwt = require("jsonwebtoken");
var jwtKey = fs.readFileSync(path.resolve(__dirname, "../config/pspdfkit/jwt.pem"));

var cors = require('cors');

router.get("/:documentId", cors(), function (req, res, next) {
  var jwt = prepareJwt(req.params.documentId);

  res.send({ documentId: req.params.documentId, jwt: jwt });
});

var prepareJwt = function (documentId) {
  var claims = {
    document_id: documentId,
    permissions: ["read-document", "write", "download"],
  };

  return jwt.sign(claims, jwtKey, {
    algorithm: "RS256",
    expiresIn: 3 * 24 * 60 * 60, // 3 days
  });
};


module.exports = router;