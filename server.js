'use strict'
const express = require('express')
const mustache = require('mustache')
const fs = require('fs/promises')
const bodyParser = require('body-parser')
const apiKeys = require('./apiKeys.js')
const pdfs = require('./pdfs.js')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

app.get('/test', async function(request, response) {
  response.set('Content-Type', 'application/pdf');
  response.send(Buffer.from(await pdfs.generateInvoice({
    title: 'Invoice',
    senderName: "Codecool",
    senderAddress: ["Liechtensteinstraße 210", "1090 Wien"],
    recipientName: 'Student No. 1',
    recipientAddress: ['Student Street 1', '1010 Wien'],
    items: [{name: 'Fancy Coffee', amount: 10, price: '3.50'}, 
      {name: 'Fancy Pants Coffee', amount: 5, price: '100000'}],
  })))
});

app.get('/api-key', async function(request, response) {
  const template = await fs.readFile('templates/api-key.html', 'utf-8')
  response.send(mustache.render(template, {apiKey: null}))
})

app.post('/api-key', async function(request, response) {
  const template = await fs.readFile('templates/api-key.html', 'utf-8')
  if (request.body['all-your-data'] && request.body['all-your-data'].trim() !== '') {
    response.send(mustache.render(template, {apiKey: apiKeys.generateApiKey()}))
  } else {
    response.send(mustache.render(template, {error: 'Please give us all your data!'}))
  }
});

const getApiKey = (request) => request.get('X-API-TOKEN');

app.get('/invoice', async function(request, response) {
  const template = await fs.readFile('templates/invoice.html', 'utf-8')
  response.send(mustache.render(template, {}))
})

app.post('/invoice', async function(request, response, next) {
  try {
    if(getApiKey(request) && apiKeys.validateApiKey(getApiKey(request))) {
      const invoiceData = request.body;
      //response.set('Content-Type', 'application/pdf');
      response.send(Buffer.from(await pdfs.generateInvoice(invoiceData)))
    } else {
      next(new Error('Invalid or missing api key'))
    }
  } catch(error) {
    next(error)
  }
})

// Error handlers
app.use(function fourOhFourHandler (req, res) {
  res.status(404).send()
})
app.use(function fiveHundredHandler (err, req, res, next) {
  console.error(err)
  res.status(500).end(err.message)
})

// Start server
app.listen(8080, function (err) {
  if (err) {
    return console.error(err)
  }

  console.log('Started at http://localhost:8080')
})
