var faye = require('faye');

bayeux = exports.bayeux = new faye.NodeAdapter({
  mount: '/faye'
, timeout: 45
});

bayeux.attach(app);
