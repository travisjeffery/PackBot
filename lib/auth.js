var conf = require('../conf');

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

everyauth.helpExpress(app);
