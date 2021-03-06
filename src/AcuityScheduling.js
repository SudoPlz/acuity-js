/**
 * AcuityScheduling Class
 */

var axios = require("axios");
var pkg = require('../package');
var querystring = require('querystring');

function AcuityScheduling (config) {
  config = config || {};
  this.base = config.base || AcuityScheduling.base;
  this.apiKey = config.apiKey;
  this.userId = config.userId;
  return this;
}

AcuityScheduling.base = 'https://acuityscheduling.com';
AcuityScheduling.agent = 'AcuityScheduling-js/' + pkg.version;

AcuityScheduling.prototype._request = function (path, options, cb) {
  options = options || {};
  if (typeof options === 'function') {
    cb = options;
  }
  path = typeof path === 'string' ? path : '';

  var config = {
    url: this.base + '/api/v1' + (path.charAt(0) === '/' ? '' : '/') + path,
  };

  // Set configurable options:
  if (options.auth)     config.auth     = options.auth;
  if (options.body)     config.data     = options.body;
  if (options.method)   config.method   = options.method;
  if (options.qs) config.params = querystring.stringify(options.qs);
  config.headers =      options.headers || {};

  // User agent:
  config.headers['User-Agent'] = AcuityScheduling.agent;

  return axios(config)
  .then(function(res){
    if (cb) {cb(null, res, res.data);}
    return res;
  })
  .catch(function(err){
    if(err.response && err.response.data){  // if we got an error response from the server
      if (cb) {cb(null, err.response, err.response.data);}  // pass it to the cb
      return err.response;  //return it's promise
    }
    // otherwise
    if (cb) { // if there's a callback
      cb(err);  // pass the error to it
    } else {
      throw err;  // throw the generic error
    }
  });
};

AcuityScheduling.prototype.request = function (path, options, cb) {
  options = options || {};
  options.auth = options.auth || {
    username: this.userId + '',
    password: this.apiKey
  };
  return this._request(path, options, cb);
};

module.exports = AcuityScheduling;
