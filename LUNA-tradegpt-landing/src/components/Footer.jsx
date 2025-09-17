import React from 'react'
import { TrendingUp, Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react'

const Footer = () => {
  const footerLinks = {
    product: [
      { name: 'Stocks' },
      { name: 'Forex (FX)' },
      { name: 'Crypto' },
      { name: 'ETFs' },
    ],
    company: [
      { name: 'About' },
      { name: 'Support' },
      { name: 'Contact' },
      { name: 'Privacy Policy' },
      { name: 'Terms of use' },
    ],
  }

  const socialLinks = [
    { icon: Twitter, href: '#twitter', name: 'Twitter' },
    { icon: Linkedin, href: '#linkedin', name: 'LinkedIn' },
    { icon: Facebook, href: '#facebook', name: 'Facebook' },
    { icon: Instagram, href: '#instagram', name: 'Instagram' }
  ]

  return (
    <footer id="about" className="bg-dark-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl text-white">
                  <span className="font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    Trade
                  </span>
                  GPT
                </span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
                Copyright © 2025 TradeGPT. All rights reserved.
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Mail className="h-5 w-5" />
                  <span>contact@tradegpt.live</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Phone className="h-5 w-5" />
                  <span>+84 384265999</span>
                </div>
              </div>
            </div>

            {/* Links Sections */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6 text-center">Products</h3>
              <ul className="space-y-4 text-center">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-6 text-center">Company</h3>
              <ul className="space-y-4 text-center">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-12 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Stay Updated with Market Insights
              </h3>
              <p className="text-gray-400 text-lg">
                Get weekly AI-powered market analysis and investment tips delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-white/20 transition-all duration-200"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-white/10">
          <div className="text-center">
            {/* Risk Warning */}
            <div className="text-gray-400 mb-4">
              <h1 className="text-lg font-semibold mb-2">Risk Warnings and Investment Disclaimers</h1>
              <p className="text-sm leading-relaxed max-w-4xl mx-auto">
                This A.I. is continuously learning and evolving, but its insights are not financial advice. Trading carries significant risks, and past results do not guarantee future outcomes. You should carefully assess your financial situation and consult a professional before making any trading decisions.
              </p>
            </div>

          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer