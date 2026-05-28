import React from 'react';
import { motion } from 'motion/react';
import { CarFront, Zap, Shield, Sparkles, ChevronRight, Droplets, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MobileHome() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4 space-y-6">
      
      {/* Greeting Section */}
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-white/60 text-sm font-medium">Good Morning,</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sujit</h2>
        </motion.div>
        
        {/* Profile Avatar / Notification */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 p-0.5 border border-white/10"
        >
          <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">S</span>
          </div>
        </motion.div>
      </div>

      {/* Active Car & Subscription Card - Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-900 to-black border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -ml-16 -mb-16 pointer-events-none" />
        
        <div className="p-5 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Sparkles size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Premium Active</span>
              </div>
              <h3 className="text-xl font-bold text-white">Porsche 911</h3>
              <p className="text-white/50 text-sm">MH 43 AB 1234</p>
            </div>
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <CarFront className="text-white w-6 h-6" />
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/60 text-xs mb-1">Remaining Washes</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">3</span>
                <span className="text-white/40 text-sm">/ 4</span>
              </div>
            </div>
            <button className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-neutral-200 transition-colors">
              Book Wash
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: Droplets, label: 'Exterior', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Zap, label: 'Interior', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: Shield, label: 'Detailing', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((item, index) => (
          <button key={index} className="flex flex-col items-center justify-center bg-neutral-900/50 border border-white/5 p-4 rounded-3xl hover:bg-neutral-800 transition-colors">
            <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center mb-3`}>
              <item.icon className={item.color} size={22} />
            </div>
            <span className="text-xs font-medium text-white/80">{item.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Premium Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
        className="relative rounded-3xl overflow-hidden group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-900 z-0" />
        <img 
          src="/porsche-dritzz.jpg" 
          alt="Premium Wash" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        
        <div className="relative z-20 p-6">
          <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-3 inline-block">Upgrade</span>
          <h3 className="text-xl font-bold text-white mb-2 leading-tight">Ceramic Coating<br/>Special Offer</h3>
          <p className="text-white/60 text-sm mb-4 max-w-[200px]">Get extreme gloss and protection for 1 year.</p>
          <div className="flex items-center text-sm font-medium text-white gap-1">
            Explore Plans <ChevronRight size={16} />
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
          <button className="text-xs text-white/50 hover:text-white flex items-center gap-1">
            See all <ArrowRight size={12} />
          </button>
        </div>
        
        <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
            <Droplets className="text-white w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium text-sm">Premium Wash Completed</h4>
            <p className="text-white/50 text-xs mt-0.5">Today, 10:30 AM</p>
          </div>
          <div className="text-right">
            <div className="text-emerald-400 font-medium text-sm text-center">★ 5.0</div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
