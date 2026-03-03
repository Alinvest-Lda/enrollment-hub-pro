import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CoursesGrid from "@/components/CoursesGrid";
import TrainingRequestSection from "@/components/TrainingRequestSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <CoursesGrid />
      <TrainingRequestSection />
      <Footer />
    </div>
  );
};

export default Index;
