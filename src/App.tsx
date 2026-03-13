import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { NotificationProvider, NotificationToast } from "@/components/InAppNotifications";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";

// Lazy load non-critical routes
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const AllCourses = lazy(() => import("./pages/AllCourses"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Backoffice = lazy(() => import("./pages/Backoffice"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const StudentPayments = lazy(() => import("./pages/StudentPayments"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const QuotationPayment = lazy(() => import("./pages/QuotationPayment"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">A carregar...</p>
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <NotificationToast />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageFallback />}>
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
                <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
                <Route path="/termos-de-uso" element={<TermsOfUse />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </NotificationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
