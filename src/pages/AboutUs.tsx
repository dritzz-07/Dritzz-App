import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthOverlay from '../components/AuthOverlay';
import MyBookingsModal from '../components/MyBookingsModal';
import AccountSettingsModal from '../components/AccountSettingsModal';

export default function AboutUs() {
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
          <h1 className="text-2xl md:text-3xl font-light mb-12 uppercase tracking-[0.2em] text-white/90">About Us</h1>
          <div className="space-y-8 text-neutral-400 font-light text-sm md:text-base leading-relaxed">
            <p>
              Dritzz is India's smart doorstep car wash platform designed to make vehicle cleaning easy, affordable, and convenient.
            </p>
            <p>
              We provide professional doorstep car cleaning services at homes, offices, and parking locations.
            </p>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-12 mb-4">Mission</h2>
              <p>
                To simplify car care through technology-driven and customer-friendly doorstep services across India.
              </p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-12 mb-4">Vision</h2>
              <p>
                To become India's most trusted doorstep vehicle care brand.
              </p>
            </div>
          </div>
        </main>

        <Footer />

        <AuthOverlay 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
        />
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
      </div>
    </div>
  );
}
