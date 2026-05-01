import { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

function App() {
  const [archivo, setArchivo] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const enviarCV = async () => {
    if (!archivo) {
      setError('Por favor seleccioná un archivo PDF')
      return
    }
    setCargando(true)
    setError('')
    setFeedback('')
    const formData = new FormData()
    formData.append('cv', archivo)
    try {
      const respuesta = await axios.post('http://localhost:3001/feedback', formData)
      setFeedback(respuesta.data.feedback)
    } catch (err) {
      setError('Hubo un problema al analizar el CV. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-700 mb-3">CV Feedback AI</h1>
          <p className="text-gray-500 text-lg">Subí tu CV y recibí feedback profesional al instante</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Seleccioná tu CV en PDF</label>
          <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setArchivo(e.target.files[0])}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <div className="text-5xl mb-3">📄</div>
              <p className="text-indigo-600 font-medium">Hacé clic para seleccionar</p>
              <p className="text-gray-400 text-sm mt-1">Solo archivos PDF</p>
            </label>
            {archivo && <p className="mt-3 text-green-600 font-medium">✓ {archivo.name}</p>}
          </div>

          <button
            onClick={enviarCV}
            disabled={cargando}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors text-lg"
          >
            {cargando ? '⏳ Analizando tu CV...' : ' Analizar CV'}
          </button>

          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        </div>

        {feedback && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">📋 Feedback de tu CV</h2>
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        )}

      </div>
    </div>
  )
}

export default App
  
