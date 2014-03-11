var express = require('express');
var app = module.exports = express();
var SearchManager = require('./src/SearchManager');
var path = require('path');
var Settings = require('./src/Settings');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');


var es = new SearchManager();
var settings = new Settings();

var users = [
    { id: 1, username: 'bob', password: 's'}, { id: 2, username: 'joe', password: 'birthday'}
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

function ensureAuthenticated(req, res, next) {
  req.session.returnTo = req.path;
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      });
    });
  }
));

app.configure(function() {

  app.set('views', __dirname);
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  app.use(express.static(path.join(__dirname, 'app')));

});

app.get('/login', function (req, res){
  res.render('login', { user: req.user, message: req.flash('error') });
});

app.get('/search', function (req, res){
	es.search(req, res);
});
app.get('/item*', ensureAuthenticated, function (req, res){
	es.origin(req, res);
});
app.get('/suggest', function (req, res){
	es.suggest(req, res);
});
app.post('/update', function (req, res){
	es.update(req, res);
});
app.get('/settings', function (req, res){
	settings.getMenu(req, res);
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function (req, res) {
    res.redirect(req.session.returnTo || '/');
  });

app.listen(process.env.PORT || 3000);

