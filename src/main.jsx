import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Home from './pages/Home.jsx'
import Catalog from './pages/Products.jsx'
import Orders from './pages/Orders.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'

// Protected route - redirects to login if not authenticated
function ProtectedRoute({ element }) {
  const token = localStorage.getItem('token')
  return token ? element : <Navigate to="/login" />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/products" element={<ProtectedRoute element={<Catalog />} />} />
        <Route path="/orders" element={<ProtectedRoute element={<Orders />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
