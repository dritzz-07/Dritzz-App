import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, CheckCircle2, Shield, Zap, Sparkles } from 'lucide-react';

export default function MobilePlans() {
  const plans = [
    {
      id: 'essential',
      name: 'Essential Care',
      tag: 'POPULAR',
      price: '₹999',
      duration: '/mo',
      color: 'from-blue-900/40 to-blue-900/10',
      border: 'border-blue-500/30',
      icon: Zap,
      iconColor: 'text-blue-400',
      features: ['2 Exterior Washes', '1 Interior Vacuum', 'Tire Dressing', 'Glass Cleaning']
    },
    {
      id: 'premium',
      name: 'Premium Shine',
      tag: 'BEST VALUE',
      price: '₹1499',
      duration: '/mo',
      color: 'from-purple-900/40 to-purple-900/10',
      border: 'border-purple-500/30',
      icon: Sparkles,
      iconColor: 'text-purple-400',
      features: ['4 Exterior Washes', '2 Interior Deep Clean', 'Wax Application', 'Air Freshener']
    },
    {
      id: 'ultimate',
      name: 'Ultimate Detailing',
      tag: 'LUXURY',
      price: '₹2999',
      duration: '/mo',
      color: 'from-zinc-800 to-black',
      border: 'border-white/20',
      icon: Shield,
      iconColor: 'text-white',
      features: ['Unlimited Exterior', 'Weekly Interior', 'Ceramic Top-up', 'Engine Bay Clean']
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4 space-y-6">
      
      <div className="mb-2">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white tracking-tight mb-2"
        >
          Select Plan
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-white/50 text-sm"
        >
          Choose a subscription that fits your car care needs.
        </motion.p>
      </div>

      <div className="space-y-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className={`relative rounded-[32px] bg-gradient-to-b ${plan.color} border ${plan.border} p-6 overflow-hidden`}
          >
            {/* Tag */}
            <div className="absolute top-6 right-6">
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase bg-white/10 text-white`}>
                {plan.tag}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <plan.icon className={plan.iconColor} size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
              <span className="text-white/50 text-sm font-medium">{plan.duration}</span>
            </div>

            <div className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className={plan.iconColor} />
                  <span className="text-sm font-medium text-white/80">{feature}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-wide flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-[0_4px_20px_rgba(255,255,255,0.1)]">
              Select {plan.name.split(' ')[0]}
            </button>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
}
