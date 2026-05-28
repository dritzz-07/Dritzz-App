import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthOverlay from '../components/AuthOverlay';
import MyBookingsModal from '../components/MyBookingsModal';
import AccountSettingsModal from '../components/AccountSettingsModal';
import { Mail, Phone, Clock, Globe, MessageCircle } from 'lucide-react';

export default function ContactUs() {
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
        
        <main className="flex-grow pt-40 md:pt-48 pb-20 px-4 md:px-8 max-w-4xl mx-auto w-full">
          <h1 className="text-2xl md:text-3xl font-light mb-12 uppercase tracking-[0.2em] text-white/90 text-center">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <a href="https://wa.me/917075504625" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 hover:border-green-500/60 backdrop-blur-md p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 bg-green-500/20 group-hover:bg-green-500/30 rounded-full flex items-center justify-center mb-6 transition-colors relative z-10">
                <MessageCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white relative z-10">Instant Support</h3>
              <p className="text-green-400 font-bold bg-green-500/10 px-5 py-2 rounded-full relative z-10 text-xs tracking-widest uppercase border border-green-500/20 group-hover:border-green-500/40 transition-colors">Tap to chat on WhatsApp</p>
            </a>

            <a href="tel:+917075504625" className="bg-black/40 border border-white/10 hover:border-white/30 backdrop-blur-md p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-all group">
              <div className="w-16 h-16 bg-white/5 group-hover:bg-white/10 rounded-full flex items-center justify-center mb-6 transition-colors">
                <Phone className="w-8 h-8 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-neutral-400 font-mono">+91 7075504625</p>
            </a>

            <a href="mailto:dritzz.info@gmail.com" className="bg-black/40 border border-white/10 hover:border-white/30 backdrop-blur-md p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-all group">
              <div className="w-16 h-16 bg-white/5 group-hover:bg-white/10 rounded-full flex items-center justify-center mb-6 transition-colors">
                <Mail className="w-8 h-8 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-neutral-400">dritzz.info@gmail.com</p>
            </a>

            <a href="https://dritzz.com" target="_blank" rel="noopener noreferrer" className="bg-black/40 border border-white/10 hover:border-white/30 backdrop-blur-md p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-all group">
              <div className="w-16 h-16 bg-white/5 group-hover:bg-white/10 rounded-full flex items-center justify-center mb-6 transition-colors">
                <Globe className="w-8 h-8 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Website</h3>
              <p className="text-neutral-400">https://dritzz.com</p>
            </a>

            <div className="bg-black/40 border border-white/10 backdrop-blur-md p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Support Hours</h3>
              <p className="text-neutral-400">Monday–Sunday<br/>8 AM – 8 PM</p>
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
