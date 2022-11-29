const pdfLib = require('pdf-lib')

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
  
  module.exports = { generateInvoice }