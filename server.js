require('dotenv').config()
const bodyParser = require('body-parser')
const validator = require('validator')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()

// Basic Configuration
const port = process.env.PORT || 3000
//connection to DBMS
mongoose.connect(
  process.env.URI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  },
  function (err) {
    err ? console.log(err) : console.log('connected to database')
  }
)
// schema for sites
const siteSchema = mongoose.Schema({
  original_url: String,
  short_url: Number,
})
// model for sites
const Site = new mongoose.model('site', siteSchema)
// middlewares
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public', express.static(`${process.cwd()}/public`))
// HomePage
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

///for posting sites to the database ///
app.post('/api/shorturl', function (req, res) {
  if (validator.isURL(req.body.url)) {
    console.log('inside passed reg')

    const siteData = new Site({
      original_url: req.body.url,
      short_url: Math.floor(Math.random() * 20000),
    })

    siteData.save(function (err, data) {
      if (err) console.log(err)
      else {
        console.log('data posted successfully')
      }
    })
    const { original_url, short_url } = siteData
    res.json({ original_url, short_url })
  } else res.json({ error: 'invalid url' })
})

///// for redirecting to short urls original site ////
app.get('/api/shorturl/:id', function (req, res) {
  const result = Site.findOne(
    { short_url: req.params.id },
    function (err, doc) {
      if (err) res.send({ error: 'invalid url' })
      else res.redirect(doc.original_url)
    }
  )
})

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
