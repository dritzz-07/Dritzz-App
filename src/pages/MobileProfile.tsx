import React from 'react';
import { motion } from 'motion/react';
import { User, Settings, Shield, HelpCircle, ChevronRight, LogOut, CarFront, MapPin, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MobileProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/');
  };

  const menuGroups = [
    {
      title: 'Account',
      items: [
        { icon: CarFront, label: 'My Vehicles', action: () => {} },
        { icon: MapPin, label: 'Saved Addresses', action: () => {} },
        { icon: CreditCard, label: 'Payment Methods', action: () => {} },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Settings, label: 'App Settings', action: () => {} },
        { icon: Shield, label: 'Privacy & Security', action: () => {} },
        { icon: HelpCircle, label: 'Help & Support', action: () => {} },
      ]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4 space-y-6">
      
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 bg-gradient-to-r from-neutral-900 to-black p-5 rounded-3xl border border-white/5"
      >
        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-2xl font-bold text-white border border-white/10">
          S
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Sujit Singh</h2>
          <p className="text-white/50 text-sm mb-2">+91 98765 43210</p>
          <span className="text-[10px] font-bold px-2 py-1 bg-white/[0.08] rounded pl-1 pr-2 text-white flex items-center gap-1 inline-flex uppercase">
             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
             Active Member
          </span>
        </div>
      </motion.div>

      <div className="space-y-6">
        {menuGroups.map((group, groupIndex) => (
          <motion.div 
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (groupIndex + 1) }}
          >
            <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 px-2">{group.title}</h3>
            <div className="bg-neutral-900/50 border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
              {group.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 text-white/80 font-medium text-sm">
                    <item.icon size={18} className="text-white/50" />
                    {item.label}
                  </div>
                  <ChevronRight size={16} className="text-white/30" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 mt-6 text-red-500 font-bold text-sm tracking-wide bg-red-500/10 rounded-2xl hover:bg-red-500/20 transition-colors"
      >
        <LogOut size={16} className="mr-1" />
        Log Out
      </motion.button>
      
    </div>
  );
}
