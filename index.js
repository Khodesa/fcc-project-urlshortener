require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const shortid = require("shortid");
const nanoid = require("nanoid");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({ extended: false }))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });

const shortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true
  },
  short: {
    type: String,
    required: true,
    default: shortid.generate
  },
  clicks: {
    type: Number,
    required: true,
    default: 0
  }
});

ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

app.post("/api/shorturl", async (req, res) => {
  //console.log(req.body)
  var url = req.body.url;
  var found = await ShortUrl.findOne({full: url})

  if (!validUrl.isWebUri(url)) {
    console.log("Not Uri")
    res.json({error: "invalid url"});
  } else if (found){
    console.log("Found")
  
    //await found.save();
    console.log(found.full)
    res.json({original_url: found.full, short_url: found.short});
  } else {
    console.log("New")
    var newEntry = new ShortUrl({full: url});
    await newEntry.save();

    res.json({original_url: url, short_url: newEntry.short})
  }
});

app.get("/api/shorturl/:hash", async (req, res) => {
  var shorturl = req.params.hash;
  var address = await ShortUrl.findOne({ short: shorturl });
  if (!address) res.json({ error: "Invalid Url" });
  address.clicks++;
  await address.save();
  res.redirect(address.full)
});

mongoose.connection.on("open", () => {
  app.listen(port, function() {
    console.log(`Listening on port ${port}`);
  });
});
