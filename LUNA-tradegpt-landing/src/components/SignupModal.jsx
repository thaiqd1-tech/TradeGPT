import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, MessageCircle } from 'lucide-react'

const SignupModal = ({ isOpen, onClose, title = "Start Your Free Trial", subtitle = "Create your account to access TradeGPT's powerful investment analysis" }) => {
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before using createPortal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate passwords match
    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match. Please try again.')
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Handle signup logic here
    console.log('Signup form submitted:', signupForm)
    
    setIsSubmitting(false)
    onClose()
    
    // Show success message or redirect
    alert('Account created successfully! Welcome to TradeGPT.')
    
    // Reset form
    setSignupForm({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  const handleInputChange = (field, value) => {
    setSignupForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClose = () => {
    onClose()
    // Reset form when closing
    setSignupForm({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-white/20 rounded-3xl p-8 max-w-md w-full relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400">{subtitle}</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignupSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={signupForm.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={signupForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={signupForm.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={signupForm.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Creating Account...
              </>
            ) : (
              <>
                Create Account & Start Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Terms */}
        <p className="text-gray-400 text-sm text-center mt-6">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )

  // Use createPortal to render modal outside of the component tree
  return createPortal(modalContent, document.body)
}

export default SignupModal