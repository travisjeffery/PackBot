var conf = require('./conf')
  , express = require('express')
  , connect = require('connect');

app = exports.module = express.createServer();
everyauth = exports.everyauth = require('everyauth');

require('./lib/auth');

app.configure(function() {
  app.use(connect.logger());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'keyboard cat'}))
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(everyauth.middleware());
  app.set('view engine', 'jade');
  app.use(app.router);
});

require('./adapters/faye');
require('./routes/chat');
require('./routes/user');

app.listen(8000);
