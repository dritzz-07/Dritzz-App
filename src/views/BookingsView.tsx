import { CalendarClock, MapPin } from 'lucide-react';

export function BookingsView() {
  return (
    <div className="px-4 pt-6 pb-24 animate-in fade-in duration-500">
      <h2 className="text-2xl font-display font-bold text-white mb-6">Your Bookings</h2>

      <div className="space-y-4">
        {/* Active Booking */}
        <div className="bg-neutral-900 rounded-3xl p-5 border border-neutral-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-zinc-500 rounded-bl-xl text-xs font-semibold text-white">UPCOMING</div>
          
          <h3 className="text-lg font-semibold text-white mb-1">Premium Ceramic Detailing</h3>
          <p className="text-sm text-neutral-400 mb-4">Porsche 911 (TS 09 AB 1234)</p>

          <div className="bg-black/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-neutral-300">
              <CalendarClock size={16} className="text-zinc-400" />
              <span>Tomorrow, 10:00 AM</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-300">
              <MapPin size={16} className="text-zinc-400" />
              <span className="truncate">Cyber Towers, HITEC City, Hyderabad</span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="flex-1 bg-neutral-800 text-white font-medium py-3 justify-center items-center rounded-xl text-sm transition-colors hover:bg-neutral-700">
              Reschedule
            </button>
            <button className="flex-1 bg-zinc-500 text-white font-medium py-3 justify-center items-center rounded-xl text-sm transition-colors hover:bg-zinc-400">
              Track Team
            </button>
          </div>
        </div>

        <h3 className="text-lg font-display font-semibold text-white mt-8 mb-4">Past Bookings</h3>
        
        {/* Past Booking 1 */}
        <div className="bg-neutral-900/50 rounded-3xl p-4 border border-neutral-800/50 flex flex-col opacity-80">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="text-base font-medium text-neutral-200">Standard Interior Cleaning</h4>
              <p className="text-xs text-neutral-400">May 14, 2026</p>
            </div>
            <span className="text-xs font-medium text-zinc-400 bg-zinc-400/10 px-2 py-1 rounded-md">COMPLETED</span>
          </div>
        </div>

        {/* Past Booking 2 */}
        <div className="bg-neutral-900/50 rounded-3xl p-4 border border-neutral-800/50 flex flex-col opacity-80">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="text-base font-medium text-neutral-200">Express Exterior Wash</h4>
              <p className="text-xs text-neutral-400">Apr 28, 2026</p>
            </div>
            <span className="text-xs font-medium text-zinc-400 bg-zinc-400/10 px-2 py-1 rounded-md">COMPLETED</span>
          </div>
        </div>

      </div>
    </div>
  );
}
