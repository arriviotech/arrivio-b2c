import React from 'react';
import SEO from '../components/common/SEO';
import HeroSection from '../components/landing/HeroSection';
import VisionSection from '../components/landing/VisionSection';
import CommunityBanner from '../components/landing/CommunityBanner';
import JourneySection from '../components/landing/JourneySection';
import WhoWeServeSection from '../components/landing/WhoWeServeSection';
import PricingTiersSection from '../components/landing/PricingTiersSection';
import LocationsSection from '../components/landing/LocationsSection';
import FAQSection from '../components/landing/FAQSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <SEO path="/" />
      {/* 1. Hero & Vision */}
      <HeroSection />
      <VisionSection />

      {/* 2. Community & Journey */}
      <CommunityBanner />
      <JourneySection />

      {/* 3. Personas & Pricing */}
      <WhoWeServeSection />
      <PricingTiersSection />

      {/* 4. Social Proof & Objections */}
      {/* ADDED ID HERE for Navbar scrolling */}
      <div id="stories">
        <TestimonialsSection />
      </div>

      {/* FAQSection has internal id="faq" */}
      <FAQSection />

      {/* 5. Locations & Footer */}
      <LocationsSection />
    </div>
  );
};

export default Landing;
