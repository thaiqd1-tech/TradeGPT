import React from 'react'
import { Brain, BarChart3, Shield, Zap, TrendingUp, Target, Globe, Clock } from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze market patterns, news sentiment, and historical data to provide intelligent investment insights.',
      color: 'text-primary-400'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Market Data',
      description: 'Access live market data, price movements, and trading volumes across global exchanges with millisecond precision.',
      color: 'text-accent-400'
    },
    {
      icon: Target,
      title: 'Portfolio Optimization',
      description: 'Automatically optimize your portfolio allocation based on risk tolerance, investment goals, and market conditions.',
      color: 'text-purple-400'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Comprehensive risk assessment tools help you understand and manage potential losses before making investment decisions.',
      color: 'text-red-400'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Leverage predictive models to identify emerging trends and potential market opportunities before they become mainstream.',
      color: 'text-green-400'
    },
    {
      icon: Globe,
      title: 'Global Markets',
      description: 'Trade and analyze opportunities across international markets including stocks, forex, commodities, and cryptocurrencies.',
      color: 'text-blue-400'
    },
    {
      icon: Zap,
      title: 'Instant Alerts',
      description: 'Receive real-time notifications about market movements, news events, and trading opportunities that match your criteria.',
      color: 'text-yellow-400'
    },
    {
      icon: Clock,
      title: '24/7 Monitoring',
      description: 'Continuous market monitoring ensures you never miss important developments, even when markets are closed.',
      color: 'text-indigo-400'
    }
  ]

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-dark-900 to-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect text-sm font-medium text-white mb-6">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" />
            Powerful Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Everything You Need for
            <span className="gradient-text block">Smart Investing</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of AI-powered tools gives you the edge you need to make informed investment decisions and maximize your returns.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="feature-card group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r from-dark-800 to-dark-700 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button className="btn-primary">
            Explore All Features
          </button>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection