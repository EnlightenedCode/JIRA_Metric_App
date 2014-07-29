
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , config = require('./config.json')
  , JiraApi = require('jira').JiraApi;

var app = express();
var jira = new JiraApi('https', config.host, config.port, config.username, config.password, '2', true)

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/search/:project_id', function (req, res)
{
    var options = {
        startAt: 0,
        maxResults: 50,
        fields: ["id"]
    };
    jira.searchJira("Project = "+req.params.project_id +" AND type not in (Task, Sub-task, Improvement)", options, function (error, issues)
    {
        console.log(error);
        res.json(issues)
        //console.log('STATUS' + issue.fields.status.name);
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
  jira.findIssue('ZCER-5948', function (error, issue)
    {
        console.log('STATUS' + issue.fields.status.name);
    });
});
