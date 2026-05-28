import { Check, Star } from 'lucide-react';
import { motion } from 'motion/react';

export function SubscriptionsView() {
  return (
    <div className="px-4 pt-6 pb-24 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-white mb-2">Monthly Plans</h2>
        <p className="text-sm text-neutral-400">Consistent care for your vehicle, handled automatically every day.</p>
      </div>

      <div className="space-y-6">
        {/* Basic Plan */}
        <div className="bg-neutral-900 rounded-3xl p-5 border border-neutral-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Daily Basic Wipe</h3>
              <p className="text-sm text-neutral-400">Ideal for daily commuters.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-display font-bold text-white">₹999</span>
              <span className="text-xs text-neutral-400 block">/month</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3 text-sm text-neutral-300">
              <div className="bg-blue-500/20 p-1 rounded-full"><Check size={14} className="text-blue-500" /></div>
              6 days a week exterior wash
            </li>
            <li className="flex items-center gap-3 text-sm text-neutral-300">
              <div className="bg-blue-500/20 p-1 rounded-full"><Check size={14} className="text-blue-500" /></div>
              1 day interior vacuum per month
            </li>
          </ul>

          <button className="w-full py-3 rounded-xl bg-neutral-800 text-white font-medium text-sm transition-colors hover:bg-neutral-700">
            Select Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-blue-900/40 to-black rounded-3xl p-5 border border-blue-500/30 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            <Star size={12} /> Most Popular
          </div>
          <div className="flex justify-between items-start mb-4 mt-2">
            <div>
              <h3 className="text-lg font-semibold text-white">Premium Care</h3>
              <p className="text-sm text-blue-200/80">Complete protective care.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-display font-bold text-white">₹1,999</span>
              <span className="text-xs text-blue-200/80 block">/month</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3 text-sm text-blue-100">
              <div className="bg-blue-500 p-1 rounded-full"><Check size={14} className="text-white" /></div>
              Daily microfiber exterior wash
            </li>
            <li className="flex items-center gap-3 text-sm text-blue-100">
              <div className="bg-blue-500 p-1 rounded-full"><Check size={14} className="text-white" /></div>
              Weekly interior vacuum & wipe
            </li>
            <li className="flex items-center gap-3 text-sm text-blue-100">
              <div className="bg-blue-500 p-1 rounded-full"><Check size={14} className="text-white" /></div>
              Monthly wax coating
            </li>
          </ul>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white font-medium text-sm transition-colors hover:bg-blue-500"
          >
            Subscribe Now
          </motion.button>
        </div>
      </div>
    </div>
  );
}
