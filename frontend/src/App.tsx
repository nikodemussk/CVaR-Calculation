// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'
import { CVarSimulation } from './cvar-simulation/CVarSimulation'
import { RiskCockpit } from './risk-cockpit/RiskCockpit'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RiskCockpit />} />
        <Route path="/simulation" element={<CVarSimulation />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
