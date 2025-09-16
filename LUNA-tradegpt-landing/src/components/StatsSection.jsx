import React from 'react'
import { TrendingUp, Users, DollarSign, Award } from 'lucide-react'

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: '50,000+',
      label: 'Active Investors',
      description: 'Trust TradeGPT for their investment decisions'
    },
    {
      icon: DollarSign,
      value: '$2.5B+',
      label: 'Assets Analyzed',
      description: 'Total portfolio value managed through our platform'
    },
    {
      icon: TrendingUp,
      value: '23.7%',
      label: 'Average Returns',
      description: 'Higher returns compared to traditional methods'
    },
    {
      icon: Award,
      value: '98.5%',
      label: 'Accuracy Rate',
      description: 'AI prediction accuracy for market movements'
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-r from-primary-900/20 to-accent-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Proven Results That
            <span className="gradient-text block">Speak for Themselves</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of successful investors who have transformed their portfolios with TradeGPT's AI-powered insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div
                key={index}
                className="text-center group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="glass-effect rounded-2xl p-8 transition-all duration-300 hover:bg-white/10 hover:scale-105">
                  <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xl font-semibold text-gray-200 mb-3">
                    {stat.label}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default StatsSection