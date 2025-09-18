import React, { useState } from 'react'
import { ArrowRight, CheckCircle, Zap } from 'lucide-react'
import SignupModal from './SignupModal'

const CTASection = () => {
  const [showSignupModal, setShowSignupModal] = useState(false)
  const benefits = [
    'Cancel anytime',
    '24/7 customer support',
    'Money-back guarantee'
  ]

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
    <section id="cta" className="py-24 bg-gradient-to-r from-primary-900 to-accent-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect text-sm font-medium text-white mb-8">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" />
            Limited Time Offer
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Can’t find your 
            <span className="block text-yellow-400">Desired plan?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            We give you 100 tokens for FREE, you can Start a Free Account and pay as you go if you want.
          </p>

          {/* Benefits List */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 max-w-2xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-white"
              >
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-lg font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <button
              className="bg-white text-primary-900 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center group"
              onClick={() => setShowSignupModal(true)}
            >
              Start Your Free Trial
              <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              className="btn-secondary text-lg py-4 px-10"
              onClick={scrollToVideoShowcase}
            >
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-gray-300 text-lg mb-4">
              Trusted by 50,000+ investors • $2.5B+ in assets analyzed
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                ))}
              </div>
              <span className="text-white font-semibold ml-2">4.9/5 from 10,000+ reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        title="Start Your Free Trial Today"
        subtitle="Join thousands of successful investors. Create your account and transform your investment strategy now!"
      />
    </section>
  )
}

export default CTASection