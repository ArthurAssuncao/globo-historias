var express = require('express');
var multer = require('multer');
var fake = require('./fake');
var repository = require('./repository');
var bodyParser = require('body-parser');
var app = express();

// TODO: use nginx to serve static content.
app.use('/videos', express.static('storage'));

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './storage');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + '.mp4');
  }
});

var storyVideoUpload = multer({ storage : storage}).single('storyVideo');

// TODO: use nginx to serve static content.
app.use('/videos', express.static('storage'));

app.route('/composer/create-new-story')
    .post(function(req, res) {
        storyVideoUpload(req, res, function(err) {
            if (err) {
                res.json({
                    error: 'Video could not be moved to the storage.'
                });
    		}
    		else {
                var story = repository.createStory(req.body);
                res.json(story);
    		}
        });
    });

  app.route('/editor/get-activities')
    .get(function(req, res){
      //call the database to get the activities
      //insert the following code as callback
      var err = false;
      if(err){
        console.log(err);
        res.send(err);
      } else {
        var response = fake.FAKE_ACTIVITIES;
        res.send(response);
      }
  });

  app.get('/editor/get-stories-by-activity-id', function(req, res){
    if (!req.query.activity_id) {
      res.send({failure: 'activity_id was not send'});
      return;
    }
    var activity_id = req.query.activity_id;
    //call the database to retrieve stories with matched_activities._id == activity_id
    var response = fake.apiHelper('stories-by-activity', {activity_id: activity_id});
    if(response.err){
      console.log(response.err);
      res.send(response.err);
    } else {
      res.send(response);
    }
  });

  app.route('/editor/get-story-by-id')
    .get(function(req, res){
      var story_id = req.query.story_id;
      if (!story_id) {
        res.send({failure: 'story_id was not sent'});
        return;
      }
      var response = fake.apiHelper('story-by-id', {story_id: story_id});
      if(response.err) {
        console.log(response.err);
        res.send(response.err);
      } else {
        res.send(response);
      }
    });

  app.route('/widget/get-stories-by-activity-id')
    .get(function(req, res){
      var activity_id = req.query.activity_id;
      if (!activity_id) {
        res.send({failure: 'activity_id was not sent'});
        return;
      }
      // var response = fake.apiHelper('widget-stories-by-activity', {activity_id: activity_id});
      var response = fake.apiHelper('stories-by-activity', {activity_id: activity_id});
      if(response.err) {
        console.log(response.err);
        res.send(response.err);
      } else {
        res.send(response);
      }
    });

  app.route('/editor/approve-story-for-activity')
      .post(urlencodedParser, function(req, res) {
        var activity_id = req.body.activity_id;
        var story_id = req.body.story_id;
        if(!activity_id || !story_id){
          var failure = 'activity_id or story_id was not sent';
          console.log('activity_id or story_id was not sent')
          res.send(failure);
        } else {
          var response = repository.approveStoryForActivity(activity_id, story_id);
          if(response.err){
            console.log(response.err);
            res.send(response.err);
          } else {
            res.send(response);
          }
        }
      });

app.listen(3000);

console.log("Server is running on port 3000");
