import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, MapPin, CheckCircle2, Car, RefreshCw, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function MobileBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    const bq = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid)
    );
    const sq = query(
      collection(db, "subscriptions"),
      where("userId", "==", user.uid)
    );

    let bookingsList: any[] = [];
    let subscriptionsList: any[] = [];

    const handleUpdate = () => {
      const combined = [...bookingsList, ...subscriptionsList];
      combined.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setBookings(combined);
      setIsLoading(false);
    };

    const unsubBookings = onSnapshot(bq, (snapshot) => {
      bookingsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        _itemType: "booking",
        ...doc.data()
      }));
      handleUpdate();
    }, (error) => {
      console.error("Error listening to bookings snapshot:", error);
      setIsLoading(false);
    });

    const unsubSubs = onSnapshot(sq, (snapshot) => {
      subscriptionsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        _itemType: "subscription",
        ...doc.data()
      }));
      handleUpdate();
    }, (error) => {
      console.error("Error listening to subscriptions snapshot:", error);
    });

    return () => {
      unsubBookings();
      unsubSubs();
    };
  }, [user]);

  const handleBookAgain = (bk: any) => {
    // Navigate to subscriptions/plans picker to trigger flow
    navigate("/app/subscriptions");
  };

  const getStatusStyle = (status: string) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "confirmed":
      case "scheduled":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "in progress":
      case "in-progress":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-white/10 text-white/70 border-white/10";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white tracking-tight"
        >
          My Bookings
        </motion.h2>

        <span className="text-[10px] uppercase font-black text-white/40 tracking-wider bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          Realtime sync
        </span>
      </div>

      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
          <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-neutral-900/40 border border-white/5 rounded-[32px] p-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-5">
            <EyeOff className="text-white/30" size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">No Bookings Found</h3>
          <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto mb-6">
            Keep your car showroom-clean at your doorstep! Book a car wash subscription or pay-per-wash bundle now.
          </p>
          <button
            onClick={() => navigate("/app/subscriptions")}
            className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors"
          >
            Explore Wash Plans
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {bookings.map((booking, index) => {
              const bId = booking.bookingId || booking.refId || booking.id.toString().slice(0, 8).toUpperCase();
              const bName = booking.planName || (booking.packageId === "premium" ? "Premium Car Care" : "Base Eco Wash");
              const vehicleDetail = booking.vehicleName 
                ? `${booking.vehicleName} (${booking.vehicleNumber || "N/A"})` 
                : "My Regd. Vehicle";
              
              const bStatus = booking.bookingStatus || booking.status || "pending";

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
                  className="bg-neutral-900 border border-white/10 p-5 rounded-[24px] relative overflow-hidden flex flex-col justify-between"
                  id={`booking-card-${booking.id}`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-white/50 font-mono tracking-widest">
                      {bId}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${getStatusStyle(bStatus)}`}
                    >
                      {bStatus}
                    </span>
                  </div>

                  {/* Booking content */}
                  <div className="mb-4">
                    <h3 className="text-base font-extrabold text-white uppercase tracking-tight mb-1">
                      {bName}
                    </h3>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <Car size={13} className="text-white/30 shrink-0" />
                      <span className="font-semibold">{vehicleDetail}</span>
                    </div>
                  </div>

                  {/* Details block */}
                  <div className="border-t border-white/5 pt-4 space-y-2.5 mb-2">
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <Calendar size={14} className="text-white/30 shrink-0" />
                      <span>{booking.scheduledDate || booking.bookingDate || "Date Pending"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <Clock size={14} className="text-white/30 shrink-0" />
                      <span>{booking.scheduledTime || booking.bookingTime || "Time Pending"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <MapPin size={14} className="text-white/30 shrink-0" />
                      <span className="truncate max-w-[280px]">{booking.address || "Doorstep Location"}</span>
                    </div>
                  </div>

                  {/* Actions (Book Again on Completed) */}
                  {(bStatus.toLowerCase() === "completed" || bStatus.toLowerCase() === "cancelled") && (
                    <div className="border-t border-white/5 pt-4 mt-2">
                      <button
                        onClick={() => handleBookAgain(booking)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/90 text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        <RefreshCw size={13} />
                        <span>Book Wash Again</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
