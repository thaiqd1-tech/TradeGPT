import React from 'react'
import { Star, Quote } from 'lucide-react'

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Portfolio Manager',
      company: 'Goldman Sachs',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'TradeGPT has revolutionized how I analyze market opportunities. The AI insights have helped me achieve 35% better returns for my clients.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Investment Advisor',
      company: 'Morgan Stanley',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'The predictive analytics are incredibly accurate. I\'ve been able to identify market trends weeks before they become apparent to others.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Hedge Fund Manager',
      company: 'Bridgewater Associates',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'The risk management tools are exceptional. TradeGPT helps me maintain optimal portfolio balance while maximizing returns.',
      rating: 5
    },
    {
      name: 'David Park',
      role: 'Quantitative Analyst',
      company: 'Renaissance Technologies',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      content: 'As a quant, I appreciate the sophisticated algorithms. The platform provides insights that complement our internal models perfectly.',
      rating: 5
    },
    {
      name: 'Lisa Thompson',
      role: 'Private Wealth Manager',
      company: 'UBS',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      content: 'My high-net-worth clients love the detailed analysis reports. TradeGPT has become an essential part of my investment process.',
      rating: 5
    },
    {
      name: 'James Wilson',
      role: 'Trading Director',
      company: 'JPMorgan Chase',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      content: 'The real-time alerts have saved me from significant losses multiple times. The AI truly understands market dynamics.',
      rating: 5
    }
  ]

  return (
    <section id="testimonials" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-dark-800 to-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect text-sm font-medium text-white mb-4 sm:mb-6">
            <Star className="h-4 w-4 mr-2 text-yellow-400" />
            Client Success Stories
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Trusted by Industry
            <span className="gradient-text block">Leaders Worldwide</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            See what top investment professionals are saying about TradeGPT's impact on their success.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="feature-card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-primary-400 opacity-50" />
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-300 mb-6 sm:mb-8 leading-relaxed italic text-sm sm:text-base">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                />
                <div>
                  <div className="text-white font-semibold text-sm sm:text-base">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {testimonial.role}
                  </div>
                  <div className="text-primary-400 text-xs sm:text-sm font-medium">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <div className="glass-effect rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">4.9/5</div>
                <div className="text-gray-300 text-sm sm:text-base">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">10,000+</div>
                <div className="text-gray-300 text-sm sm:text-base">Reviews</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">99%</div>
                <div className="text-gray-300 text-sm sm:text-base">Would Recommend</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection