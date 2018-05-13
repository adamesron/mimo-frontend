/**
 * Express configuration
 */

'use strict';

var express = require('express');
var passport = require('passport');
var PolkaSpotsStrategy = require('passport-polkaspots').Strategy
var session = require('express-session');
var secrets = require('./local.env.sample');

var favicon = require('serve-favicon');
var URI = require('urijs');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');

module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());

  // process.env.APP_ID = process.env.APP_ID || secrets.APP_ID;
  // process.env.APP_SECRET = process.env.APP_SECRET || secrets.APP_SECRET;
  // process.env.CALLBACK_URL = process.env.MIMO_DASHBOARD_URL + '/auth/login/callback';
  // process.env.authorizationURL = process.env.authorizationURL || secrets.authorizationURL;
  // process.env.tokenURL = process.env.tokenURL || secrets.tokenURL;
  // process.env.profileURL = process.env.profileURL || secrets.profileURL;
  // process.env.baseURL = secrets.baseURL;

  passport.serializeUser(function(options, done) {
    done(null, options);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  app.use(session({
    secret: 'keyboard cat 19872 &',
      cookie: {httpOnly: false},
  }))

  app.use(passport.initialize());

  passport.use(new PolkaSpotsStrategy({
    clientID:           secrets.appID,
    clientSecret:       secrets.appSecret,
    callbackURL:        secrets.callbackURL,
    authorizationURL:   secrets.authorizationURL,
    profileURL:         secrets.profileURL,
    tokenURL:           secrets.tokenURL,
    // clientID:           process.env.APP_ID,
    // clientSecret:       process.env.APP_SECRET,
    // callbackURL:        process.env.MIMO_DASHBOARD_URL + '/auth/login/callback',
    // authorizationURL:   process.env.MIMO_API_URL + '/oauth/authorize',
    // profileURL:         process.env.MIMO_API_URL + '/api/v1/me.json',
    // tokenURL:           process.env.MIMO_API_URL + '/oauth/token',
    enableProof: false,
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    var options = profile;
    req.session.accessToken  = accessToken;
    process.nextTick(function () {
      return done(null, options);
    })
    }
  ));

  app.get('/login', passport.authenticate('polkaspots', { failureRedirect: '/login', authType: 'reauthenticate' }));

  app.get('/auth/login', function(req, res) {
    passport.authenticate('polkaspots',
                          {
                            brand: req.query.brand,
                            authType: 'reauthenticate',
                          }
                         )(req, res)
  });

  app.get('/auth/login/callback', passport.authenticate('polkaspots', { failureRedirect: '/login' }), function(req, res) {
    var raw = {};
    var url;

    try {
      raw = JSON.parse(req.session.passport.user._raw)
    }
    catch(e) {}
    res.redirect(process.env.MIMO_DASHBOARD_URL + '/#/login?token=' + req.session.accessToken);

  }, function() {
  });

  var forceSsl = function (req, res, next) {
    // PUT BACK //
    // var nossl = true;
    // if (process.env.NO_SSL === undefined || process.env.NO_SSL === null || process.env.NO_SSL === '') {
    //   nossl = false;
    // }

    // if (nossl && req.headers['x-forwarded-proto'] !== 'https') {
    //   return res.redirect(['https://', req.get('Host'), req.url].join(''));
    // }
    return next();
  };

  if (env === 'production' || env === 'beta') {
    app.use(forceSsl);
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', config.root + '/public');
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', (config.root + '/client'));
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};
