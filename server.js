'use strict'
const express = require('express')
const pdfLib = require('pdf-lib')
const mustache = require('mustache')
const fs = require('fs/promises')
const bodyParser = require('body-parser')

// Create the express app
const app = express()

// Routes and middleware
// app.use(/* ... */)
// app.get(/* ... */)

async function generateInvoice(invoiceData) {
  const pdfDoc = await pdfLib.PDFDocument.create()
  const width = 210;
  const height = 297;

  const page = pdfDoc.addPage([210, 297])
  const baseIndent = 20
  const lineHeight = 10
  
  let currentX = baseIndent
  let currentY = 250
  
  page.moveTo(currentX, currentY)
  page.drawText(invoiceData.title, {size: 10})
  currentY -= 2 * lineHeight
  page.moveTo(currentX, currentY)
  page.drawText(invoiceData.senderName, {size: 5})
  
  invoiceData.senderAddress.forEach(line => {
    currentY -= 0.75 * lineHeight;
    page.moveTo(currentX, currentY)
    page.drawText(line, {size: 5})
  })

  currentY -= 20
  page.moveTo(currentX, currentY)
  page.drawLine({start: {x: baseIndent, y: currentY}, end: {x: width - baseIndent, y: currentY}})

  invoiceData.items.forEach(item => {
    currentY -= 0.75 * lineHeight;
    page.moveTo(currentX, currentY)
    page.drawText(item.name, {size: 5})
    page.moveTo(currentX + 100, currentY)
    page.drawText(item.amount.toString(), {size: 5})
    page.moveTo(currentX + 150, currentY)
    page.drawText(item.price, {size: 5})
  })

  currentY -= 0.75 * lineHeight;
  page.moveTo(currentX, currentY)
  page.drawLine({start: {x: baseIndent, y: currentY}, end: {x: width - baseIndent, y: currentY}})

  const pdfBytes = await pdfDoc.save();
  return pdfBytes
};

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/test', async function(request, response) {
  response.set('Content-Type', 'application/pdf');
  response.send(Buffer.from(await generateInvoice({
    title: 'Invoice',
    senderName: "Codecool",
    senderAddress: ["Liechtensteinstraße 210", "1090 Wien"],
    recipientName: 'Student No. 1',
    recipientAddress: ['Student Street 1', '1010 Wien'],
    items: [{name: 'Fancy Coffee', amount: 10, price: '3.50'}, 
      {name: 'Fancy Pants Coffee', amount: 5, price: '100000'}],
  })));
});

function generateApiKey() {

  return '00000000000000';
}

app.get('/api-key', async function(request, response) {
  const template = await fs.readFile('templates/api-key.html', 'utf-8')
  response.send(mustache.render(template, {apiKey: null}))
})

app.post('/api-key', async function(request, response) {
  const template = await fs.readFile('templates/api-key.html', 'utf-8')
  if (request.body['all-your-data'] && request.body['all-your-data'].trim() !== '') {
    response.send(mustache.render(template, {apiKey: generateApiKey()}))
  } else {
    response.send(mustache.render(template, {error: 'Please give us all your data!'}))
  }
});

// Error handlers
app.use(function fourOhFourHandler (req, res) {
  res.status(404).send()
})
app.use(function fiveHundredHandler (err, req, res, next) {
  console.error(err)
  res.status(500).send()
})

// Start server
app.listen(8080, function (err) {
  if (err) {
    return console.error(err)
  }

  console.log('Started at http://localhost:8080')
})
