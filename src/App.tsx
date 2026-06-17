import { useState, lazy, Suspense, useEffect, Component, ReactNode } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen bg-black text-red-500 p-8 flex flex-col items-center justify-center font-mono">
          <h1 className="text-2xl font-bold mb-4">React Error</h1>
          <pre className="text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/30 whitespace-pre-wrap max-w-full overflow-hidden">
            {(this as any).state.error?.message}
{(this as any).state.error?.stack}
          </pre>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { BottomNav } from "./components/BottomNav";
import { TopNav } from "./components/TopNav";
import WelcomePage from "./pages/WelcomePage";
import SignInPage from "./pages/SignInPage";

import { useAuth } from "./context/AuthContext";
import { BookingDetails, VehicleType, Package } from "./types";
import { PACKAGES } from "./constants";
import WaterSplashEffects from "./components/WaterSplashEffects";

const HowItWorks = lazy(() => import("./components/HowItWorks"));
const Pricing = lazy(() => import("./components/Pricing"));
const BookingForm = lazy(() => import("./components/BookingForm"));
const WhyUs = lazy(() => import("./components/WhyUs"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const ShowcaseVideo = lazy(() => import("./components/ShowcaseVideo"));
const Footer = lazy(() => import("./components/Footer"));
const PaymentModal = lazy(() => import("./components/PaymentModal"));
const ProfileSetupOverlay = lazy(() => import("./components/ProfileSetupOverlay"));
const MyBookingsModal = lazy(() => import("./components/MyBookingsModal"));
const AccountSettingsModal = lazy(() => import("./components/AccountSettingsModal"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const Services = lazy(() => import("./components/Services"));

const AboutUs = lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));

import MobileHome from "./pages/MobileHome";
import MobilePlans from "./pages/MobilePlans";
import MobileBookings from "./pages/MobileBookings";
import MobileProfile from "./pages/MobileProfile";
import MobileCheckout from "./pages/MobileCheckout";

const LoadingFallback = () => (
  <div className="h-32 flex items-center justify-center text-white/50 text-sm tracking-widest uppercase">
    Loading section...
  </div>
);
const PageLoader = () => (
  <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-white/50 text-sm tracking-widest uppercase">
    Loading...
  </div>
);

// Define Tab locally for AppLayout
type TabID = "home" | "bookings" | "subscriptions" | "profile";

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<TabID>("home");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("hatchback");
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [bookingsTab, setBookingsTab] = useState<"upcoming" | "history" | "subscriptions">("upcoming");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"addresses" | "vehicles" | "invoices" | "support" | "settings">("settings");
  
  const [currentBookingDetails, setCurrentBookingDetails] = useState<BookingDetails | null>(null);
  const [currentPkg, setCurrentPkg] = useState<Package | null>(null);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    // Bypass auth for testing:
    // if (!loading && !user) {
    //   navigate("/");
    // }
  }, [user, loading, navigate]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("dritzz_theme") || "dark";
    if (savedTheme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, []);

  useEffect(() => {
    // Sync activeTab with URL if URL is /app/...
    if (location.pathname === "/app/profile") {
      setActiveTab("profile");
    } else if (location.pathname === "/app/bookings") {
      setActiveTab("bookings");
    } else if (location.pathname === "/app/subscriptions") {
      setActiveTab("subscriptions");
    } else if (location.pathname === "/app") {
      setActiveTab("home");
    }
  }, [location.pathname]);

  // Handle Tab changes
  useEffect(() => {
    // We want the native mobile experience to switch the tab directly,
    // not open the old web modals if we are on a smaller screen.
    // The inner UI takes care of rendering if screen is md:hidden.
    // However, on desktop, we might still want the modals.
    const isMobile = window.innerWidth < 768;
    
    if (!isMobile) {
      if (activeTab === "bookings") {
        setBookingsTab("upcoming");
        setIsBookingsOpen(true);
        setActiveTab("home");
      } else if (activeTab === "subscriptions") {
        setBookingsTab("subscriptions");
        setIsBookingsOpen(true);
        setActiveTab("home");
      } else if (activeTab === "profile") {
        setSettingsTab("settings");
        setIsSettingsOpen(true);
        setActiveTab("home");
      }
    } else {
      // Sync URL based on activeTab
      if (location.pathname === "/app/checkout") {
        // Do nothing with sync if on checkout
      } else if (activeTab === "home" && location.pathname !== "/app") {
        navigate("/app", { replace: true });
      } else if (activeTab !== "home" && location.pathname !== `/app/${activeTab}`) {
        // Keep search params like addVehicle=true intact
        navigate(`/app/${activeTab}${location.search}`, { replace: true });
      }
    }
  }, [activeTab]);

  const handleSelectPackage = (pkgId: string, vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    setSelectedPkgId(pkgId);
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBookingSubmit = (details: BookingDetails) => {
    const pkg = PACKAGES.find((p) => p.id === details.packageId);
    if (!pkg) return;

    let totalPrice = 0;
    if (details.vehicles && details.vehicles.length > 0) {
      details.vehicles.forEach((v) => {
        const pId = v.packageId || details.packageId || "basic";
        const p = PACKAGES.find((x) => x.id === pId) || pkg;
        totalPrice += p.price[v.type] || p.price["hatchback"];
      });
    } else {
      totalPrice = pkg.price[details.vehicleType || "hatchback"];
    }

    if (details.vehicles && details.vehicles.length >= 3) {
      totalPrice = Math.round(totalPrice * 0.8);
    }

    setCurrentBookingDetails(details);
    setCurrentPkg(pkg);
    setAmount(totalPrice);
    setIsPaymentOpen(true);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="h-[100dvh] md:h-auto md:min-h-screen w-full overflow-hidden md:overflow-x-hidden md:overflow-y-auto bg-[#0A0A0C] text-white selection:bg-white selection:text-black relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vh] bg-[radial-gradient(circle_at_center,_rgba(25,35,65,0.4),_transparent_60%)]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vh] bg-[radial-gradient(circle_at_center,_rgba(30,45,95,0.5),_transparent_70%)]" />
      </div>
      
      <div className="relative z-10 w-full h-full flex flex-col md:block">
        <WaterSplashEffects />
        
        {/* Replace normal Navbar with TopNav for mobile-feel */}
        {location.pathname !== "/app/checkout" && (
          <div className="md:hidden shrink-0">
            <TopNav />
          </div>
        )}
        <div className="hidden md:block">
          <Navbar
            openLogin={() => {}}
            openBookings={(tab = "upcoming") => {
              setBookingsTab(tab);
              setIsBookingsOpen(true);
            }}
            openSettings={(tab = "settings") => {
              setSettingsTab(tab);
              setIsSettingsOpen(true);
            }}
          />
        </div>

        {/* Mobile View Content */}
        <main className="relative z-10 md:hidden flex-1 overflow-hidden flex flex-col">
          {location.pathname === "/app/checkout" ? (
            <MobileCheckout />
          ) : (
            <>
              {activeTab === "home" && <MobileHome />}
              {activeTab === "subscriptions" && <MobilePlans />}
              {activeTab === "bookings" && <MobileBookings />}
              {activeTab === "profile" && <MobileProfile />}
            </>
          )}
        </main>

        {/* Desktop View Content (Legacy Web) */}
        <main className="relative z-10 hidden md:block">
          <Hero />
          <Suspense fallback={<LoadingFallback />}>
            <ShowcaseVideo />
            <HowItWorks />
            <Services />
            <Pricing onSelectPackage={handleSelectPackage} />
            <BookingForm
              initialVehicle={selectedVehicle}
              initialPackageId={selectedPkgId}
              onSubmit={handleBookingSubmit}
              onRequireAuth={() => { navigate("/"); }}
            />
            <WhyUs />
            <Testimonials />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <div className="hidden md:block">
            <Footer />
          </div>

          <ProfileSetupOverlay />

          <MyBookingsModal
            isOpen={isBookingsOpen}
            onClose={() => setIsBookingsOpen(false)}
            initialTab={bookingsTab}
          />

          <AccountSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            initialTab={settingsTab}
          />

          <PaymentModal
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            bookingDetails={currentBookingDetails}
            pkg={currentPkg}
            amount={amount}
          />
        </Suspense>

        {location.pathname !== "/app/checkout" && (
          <div className="md:hidden">
            <BottomNav activeTab={activeTab as any} setActiveTab={setActiveTab as any} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/app/*" element={<AppLayout />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
