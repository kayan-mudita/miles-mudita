import HeroSection from "@/components/landing/HeroSection";
import TrustBar from "@/components/landing/TrustBar";
import HowItWorks from "@/components/landing/HowItWorks";
import Dimensions from "@/components/landing/Dimensions";
import WhyMiles from "@/components/landing/WhyMiles";
import FAQ from "@/components/landing/FAQ";
import CTABanner from "@/components/landing/CTABanner";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <Dimensions />
      <WhyMiles />
      <FAQ />
      <CTABanner />
    </>
  );
}
