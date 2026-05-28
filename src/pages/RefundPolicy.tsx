import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthOverlay from '../components/AuthOverlay';
import MyBookingsModal from '../components/MyBookingsModal';
import AccountSettingsModal from '../components/AccountSettingsModal';

export default function RefundPolicy() {
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
          <h1 className="text-2xl md:text-3xl font-light mb-12 uppercase tracking-[0.2em] text-white/90">Refund & Cancellation Policy</h1>
          <div className="space-y-6 text-neutral-400 font-light text-sm md:text-base leading-relaxed">
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-12 mb-4">Booking Cancellation</h2>
              <p>Booking cancellations are allowed up to 1 hour before the scheduled timeframe. Upon compliant cancellation, your original booking value will be reimbursed entirely.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Refund Processing timeline</h2>
              <p>For fully documented refunds, returning your funds to the originating payment module typically processes within 5–7 business days dependent on banking procedures.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Subscription Plan Terms</h2>
              <p>Due to pre-reserved allocation of logistics, subscription plans are generally non-refundable once initiated. Modifications to scheduling can, however, be negotiated with our support elements.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Failed Payment Resolution</h2>
              <p>In events where payment is debited against a failed booking loop, support assistance will instantly escalate the reconciliation mechanism. Reach out via Email or our helpline directly.</p>
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
