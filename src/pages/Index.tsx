import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CoursesGrid from "@/components/CoursesGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <CoursesGrid />
      <Footer />
    </div>
  );
};

export default Index;
