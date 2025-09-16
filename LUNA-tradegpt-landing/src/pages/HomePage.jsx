import React from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import VideoShowcaseSection from '../components/VideoShowcaseSection'
import ChatSimulationSection from '../components/ChatSimulationSection'
import FeaturesSection from '../components/FeaturesSection'
import StatsSection from '../components/StatsSection'
import TestimonialsSection from '../components/TestimonialsSection'
import PricingSection from '../components/PricingSection'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <VideoShowcaseSection />
        <ChatSimulationSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage