import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CoursesGrid from "@/components/CoursesGrid";
import PartnersSection from "@/components/PartnersSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import TrainingRequestSection from "@/components/TrainingRequestSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      <Navbar />
      <HeroSection />
      <CoursesGrid />
      <PartnersSection />
      <TestimonialsSection />
      <FAQSection />
      <TrainingRequestSection />
      <Footer />
    </div>
  );
};

export default Index;
