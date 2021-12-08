var express = require("express");
var router = express.Router();

var fs = require("fs");
var path = require("path");


var cors = require('cors');

router.get("/:documentName", cors(), function (req, res, next) {
  const fileName = req.params.documentName;

  const options = {
    root: path.resolve(__dirname, "../documentRepo"),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
      //'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Content-Type': 'application/pdf',
      'Accept-Ranges': 'bytes'
    }
  }

  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err)
    } else {
      console.log('Sent:', fileName)
    }
  })
});

router.get("/", function (req, res, next) {
  res.render('../views/wvserver/index');
});



module.exports = router;