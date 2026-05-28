import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthOverlay from '../components/AuthOverlay';
import MyBookingsModal from '../components/MyBookingsModal';
import AccountSettingsModal from '../components/AccountSettingsModal';

export default function PrivacyPolicy() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [bookingsTab, setBookingsTab] = useState<'upcoming' | 'history' | 'subscriptions'>('upcoming');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'addresses' | 'vehicles' | 'invoices' | 'support' | 'settings'>('settings');

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white selection:bg-white selection:text-black relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vh] bg-[radial-gradient(circle_at_center,_rgba(25,35,65,0.4),_transparent_60%)]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vh] bg-[radial-gradient(circle_at_center,_rgba(30,45,95,0.5),_transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col min-h-screen">
        <Navbar 
          openLogin={() => { setIsAuthOpen(true); }} 
          openBookings={(tab = 'upcoming') => { setBookingsTab(tab); setIsBookingsOpen(true); }}
          openSettings={(tab = 'settings') => { setSettingsTab(tab); setIsSettingsOpen(true); }}
        />
        
        <main className="flex-grow pt-40 md:pt-48 pb-20 px-4 md:px-8 max-w-3xl mx-auto w-full">
          <h1 className="text-2xl md:text-3xl font-light mb-12 uppercase tracking-[0.2em] text-white/90">Privacy Policy</h1>
          <div className="space-y-6 text-neutral-400 font-light text-sm md:text-base leading-relaxed">
            <p>At Dritzz, we prioritize the protection of your personal information and privacy.</p>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-12 mb-4">Customer Data Collection</h2>
              <p>We collect essential information such as your name, email address, and service locations to provide a seamless scheduling and service execution experience.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Phone OTP Authentication</h2>
              <p>For secure access to your account and to verify service addresses, we utilize Phone OTP authentication.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Vehicle and Booking Details</h2>
              <p>We securely store your vehicle models and historical booking details to refine your experience and offer custom tailored packages.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Payment Processing Information</h2>
              <p>Payments are processed over a secure gateway (Razorpay). Dritzz does not persist your sensitive financial data intrinsically on our servers.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">WhatsApp/SMS Notifications</h2>
              <p>By using the platform you opt-in to SMS/WhatsApp updates concerning your booking status, arrivals, or promotional offers.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">User Data Protection</h2>
              <p>Your data is insulated using standard security practices to prevent unauthorized access.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Third-Party Services Usage</h2>
              <p>We may collaborate with analytics and payment processing third parties. They are obligated to protect data shared for processing purposes.</p>
            </div>
          </div>
        </main>

        <Footer />

        <AuthOverlay isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <MyBookingsModal isOpen={isBookingsOpen} onClose={() => setIsBookingsOpen(false)} initialTab={bookingsTab} />
        <AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} initialTab={settingsTab} />
      </div>
    </div>
  );
}
