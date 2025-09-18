import React, { useState } from 'react'
import { Check, Star, Zap, Users, Building, ArrowRight, Shield, Clock, TrendingUp } from 'lucide-react'
import SignupModal from './SignupModal'

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [hoveredPlan, setHoveredPlan] = useState(null)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const pricingPlans = [
    {
      id: 'grow',
      name: 'Grow',
      subtitle: 'Ideal for personal projects',
      price: billingCycle === 'monthly' ? 79 : 790,
      originalPrice: billingCycle === 'monthly' ? 99 : 990,
      assets: '28 Markets',
      tokens: '800 Tokens',
      icon: TrendingUp,
      iconColor: 'text-green-400',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/20',
      buttonStyle: 'bg-green-500 hover:bg-green-600',
      features: [
        '99.95% SLA',
        'Email support',
        'Max 1 question/ min',
        'News Analysis',
        '2 schedule reports'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'Perfect for teams',
      price: billingCycle === 'monthly' ? 229 : 2290,
      originalPrice: billingCycle === 'monthly' ? 299 : 2990,
      assets: '80 Markets',
      tokens: '2500 token',
      icon: Users,
      iconColor: 'text-primary-400',
      bgGradient: 'from-primary-500/10 to-blue-500/10',
      borderColor: 'border-primary-500/20',
      buttonStyle: 'bg-primary-500 hover:bg-primary-600',
      isPopular: true,
      features: [
        'Everything from Grow',
        'Max 5 questions/ min',
        'Market movers analytics',
        '5 schedule reports'
      ]
    },
    {
      id: 'ultra',
      name: 'Ultra',
      subtitle: 'Best value for larger teams',
      price: billingCycle === 'monthly' ? 999 : 9990,
      originalPrice: billingCycle === 'monthly' ? 1299 : 12990,
      assets: '213 Markets around the world',
      tokens: '15000 token',
      icon: Building,
      iconColor: 'text-purple-400',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/20',
      buttonStyle: 'bg-purple-500 hover:bg-purple-600',
      features: [
        'Everything from Pro',
        'Unlimited question/ min',
        'Unlimited schedule reports'
      ]
    }
  ]

const handlePlanSelect = (planId) => {
    // Handle plan selection
    console.log(`Selected plan: ${planId}`)
    const plan = pricingPlans.find(p => p.id === planId)
    setSelectedPlan(plan)
    setShowSignupModal(true)
  }

  const scrollToVideoDemo = () => {
    const videoSection = document.getElementById('video-showcase')
    if (videoSection) {
      videoSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-dark-800 to-dark-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect text-sm font-medium text-white mb-4 sm:mb-6">
            <Star className="h-4 w-4 mr-2 text-yellow-400" />
            Flexible Pricing Plans
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Choose the Perfect Plan
            <span className="gradient-text block">for Your AI Trading Analysis Journey</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
            Scale your investment analysis with our flexible pricing options. From personal projects to enterprise solutions.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="glass-effect rounded-xl p-1 flex items-center">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {pricingPlans.map((plan, index) => {
            const IconComponent = plan.icon
            const isHovered = hoveredPlan === plan.id
            
            return (
              <div
                key={plan.id}
                className={`relative group animate-slide-up ${
                  plan.isPopular ? 'lg:scale-105 lg:-mt-4' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className={`relative h-full bg-gradient-to-br ${plan.bgGradient} backdrop-blur-sm border ${plan.borderColor} rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 transition-all duration-500 hover:border-opacity-40 hover:scale-105 hover:shadow-2xl flex flex-col ${
                  plan.isPopular ? 'border-primary-500/30 shadow-xl' : ''
                } ${isHovered ? 'transform scale-105' : ''}`}>
                  
                  {/* Plan Header */}
                  <div className="text-center mb-6 sm:mb-8">
                    <div className={`inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-dark-800 to-dark-700 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${plan.iconColor}`} />
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm sm:text-lg mb-4 sm:mb-6">{plan.subtitle}</p>
                    
                    {/* Price */}
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-gray-400 line-through text-sm sm:text-lg">
                          ${plan.originalPrice}
                        </span>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400 ml-2 text-sm sm:text-base">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                    </div>

                    {/* Assets & Tokens */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                      <div className="glass-effect px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                        <span className="text-white font-semibold text-sm sm:text-base">{plan.assets}</span>
                      </div>
                      <div className="glass-effect px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                        <span className="text-white font-semibold text-sm sm:text-base">{plan.tokens}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features List - Flexible height */}
                  <div className="flex-1 space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2 sm:space-x-3">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 leading-relaxed text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Section - Fixed at bottom */}
                  <div className="mt-auto">
                    {/* CTA Button */}
                    <button
                      onClick={() => {
                        setSelectedPlan({ name: 'Enterprise', subtitle: 'Custom solution for your business' })
                        setShowSignupModal(true)
                      }}
                      className={`w-full ${plan.buttonStyle} text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group mb-3 sm:mb-4 text-sm sm:text-base`}
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Additional Info */}
                    <div className="text-center">
                      <p className="text-gray-400 text-xs sm:text-sm">
                        14-day free trial • No credit card required
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Enterprise Section */}
        <div className="text-center">
          <div className="glass-effect rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <Building className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Need Something More?
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              For enterprise customers with custom requirements, we offer tailored solutions with dedicated support, custom integrations, and flexible pricing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <button 
                onClick={scrollToVideoDemo}
                className="btn-primary flex items-center group w-full sm:w-auto"
              >
                Watch Demo
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onClick={() => {
                  setSelectedPlan({ name: 'Enterprise', subtitle: 'Custom solution for your business' })
                  setShowSignupModal(true)
                }}
                className="btn-secondary w-full sm:w-auto"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              <span className="text-gray-300 text-sm sm:text-base">Enterprise Security</span>
            </div>
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              <span className="text-gray-300 text-sm sm:text-base">99.95% Uptime SLA</span>
            </div>
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              <span className="text-gray-300 text-sm sm:text-base">24/7 Priority Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal 
        isOpen={showSignupModal}
        onClose={() => {
          setShowSignupModal(false)
          setSelectedPlan(null)
        }}
        title={selectedPlan ? `Start ${selectedPlan.name} Plan` : "Start Your Free Trial"}
        subtitle={selectedPlan ? `Get started with ${selectedPlan.name} - ${selectedPlan.subtitle}` : "Choose your perfect plan and start transforming your investment strategy"}
      />
    </section>
  )
}

export default PricingSection