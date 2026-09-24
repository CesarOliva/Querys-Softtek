import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Tienda from './Pages/Tienda'
import Dashboard from './Pages/Dashboard'
import Store from './Pages/Store'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/tienda" replace />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/servicios" element={<Dashboard />} />
          <Route path="/clientes" element={<Store />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App