'use strict'
const express = require('express')
const pdfLib = require('pdf-lib')

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
  page.drawText('Invoice', {size: 10})
  currentY -= 2 * lineHeight
  page.moveTo(currentX, currentY)
  page.drawText(invoiceData.senderName, {size: 5})
  invoiceData.senderAddress.forEach(function(line) {
    currentY -= 0.75 * lineHeight;
    page.moveTo(currentX, currentY)
    page.drawText(line, {size: 5})
  })

  currentY -= 20
  page.moveTo(currentX, currentY)
  page.drawLine({start: {x: baseIndent, y: currentY }, end: {x: width - baseIndent, y: currentY}})
  

  const pdfBytes = await pdfDoc.save();
  return pdfBytes
};

app.get('/', async function(request, response) {
  response.set('Content-Type', 'application/pdf');
  response.send(Buffer.from(await generateInvoice({
    senderName: "Codecool",
    senderAddress: ["Liechtensteinstraße 210", "1090 Wien"],
  })));
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
