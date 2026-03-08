import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CourseDetail from "./pages/CourseDetail";
import AllCourses from "./pages/AllCourses";
import AdminLogin from "./pages/AdminLogin";
import Backoffice from "./pages/Backoffice";
import AboutUs from "./pages/AboutUs";
import StudentPayments from "./pages/StudentPayments";
import VerifyCertificate from "./pages/VerifyCertificate";
import QuotationPayment from "./pages/QuotationPayment";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cursos" element={<AllCourses />} />
          <Route path="/curso/:id" element={<CourseDetail />} />
          <Route path="/sobre" element={<AboutUs />} />
          <Route path="/pagamentos/:enrollmentId" element={<StudentPayments />} />
          <Route path="/verificar-certificado" element={<VerifyCertificate />} />
          <Route path="/cotacao/:quotationId" element={<QuotationPayment />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/backoffice" element={<Backoffice />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
