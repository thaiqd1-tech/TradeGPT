import React, { useState, useEffect } from 'react'
import { Menu, X, TrendingUp, LogOut, Clock, Bell, Users, Trash2, Puzzle,
  Share2, Loader2, Coins, Gift, CheckCircle2, AlertCircle,
  Info, PlayCircle, Building2, ChevronDown } from 'lucide-react'
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useAuth } from '../hooks/useAuth'
import SignupModal from './SignupModal'
import LoginModal from './LoginModal'

const Header = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Demo', href: '#video-showcase', section: 'video-showcase' },
    { name: 'How It Works', href: '#chat-simulation', section: 'chat-simulation' },
    { name: 'Features', href: '#features', section: 'features' },
    { name: 'Testimonials', href: '#testimonials', section: 'testimonials' },
    { name: 'Pricing', href: '#pricing', section: 'pricing' },
    { name: 'About', href: '#about', section: 'about' }
  ]

  const handleNavClick = (href, section) => {
    // Smooth scroll to section
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSignIn = () => {
    setShowLoginModal(true)
  }

  const handleSignUp = () => {
    setShowSignupModal(true)
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-dark-900/95 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl text-white">
              <span className="font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                Trade
              </span>
              GPT
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href, item.section)}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button 
              onClick={handleSignIn}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              className="btn-primary"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-dark-800/95 backdrop-blur-lg border-t border-white/10">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    handleNavClick(item.href, item.section)
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => {
                    handleSignIn()
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    handleSignUp()
                    setIsMenuOpen(false)
                  }}
                  className="w-full btn-primary"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
      />
    </header>
  )
}

export default Header