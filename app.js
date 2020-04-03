//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


const port = 3000;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// ========================================== Encryption ========================================================//
// Add any other plugins or middleware here. For example, middleware for hashing passwords
const encKey = process.env.SECRET_32BYTE_BASE64_STRING;
const sigKey = process.env.SECRET_64BYTE_BASE64_STRING;


// ========================================== DataBase ========================================================//

//start connection to data base
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//user DataBase schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// This adds _ct and _ac fields to the schema, as well as pre 'init' and pre 'save' middleware,
// and encrypt, decrypt, sign, and authenticate instance methods
userSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ['password']
});
//create user model

const User = mongoose.model('User', userSchema);



// ========================================== Home Route ========================================================//
app.route('/')

  .get((req, res) => {
    res.render('home');
  });

// ========================================== Register Route ========================================================//

app.route('/register')

  .get((req, res) => {
    res.render('register');
  })

  .post((req, res) => {
    //create new user document
    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    });
    // save document to database
    newUser.save((err) => {
      //check if error log this error
      if (err) {
        console.log(err);
        //else render secret page
      } else {
        res.render('secrets');
      }
    });
  });


// ========================================== Login Route ========================================================//

app.route('/login')

  .get((req, res) => {
    res.render('login');
  })

  .post((req, res) => {
    //save username and Password to var
    const userName = req.body.username;
    const password = req.body.password;

    //search for user name in DB
    User.findOne({
      email: userName
    }, (err, foundUser) => {

      if (!err) {
        //check if it have the same Password
        if (password === foundUser.password) {
          //render the secret page
          res.render('secrets');
        } else {
          alert('user name not exist');
        }
      } else {
        console.log(err);
      }
    });

  });





app.listen(port, () => {
  console.log('server is working on port 3000');
});
