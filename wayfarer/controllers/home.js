var express = require('express');
var router = express.Router();

router.use('/', function(req, res, next) {
  res.render('index', { title: 'this is index' });
});

module.exports = router;
