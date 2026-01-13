import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ChaosSection from "@/components/ChaosSection";
import AITranslatorSection from "@/components/AITranslatorSection";
import PricingSection from "@/components/PricingSection";
import DigitalEmployeeSection from "@/components/DigitalEmployeeSection";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import Footer from "@/components/Footer";
import StickyWidget from "@/components/StickyWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <ChaosSection />
      <AITranslatorSection />
      <PricingSection />
      <DigitalEmployeeSection />
      <LeadCaptureForm />
      <Footer />
      <StickyWidget />
    </div>
  );
};

export default Index;
