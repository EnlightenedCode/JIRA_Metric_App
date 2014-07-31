
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');
var JiraApi = require('jira').JiraApi;
var jira;
var LocalStrategy = require('passport-local').Strategy;


// ================================= passport config
passport.use(new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback: true
    },
    function (req, username, password, done) {

        jira = new JiraApi('https', req.body.domain, "443", username, password, '2', true);
        return done(null, {name: "admin"});

    }
));

// Serialized and deserialized methods when got from session
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
//==================================================================
// Define a middleware function to be used for every secured routes
var auth = function (req, res, next) {
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

var app = express();
//var jira = new JiraApi('https', config.host, config.port, config.username, config.password, '2', true)



app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.session({ secret: 'newnuasddggestbluesilenc394janade'})); //session secret
  app.use(passport.initialize());
  app.use(passport.session());  //persistent login sessions
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});
// routes ========


app.get('/', function(req,res){
    res.render('index.jade');
});

app.get('/bugsFound', auth, function (req, res)
{
    var splitFields = undefined;
    if (req.query.fields !== undefined) {splitFields = req.query.fields.split(',')};
    var options = {
        startAt: 0,
        maxResults: req.query.maxResults || 300 ,
        fields: splitFields || []
    };
    jira.searchJira("Project = "+req.query.project_id +" AND type not in (Task, Sub-task, Improvement, 'New Feature', 'QA Task') AND created >= '" + req.query.fromDate + "' AND created <= '" + req.query.toDate + "'", options, function (error, issues)
    {
        res.json(issues)
    });
});

app.get('/reopens', auth, function (req, res)
{
    var splitFields = undefined;
    if (req.query.fields !== undefined) {splitFields = req.query.fields.split(',')};
    var options = {
        startAt: 0,
        maxResults: req.query.maxResults || 300 ,
        fields: splitFields || []
    };
    jira.searchJira("Project = "+req.query.project_id +" and issuetype IN (Bug,'New Feature', Improvement) and status changed to Reopened DURING ('"+ req.query.fromDate + "', '"+ req.query.toDate +"')", options, function (error, issues)
    {
        res.json(issues)
    });
});

app.get('/features', auth, function (req, res)
{
    var splitFields = undefined;
    if (req.query.fields !== undefined) {splitFields = req.query.fields.split(',')};
    var options = {
        startAt: 0,
        maxResults: req.query.maxResults || 100 ,
        fields: splitFields || []
    };

    jira.searchJira("Project = "+req.query.project_id +" and issuetype IN ('New Feature', Improvement) and (status changed to 'Closed' DURING ('"+ req.query.fromDate + "', '"+ req.query.toDate +"') or status changed to 'QA 2nd Verify' DURING('"+ req.query.fromDate + "', '"+ req.query.toDate +"'))", options, function (error, issues)
    {
        console.log(error);
        res.json(issues)
    });
});

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
    jira = undefined;
    res.send(200);
});
//==================================================================



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
