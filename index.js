require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const { url } = require('inspector');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect(process.env.cluster,{ useNewUrlParser: true, useUnifiedTopology: true }).then( () => console.log("Connection Successfull\n","Connection Status: ",
mongoose.connection.readyState)).catch(console.log("Database Error\n","Connection Status: ",mongoose.connection.readyState));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// making urlSchema in mongoose.
const urlSchema = new mongoose.Schema({url : String});
// making urlSchema model.
const URL = new mongoose.model('URL', urlSchema);

app.post('/api/shorturl', (req, res) => {
  let body = req.body.url;
  dns.lookup(urlParser.parse(body).hostname, (err, address) => {
    if (!address) {
      res.json({error: 'invalid url' });
    }
    else {
      URL.findOne({url: body}, (err, data) => {
        if(data) {
          res.json({original_url: data.url, short_url: data._id });
        }
        else {
              URL.create({url : body}, (err, data) => {
              if (err) return console.error(err);
          res.json({original_url: data.url, short_url: data._id }); });
        }
      });
    }
  });
});
app.get('/api/shorturl/:id', (req, res) => {
  let num = req.params.id;
  URL.findById(num, (err, data) => {
    if(!err) {
      res.redirect(data.url);
    }
  });
});




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
