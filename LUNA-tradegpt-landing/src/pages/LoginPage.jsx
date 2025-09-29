import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoginModal from '../components/LoginModal'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setOpen(true)
  }, [])

  const handleClose = () => {
    setOpen(false)
    const from = location.state && location.state.from ? location.state.from.pathname || '/' : '/'
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
      <LoginModal isOpen={open} onClose={handleClose} onSwitchToSignup={() => { /* no-op here; header handles signup */ }} />
    </div>
  )
}

export default LoginPage


