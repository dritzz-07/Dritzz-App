import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthOverlay from '../components/AuthOverlay';
import MyBookingsModal from '../components/MyBookingsModal';
import AccountSettingsModal from '../components/AccountSettingsModal';

export default function TermsConditions() {
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
          <h1 className="text-2xl md:text-3xl font-light mb-12 uppercase tracking-[0.2em] text-white/90">Terms & Conditions</h1>
          <div className="space-y-6 text-neutral-400 font-light text-sm md:text-base leading-relaxed">
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-12 mb-4">Booking Terms</h2>
              <p>Creating a booking confirms a request for service. Confirmation is subject to slot availability in your area.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Vehicle Accessibility Requirements</h2>
              <p>We require reasonable access and sufficient space around your vehicle to efficiently enact our cleaning services. In accessible spaces without utility blockages, optimal services are guaranteed.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Payment Rules</h2>
              <p>Payments are completed via designated online channels integrated into our platform. Cash payments are subject to service executive verification and company protocols.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Service Scheduling Conditions</h2>
              <p>Appointments might be impacted by unforeseen traffic density or extreme weather parameters. You will be promptly informed should rescheduling map to these elements.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Liability Limitations</h2>
              <p>While our teams practice the utmost diligence, Dritzz limits liability regarding pre-existing vehicle defects, dents, or pre-worn materials exacerbated during a normal wash cycle.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Membership/Subscription Terms</h2>
              <p>Monthly subscriptions entail recurring scheduled services spanning the active billing month. Members must ensure vehicle availability as per their assigned cadence.</p>
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
