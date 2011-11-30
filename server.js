var everyauth = require('everyauth')
  , conf = require('./conf')
  , express = require('express')
  , connect = require('connect')
  , faye = require('faye')
  , mu = require('mu')
  , app = express.createServer();

var bayeux = new faye.NodeAdapter({
  mount: '/faye'
, timeout: 45
});

everyauth.debug = true; 

var usersById = {};
var nextUserId = 0;
var usersByGoogleId = {};

function addUser(source, sourceUser) {
  var user;
  if (arguments.length === 1) {
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else {
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

everyauth.everymodule
  .findUserById(function(id, callback){
    callback(null, usersById[id]);
  });

everyauth.google
  .findOrCreateUser(function(session, accessToken, extra, googleUser){
    googleUser.refreshToken = extra.refreshToken;
    googleUser.expiresIn = extra.expires_in;
    return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
  })
  .appId(conf.google.clientId)
  .appSecret(conf.google.clientSecret)
  .scope('https://www.google.com/m8/feeds/')
  .entryPath('/auth/google')
  .redirectPath('/');

var routes = function(app) {

};

app.configure(function() {
  app.use(connect.logger());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'keyboard cat'}))
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(everyauth.middleware());
  app.use(app.router);
});

app.post('/message', function(req, res) {
  bayeux.getClient().publish('/channel', {text: req.body.message});
  res.send(200);
});

bayeux.attach(app);

app.configure(function(){
  app.set('view engine', 'jade');
});

app.get('/', function(req, res){
  res.render('home');
});

everyauth.helpExpress(app);

app.listen(8000);
