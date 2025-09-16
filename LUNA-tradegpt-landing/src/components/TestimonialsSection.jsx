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
    <section id="testimonials" className="py-24 bg-gradient-to-b from-dark-800 to-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect text-sm font-medium text-white mb-6">
            <Star className="h-4 w-4 mr-2 text-yellow-400" />
            Client Success Stories
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Trusted by Industry
            <span className="gradient-text block">Leaders Worldwide</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See what top investment professionals are saying about TradeGPT's impact on their success.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="feature-card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <div className="flex justify-between items-start mb-6">
                <Quote className="h-8 w-8 text-primary-400 opacity-50" />
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-300 mb-8 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="text-white font-semibold">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {testimonial.role}
                  </div>
                  <div className="text-primary-400 text-sm font-medium">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 text-center">
          <div className="glass-effect rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
                <div className="text-gray-300">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                <div className="text-gray-300">Reviews</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">99%</div>
                <div className="text-gray-300">Would Recommend</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection