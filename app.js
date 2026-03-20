var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');

//==================================================================
// Define the strategy to be used by PassportJS
passport.use(new LocalStrategy(
  function(username, password, done) {
    if (username === "admin" && password === "admin") // stupid example
      return done(null, {name: "admin"});

    return done(null, false, { message: 'Incorrect username.' });
  }
));

// Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
  if (!req.isAuthenticated()) 
    return res.sendStatus(401);
  else
  	next();
};
//==================================================================

// Start express application
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware (modern replacements)
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ 
  secret: 'securedsession',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization

app.use(express.static(path.join(__dirname, 'public')));

// development only
// if ('development' == app.get('env')) {
//   app.use(express.errorHandler());
// }

//==================================================================
// routes
app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});

app.get('/users', auth, function(req, res){
  res.json([{name: "user1"}, {name: "user2"}]);
});
//==================================================================

//==================================================================
// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
  res.send(req.isAuthenticated() ? req.user : '0');
});

// route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
  res.send(req.user);
});

// route to log out
app.post('/logout', function(req, res){
  req.logOut();
  res.send(200);
});
//==================================================================

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
