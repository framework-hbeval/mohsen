import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import Privacy from './components/Privacy'
import Terms from './components/Terms'
import Support from './components/Support'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/privacy"  element={<Privacy />} />
        <Route path="/terms"    element={<Terms />} />
        <Route path="/support"  element={<Support />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
