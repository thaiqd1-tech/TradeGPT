import React, { useState } from 'react'
import { ArrowRight, Play, BarChart3, TrendingUp, Zap } from 'lucide-react'
import SignupModal from './SignupModal'
import AssetsSection from './AssetsSection'

const HeroSection = () => {
  const [showSignupModal, setShowSignupModal] = useState(false)

  const scrollToVideoShowcase = () => {
    const videoSection = document.getElementById('video-showcase')
    if (videoSection) {
      videoSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 floating-animation">
        <div className="glass-effect p-4 rounded-2xl">
          <BarChart3 className="h-8 w-8 text-primary-400" />
        </div>
      </div>
      <div className="absolute top-40 right-20 floating-animation" style={{ animationDelay: '1s' }}>
        <div className="glass-effect p-4 rounded-2xl">
          <TrendingUp className="h-8 w-8 text-accent-400" />
        </div>
      </div>
      <div className="absolute bottom-40 left-20 floating-animation" style={{ animationDelay: '2s' }}>
        <div className="glass-effect p-4 rounded-2xl">
          <Zap className="h-8 w-8 text-yellow-400" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Badge */}
          <h1>
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect text-sm font-medium text-white mb-8">
              <Zap className="h-4 w-4 mr-2 text-yellow-400" />
              AI powered Trading Analysis
            </div>
          </h1>


          {/* Main Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">

            <span className="gradient-text block">STOP GAMBLING</span>
            On The Market
          </h2>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
          Use TradeGPT to get real-time market insights, intelligent portfolio recommendations, and data-driven investment decisions powered by advanced AI algorithms.          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button
              className="btn-primary flex items-center group"
              onClick={() => setShowSignupModal(true)}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              className="btn-secondary flex items-center group"
              onClick={scrollToVideoShowcase}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="animate-slide-up">
            <p className="text-gray-400 text-sm mb-8">Trusted by 50,000+ investors worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              <div className="text-white font-semibold text-lg">Bloomberg</div>
              <div className="text-white font-semibold text-lg">Reuters</div>
              <div className="text-white font-semibold text-lg">Yahoo Finance</div>
              <div className="text-white font-semibold text-lg">MarketWatch</div>
              <div className="text-white font-semibold text-lg">CNBC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent">
        <AssetsSection />
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        title="Start Your Free Trial"
        subtitle="Transform your investment strategy with AI-powered insights. Get started in minutes!"
      />
    </section>
  )
}

export default HeroSection