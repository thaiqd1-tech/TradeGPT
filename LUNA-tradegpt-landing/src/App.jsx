import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/features" element={<HomePage />} />
          <Route path="/pricing" element={<HomePage />} />
          <Route path="/about" element={<HomePage />} />
          <Route path="/contact" element={<HomePage />} />
          <Route path="/demo" element={<HomePage />} />
          <Route path="/trial" element={<HomePage />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App