import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export default function MobileBookings() {
  const bookings = [
    {
      id: '#BK-8472',
      status: 'Upcoming',
      date: 'Tomorrow',
      time: '09:00 AM - 10:00 AM',
      service: 'Premium Wash',
      car: 'Porsche 911 (MH 43 AB 1234)',
      address: 'Lodha Bellissimo, Mumbai'
    },
    {
      id: '#BK-8451',
      status: 'Completed',
      date: 'Oct 12, 2023',
      time: '11:00 AM - 12:00 PM',
      service: 'Exterior Wash',
      car: 'Porsche 911 (MH 43 AB 1234)',
      address: 'Lodha Bellissimo, Mumbai'
    },
    {
      id: '#BK-8310',
      status: 'Completed',
      date: 'Oct 05, 2023',
      time: '10:00 AM - 11:30 AM',
      service: 'Premium Wash',
      car: 'Porsche 911 (MH 43 AB 1234)',
      address: 'Lodha Bellissimo, Mumbai'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4 space-y-6">
      
      <div className="mb-4 flex items-center justify-between">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white tracking-tight"
        >
          My Bookings
        </motion.h2>
      </div>

      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className={`rounded-3xl border p-5 ${
              booking.status === 'Upcoming' 
                ? 'bg-neutral-900 border-white/10' 
                : 'bg-black/40 border-white/5 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{booking.id}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                booking.status === 'Upcoming' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {booking.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{booking.service}</h3>
            <p className="text-white/60 text-sm mb-4">{booking.car}</p>

            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-3 text-sm text-white/70">
                <Calendar size={16} className="text-white/40" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <Clock size={16} className="text-white/40" />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <MapPin size={16} className="text-white/40" />
                <span className="truncate">{booking.address}</span>
              </div>
            </div>

            {booking.status === 'Upcoming' && (
              <div className="flex gap-2">
                <button className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors">
                  Reschedule
                </button>
                <button className="flex-1 py-3 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors">
                  Track Pro
                </button>
              </div>
            )}
            {booking.status === 'Completed' && (
              <div className="flex gap-2">
                <button className="flex-1 py-3 rounded-2xl bg-white/5 text-white/60 font-semibold text-sm">
                  View Receipt
                </button>
                <button className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors">
                  Book Again
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
    </div>
  );
}
