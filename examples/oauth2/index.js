// Deps
var utils = require('../utils');
var config = require('../config');
var Acuity = require('../../');


// App:
var app = utils.express({views: __dirname});


// Router:
app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/authorize', function (req, res) {
  // Redirect the user to the Acuity authorization endpoint.  You must
  // choose a scope to work with.
  var acuity = Acuity.oauth(config);
  acuity.authorizeRedirect(res, {scope: 'api-v1'});
});

app.get('/oauth2', function (req, res) {

  var options = Object.create(config);
  options.accessToken = config.accessToken || req.session.accessToken;
  var acuity = Acuity.oauth(options);
  var response = res;
  var query = req.query;

  if (!query.code || query.error) {
    response.render('oauth2.html', {
      error: query.error,
      query: JSON.stringify(query, null, '  ')
    });
  }

  // Exchange the authorization code for an access token and store it
  // somewhere.  You'll need to pass it to the AcuitySchedulingOAuth
  // constructor to make calls later on.
  acuity.requestAccessToken(query.code).then(function (dt) {

    // Store that access token somewhere:
    if (dt.access_token) {
      req.session.accessToken = dt.access_token;
    }

    // Make a sample request:
    acuity.request('me').then(function (me) {

      response.render('oauth2.html', {
        query: JSON.stringify(query, null, '  '),
        tokenResponse: JSON.stringify(dt, null, '  '),
        me: JSON.stringify(me.data, null, '  ')
      });
    }).catch(function(err){console.error("ERROR me: "+err.error+" with message: "+err.message);})
  }).catch(function(err){console.error("ERROR requestAccessToken: "+err.error+" with message: "+err.message);})
});


// Server:
var server = utils.start(app);
