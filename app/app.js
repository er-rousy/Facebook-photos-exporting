// include and initialize the rollbar library with your access token
var Rollbar = require('rollbar');
var rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  handleUncaughtExceptions: true,
  handleUnhandledRejections: true
});

const express = require('express');
const path = require('path');
var admin = require("firebase-admin");
var bodyParser = require('body-parser');

const app = express();

var serviceAccount = require("./firebaseKey/hidden-founder-firebase-adminsdk-6qywj-980f685610.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hidden-founder.firebaseio.com"
});

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)//
router.post('/get-token', function (req, res) {

  var additionalClaims = {
    premiumAccount: true
  };

  admin.auth().createCustomToken(req.body.user_fb_id, additionalClaims)
    .then(function (customToken) {
       res.json(customToken);
    })
    .catch(function (error) {
      console.log("Error creating custom token:", error);
    });
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('port', process.env.PORT || 8585);

app.use(express.static(path.join(__dirname, './prod')));

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

app.listen(app.get('port'), () => {
  console.info(`serving  http://localhost:${app.get('port')}`);
});



