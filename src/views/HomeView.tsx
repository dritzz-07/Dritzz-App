import { Sparkles, ShieldCheck, Droplets, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function HomeView() {
  return (
    <div className="pb-24 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="px-4 pt-6">
        <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-neutral-900 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=1000&auto=format&fit=crop" 
            alt="Premium Car Wash" 
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-200 bg-zinc-900/50 backdrop-blur-md rounded-full border border-zinc-400/30">
              Premium Service
            </span>
            <h2 className="text-3xl font-display font-bold text-white leading-tight mb-2">
              Luxury Care for <br/>Your Vehicle
            </h2>
            <p className="text-neutral-300 text-sm">Doorstep washing & detailing.</p>
          </div>
        </div>
      </section>

      {/* Quick Stats or Features */}
      <section className="px-4 mt-6 grid grid-cols-3 gap-3">
        <div className="bg-neutral-900 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 border border-neutral-800">
          <ShieldCheck size={24} className="text-zinc-400" />
          <span className="text-xs font-medium text-neutral-300">Trusted<br/>Process</span>
        </div>
        <div className="bg-neutral-900 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 border border-neutral-800">
          <Droplets size={24} className="text-zinc-400" />
          <span className="text-xs font-medium text-neutral-300">Eco-friendly<br/>Washes</span>
        </div>
        <div className="bg-neutral-900 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 border border-neutral-800">
          <Sparkles size={24} className="text-zinc-400" />
          <span className="text-xs font-medium text-neutral-300">Detailed<br/>Shine</span>
        </div>
      </section>

      {/* Services Listing */}
      <section className="px-4 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-display font-semibold text-white">Our Services</h3>
          <button className="text-zinc-400 text-sm font-medium flex items-center">
            View All <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Card 1 */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-neutral-900 rounded-3xl p-4 flex gap-4 items-center border border-neutral-800 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-800 flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=400&auto=format&fit=crop" alt="Daily Wash" className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow">
              <h4 className="text-base font-semibold text-white mb-1">Monthly Subscriptions</h4>
              <p className="text-xs text-neutral-400 mb-2">Daily exterior & interior cleaning right at your doorstep.</p>
              <div className="text-sm font-bold text-zinc-300">From ₹999/mo</div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-neutral-900 rounded-3xl p-4 flex gap-4 items-center border border-neutral-800 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-800 flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1620866952765-b77da245d8b6?q=80&w=400&auto=format&fit=crop" alt="Detailing" className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow">
              <h4 className="text-base font-semibold text-white mb-1">Premium Detailing</h4>
              <p className="text-xs text-neutral-400 mb-2">Deep interior vacuuming, polish & ceramic coats.</p>
              <div className="text-sm font-bold text-zinc-300">From ₹2,499</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
