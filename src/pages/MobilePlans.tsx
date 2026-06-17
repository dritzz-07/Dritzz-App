import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, CheckCircle2, Shield, Zap, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

type VehicleCategory = "HATCHBACK" | "SEDAN" | "SUV / MUV";

export default function MobilePlans() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState('');
  const [activeCategory, setActiveCategory] = useState<VehicleCategory>("HATCHBACK");
  
  const pricing = {
    "HATCHBACK": { basic: 499, premium: 699, monthly: 1999 },
    "SEDAN":     { basic: 499, premium: 699, monthly: 1999 },
    "SUV / MUV": { basic: 599, premium: 799, monthly: 2499 },
  };

  const getPlans = (category: VehicleCategory) => [
    {
      id: 'basic',
      name: 'DRITZZ BASIC',
      tag: '',
      price: `₹${pricing[category].basic}`,
      duration: 'per wash',
      color: 'from-neutral-900 to-black',
      border: 'border-white/5',
      icon: Zap,
      iconColor: 'text-white/70',
      features: ['Exterior Foam Wash', 'Tyre Cleaning & Shine', 'Doorstep Service'],
      buttonText: 'BOOK NOW'
    },
    {
      id: 'monthly',
      name: 'DRITZZ MONTHLY SERVICE',
      subtitle: '3 washes monthly + 1 exterior',
      tag: 'MOST POPULAR',
      price: `₹${pricing[category].monthly}`,
      duration: 'per month',
      color: 'from-zinc-800 via-neutral-900 to-black',
      border: 'border-white/20',
      shadow: 'shadow-[0_0_30px_rgba(255,255,255,0.15)]',
      icon: Shield,
      iconColor: 'text-white',
      features: ['3 Washes Monthly + 1 Exterior Wash', 'Thorough Interior Vacuum', 'Dashboard Cleaning', 'Tyre Polish & Shine', 'Priority Scheduling'],
      highlightText: 'Save Up To ₹1,500+ Monthly',
      buttonText: 'GET MEMBERSHIP',
      isPopular: true
    },
    {
      id: 'premium',
      name: 'DRITZZ PREMIUM',
      tag: 'BEST SELLER',
      price: `₹${pricing[category].premium}`,
      duration: 'per wash',
      color: 'from-neutral-900 to-black',
      border: 'border-white/10',
      icon: Star,
      iconColor: 'text-amber-400',
      features: ['Exterior Foam Wash', 'Interior vacuuming', 'Dashboard & Console detailing', 'Tyre Cleaning & Polish', 'Doorstep Service'],
      buttonText: 'BOOK PREMIUM WASH'
    }
  ];

  const handleSelectPlan = async (planId: string, amount: number, planName: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    let brand = "";
    let model = "";
    let vNum = "";
    
    if (userProfile?.vehicles && userProfile.vehicles.length > 0) {
      const v = userProfile.vehicles[0];
      if (typeof v === 'string' && v.includes(" | ")) {
        const parts = v.split(" | ");
        const nameParts = parts[0].split(" ");
        brand = nameParts[0];
        model = nameParts.slice(1).join(" ");
        vNum = parts[1];
      } else if (typeof v === 'string') {
        brand = v;
      }
    }
    
    navigate("/app/checkout", { 
      state: { 
        planId, 
        planName,
        amount, 
        category: activeCategory, 
        vehicle: { brand, model, vehicleNumber: vNum, type: activeCategory.toLowerCase() } 
      }
    });
  };

  const categories: VehicleCategory[] = ["HATCHBACK", "SEDAN", "SUV / MUV"];
  const currentPlans = getPlans(activeCategory);

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4 space-y-6 bg-[#050505]">
      
      <div className="mb-6">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-white tracking-tight mb-2 font-sans"
        >
          Select Plan
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-white/60 text-sm font-medium"
        >
          Choose a premium care plan for your vehicle.
        </motion.p>
      </div>

      {/* Tabs */}
      <div className="bg-white/[0.03] p-1.5 rounded-2xl flex items-center border border-white/5 mb-6 relative">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-3 text-[11px] font-bold tracking-wider uppercase rounded-xl transition-all duration-300 relative z-10 ${
              activeCategory === cat ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {activeCategory === cat && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20">{cat}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {currentPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`relative rounded-[28px] bg-gradient-to-b border p-6 overflow-hidden ${plan.color} ${plan.border} ${plan.shadow || ''}`}
            >
              {plan.isPopular && (
                <div className="absolute inset-0 bg-zinc-400/5 mix-blend-overlay pointer-events-none" />
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5`}>
                    <plan.icon className={plan.iconColor} size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">{plan.name}</h3>
                    {plan.subtitle && (
                      <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider mt-1">{plan.subtitle}</p>
                    )}
                  </div>
                </div>
                {plan.tag && (
                  <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-full tracking-wider uppercase text-center border ${
                    plan.isPopular ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/10 text-white border-white/20'
                  }`}>
                    {plan.tag}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-6 mt-4">
                <span className={`text-4xl font-black tracking-tight ${plan.isPopular ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'text-white'}`}>{plan.price}</span>
                <span className="text-white/40 text-[13px] font-bold uppercase tracking-wider ml-1">{plan.duration}</span>
              </div>

              {plan.highlightText && (
                <div className="bg-white/10 border border-white/30 rounded-xl py-2.5 px-4 mb-6 flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <Sparkles size={14} className="text-white" />
                  <span className="text-white text-xs font-bold">{plan.highlightText}</span>
                </div>
              )}

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className={plan.isPopular ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'text-white/30'} />
                    <span className="text-[13px] font-medium text-white/80">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSelectPlan(plan.id, parseInt(plan.price.replace(/[^0-9]/g, '')), plan.name)}
                disabled={loadingPlan === plan.id}
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center transition-all duration-300 disabled:opacity-50 ${
                  plan.isPopular 
                    ? 'bg-gradient-to-r from-white to-neutral-300 hover:from-neutral-100 hover:to-neutral-400 text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-diamond-shine relative overflow-hidden' 
                    : 'bg-white text-black hover:bg-neutral-200 shadow-[0_4px_20px_rgba(255,255,255,0.1)]'
                }`}
              >
                {loadingPlan === plan.id ? 'PROCESSING...' : plan.buttonText}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      
    </div>
  );
}
