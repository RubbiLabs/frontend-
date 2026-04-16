"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingNavbar from "../../components/layout/LandingNavbar";
import LandingFooter from "../../components/layout/LandingFooter";
import HeroSection from "../../components/landing/Herosection";
import ServicesSection from "../../components/landing/ServicesSection";
import TestimonialsSection from "../../components/landing/TestimonialsSection";
import { useWallet } from "../../context/WalletContext";

export default function HomePage() {
  const router = useRouter();
  const { isConnected, isHydrated } = useWallet();

  useEffect(() => {
    if (!isHydrated) return;
    if (isConnected) router.replace("/dashboard");
  }, [isConnected, isHydrated, router]);

  if (!isHydrated || isConnected) return null;

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
