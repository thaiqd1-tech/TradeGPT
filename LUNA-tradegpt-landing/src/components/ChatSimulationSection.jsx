import React, { useState, useEffect } from 'react'
import { Send, MessageCircle, TrendingUp, DollarSign, Bitcoin, PieChart, Sparkles, ArrowRight } from 'lucide-react'
import SignupModal from './SignupModal'

const ChatSimulationSection = () => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  const marketPrompts = [
    {
      id: 'stock',
      icon: TrendingUp,
      iconColor: 'text-blue-400',
      bgGradient: 'from-blue-500/10 to-indigo-500/10',
      borderColor: 'border-blue-500/20',
      market: 'Stock Market',
      prompt: 'Analyze Apple (AAPL) stock performance and predict next quarter trends based on recent earnings and market sentiment',
      category: 'Stocks'
    },
    {
      id: 'forex',
      icon: DollarSign,
      iconColor: 'text-green-400',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/20',
      market: 'Forex',
      prompt: 'Evaluate EUR/USD currency pair movements considering Federal Reserve policy changes and European economic indicators',
      category: 'Forex'
    },
    {
      id: 'crypto',
      icon: Bitcoin,
      iconColor: 'text-orange-400',
      bgGradient: 'from-orange-500/10 to-yellow-500/10',
      borderColor: 'border-orange-500/20',
      market: 'Cryptocurrency',
      prompt: 'Assess Bitcoin price volatility and institutional adoption impact on long-term investment strategies',
      category: 'Crypto'
    },
    {
      id: 'etfs',
      icon: PieChart,
      iconColor: 'text-purple-400',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/20',
      market: 'ETFs',
      prompt: 'Compare S&P 500 ETF performance against emerging market ETFs for diversified portfolio optimization',
      category: 'ETFs'
    }
  ]

  // Auto-rotate prompts every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % marketPrompts.length)
        setIsAnimating(false)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [marketPrompts.length])

const handleSendPrompt = () => {
    setShowSignupModal(true)
  }

  const currentPrompt = marketPrompts[currentPromptIndex]
  const IconComponent = currentPrompt.icon

  return (
    <section className="py-24 bg-gradient-to-b from-dark-800 to-dark-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-10 floating-animation">
        <div className="glass-effect p-3 rounded-xl">
          <MessageCircle className="h-6 w-6 text-primary-400" />
        </div>
      </div>
      <div className="absolute bottom-20 left-10 floating-animation" style={{ animationDelay: '2s' }}>
        <div className="glass-effect p-3 rounded-xl">
          <Sparkles className="h-6 w-6 text-accent-400" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect text-sm font-medium text-white mb-6">
            <MessageCircle className="h-4 w-4 mr-2 text-primary-400" />
            AI Chat Interface
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Analyse All World Market Data
            <span className="gradient-text block">with AI-Powered Insights</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Experience our intelligent chat interface that provides real-time analysis across stocks, forex, crypto, and ETFs with natural language processing.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl">
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-3 rounded-xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">TradeGPT AI Assistant</h3>
                  <p className="text-gray-400">Ready to analyze global markets</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Online</span>
              </div>
            </div>

            {/* Market Categories */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {marketPrompts.map((market, index) => {
                const MarketIcon = market.icon
                const isActive = index === currentPromptIndex
                
                return (
                  <div
                    key={market.id}
                    className={`relative p-4 rounded-2xl border transition-all duration-500 cursor-pointer group ${
                      isActive 
                        ? `bg-gradient-to-br ${market.bgGradient} ${market.borderColor} border-opacity-50 scale-105` 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                    onClick={() => setCurrentPromptIndex(index)}
                  >
                    <div className="text-center">
                      <div className={`inline-flex p-3 rounded-xl mb-3 transition-all duration-300 ${
                        isActive ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/20'
                      }`}>
                        <MarketIcon className={`h-6 w-6 ${isActive ? market.iconColor : 'text-gray-400'}`} />
                      </div>
                      <h4 className={`font-semibold transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`}>
                        {market.category}
                      </h4>
                    </div>
                    
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl opacity-60 -z-10"></div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Chat Input Area */}
            <div className="relative">
              <div className={`bg-gradient-to-br ${currentPrompt.bgGradient} border ${currentPrompt.borderColor} rounded-2xl p-6 transition-all duration-500 ${
                isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
              }`}>
                {/* Market Badge */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <IconComponent className={`h-5 w-5 ${currentPrompt.iconColor}`} />
                  </div>
                  <span className="text-white font-semibold">{currentPrompt.market} Analysis</span>
                </div>

                {/* Prompt Text */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <p className="text-white text-lg leading-relaxed">
                      {currentPrompt.prompt}
                    </p>
                  </div>
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSendPrompt}
                    className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl group flex-shrink-0"
                  >
                    <Send className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Typing Indicator */}
                <div className="flex items-center space-x-2 mt-4 opacity-60">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-white text-sm">AI is analyzing market data...</span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {marketPrompts.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                      index === currentPromptIndex 
                        ? 'bg-primary-500 scale-125' 
                        : 'bg-white/20 hover:bg-white/40'
                    }`}
                    onClick={() => setCurrentPromptIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Features Highlight */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-4 rounded-2xl mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-400 mx-auto" />
                </div>
                <h4 className="text-white font-semibold mb-2">Real-Time Analysis</h4>
                <p className="text-gray-400 text-sm">Get instant insights from live market data across all asset classes</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 p-4 rounded-2xl mb-4">
                  <MessageCircle className="h-8 w-8 text-green-400 mx-auto" />
                </div>
                <h4 className="text-white font-semibold mb-2">Natural Language</h4>
                <p className="text-gray-400 text-sm">Ask questions in plain English and get comprehensive answers</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 p-4 rounded-2xl mb-4">
                  <Sparkles className="h-8 w-8 text-purple-400 mx-auto" />
                </div>
                <h4 className="text-white font-semibold mb-2">AI-Powered</h4>
                <p className="text-gray-400 text-sm">Advanced machine learning algorithms for accurate predictions</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="glass-effect rounded-3xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Analyzing Markets?
            </h3>
            <p className="text-gray-300 mb-8">
              Join thousands of investors using AI to make smarter investment decisions.
            </p>
            <button 
              onClick={() => setShowSignupModal(true)}
              className="btn-primary flex items-center mx-auto group"
            >
              Try AI Analysis Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

{/* Signup Modal */}
      <SignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        title="Start Your AI Analysis"
        subtitle="Create your account to access TradeGPT's powerful market analysis"
      />
    </section>
  )
}

export default ChatSimulationSection