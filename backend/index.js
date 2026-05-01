const express = require('express')
const cors = require('cors')
require('dotenv').config()
const multer = require('multer')
const PDFParser = require('pdf2json')
const Groq = require('groq-sdk')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const storage = multer.memoryStorage()
const upload = multer({ storage })

app.post('/feedback', upload.single('cv'), async (req, res) => {
  try {
    const cvTexto = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser()
      pdfParser.on('pdfParser_dataReady', (data) => {
        const texto = data.Pages.map(page =>
          page.Texts.map(t => decodeURIComponent(t.R[0].T)).join(' ')
        ).join('\n')
        resolve(texto)
      })
      pdfParser.on('pdfParser_dataError', reject)
      pdfParser.parseBuffer(req.file.buffer)
    })

    const prompt = `Eres un experto en recursos humanos y selección de personal. 
    Analiza el siguiente CV y dame feedback detallado en español sobre:
    1. Fortalezas del CV
    2. Debilidades o cosas que faltan
    3. Cómo mejorar la presentación
    4. Qué tan competitivo es para el mercado laboral tech
    
    CV:
    ${cvTexto}`

    const resultado = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    })
    const feedback = resultado.choices[0].message.content

    res.json({ feedback })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Hubo un problema al procesar el CV' })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})