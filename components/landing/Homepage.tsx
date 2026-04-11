"use client";
import React from "react";
import LandingNavbar from "../../components/layout/LandingNavbar";
import LandingFooter from "../../components/layout/LandingFooter";
import HeroSection from "../../components/landing/Herosection";
import ServicesSection from "../../components/landing/ServicesSection";
import TestimonialsSection from "../../components/landing/TestimonialsSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 font-manrope overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <LandingFooter />
    </div>
  );
}
