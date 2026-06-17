import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CarFront,
  Zap,
  Shield,
  Sparkles,
  ChevronRight,
  Droplets,
  ArrowRight,
  Wind,
  LayoutDashboard,
  CircleDot,
  Maximize,
  MapPin,
  Crown,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { BookingDocument, Subscription } from "../types";

const SLIDES = [
  {
    id: 1,
    image: "/porsche-dritzz.jpg",
    badge: "Upgrade",
    title: "Ceramic Coating\nSpecial Offer",
    subtitle: "Get extreme gloss and protection for 1 year.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80",
    badge: "Bestseller",
    title: "Premium Interior\nDeep Clean",
    subtitle: "Revive your cabin to brand new.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&q=80",
    badge: "Popular",
    title: "Monthly Wash\nMembership",
    subtitle: "Keep it shining 24/7. Cancel anytime.",
  },
];

const SERVICES = [
  {
    icon: Droplets,
    title: "Exterior Foam Wash",
    desc: "Deep exterior cleaning with premium foam technology.",
    color: "text-zinc-300",
  },
  {
    icon: Wind,
    title: "Interior Vacuum",
    desc: "Complete interior dust and dirt removal.",
    color: "text-zinc-400",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Cleaning",
    desc: "Premium dashboard polishing and sanitization.",
    color: "text-zinc-300",
  },
  {
    icon: CircleDot,
    title: "Tyre Cleaning & Shine",
    desc: "Restore tyre shine with professional finishing.",
    color: "text-amber-400",
  },
  {
    icon: Maximize,
    title: "Glass Cleaning",
    desc: "Crystal clear windshield and window cleaning.",
    color: "text-cyan-400",
  },
  {
    icon: MapPin,
    title: "Doorstep Service",
    desc: "Professional car wash service at your doorstep.",
    color: "text-pink-400",
  },
  {
    icon: Zap,
    title: "Priority Booking",
    desc: "Fast-track bookings for premium members.",
    color: "text-yellow-400",
  },
  {
    icon: Crown,
    title: "Monthly Membership",
    desc: "Smart monthly subscription plans for regular care.",
    color: "text-indigo-400",
  },
  {
    icon: Sparkles,
    title: "Premium Detailing",
    desc: "Luxury interior + exterior finishing experience.",
    color: "text-zinc-300",
  },
];

const REVIEWS = [
  {
    name: "Rahul Sharma",
    car: "BMW X5",
    review:
      "The Dritzz team completely transformed my interior. Looks better than showroom fresh.",
    rating: 5,
  },
  {
    name: "Aarav Gupta",
    car: "Audi A6",
    review:
      "Worth every penny for the Monthly Membership. Super seamless process.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    car: "Mercedes C-Class",
    review: "Best premium detailing service. Always on time.",
    rating: 5,
  },
];

export default function MobileHome() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [activeItems, setActiveItems] = useState<any[]>([]);
  const [currentActiveItemIndex, setCurrentActiveItemIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  useEffect(() => {
    if (activeItems.length > 1) {
      const timer = setInterval(() => {
        setCurrentActiveItemIndex((prev) => (prev + 1) % activeItems.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [activeItems.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % SERVICES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    // Fetch active subscriptions
    const sq = query(
      collection(db, "subscriptions"),
      where("userId", "==", user.uid),
      where("status", "==", "active"),
    );
    let subs: any[] = [];
    let books: any[] = [];

    const updateActiveItems = () => {
      let combined = [...subs, ...books];
      combined.sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (val.toDate) return val.toDate().getTime();
          if (val.toMillis) return val.toMillis();
          return new Date(val).getTime() || 0;
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      setCurrentActiveItemIndex((prev) => 
        combined.length === 0 ? 0 : prev >= combined.length ? combined.length - 1 : prev
      );
      setActiveItems(combined);
    };

    const unsubSub = onSnapshot(sq, (snapshot) => {
      subs = snapshot.docs.map((doc) => ({
        id: doc.id,
        _itemType: "subscription",
        ...doc.data(),
      }));
      updateActiveItems();
    });

    // Fetch pending/scheduled bookings
    const bq = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid)
    );
    const unsubBook = onSnapshot(bq, (snapshot) => {
      books = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          _itemType: "booking",
          ...doc.data(),
        }))
        .filter((b: any) => b.status === "pending" || b.status === "scheduled");
      updateActiveItems();
    });

    return () => {
      unsubSub();
      unsubBook();
    };
  }, [user]);

  // Determine what to show in the active plan card
  let displayTitle = "No Plan Selected";
  let displayVehicleName = "Add Vehicle";
  let displayVehicleNumber = "";
  let showRemaining = false;
  let remainingWashes = 0;
  let totalWashes = 0;

  const currentItem = activeItems[currentActiveItemIndex];

  if (currentItem) {
    if (currentItem._itemType === "subscription") {
      displayTitle =
        currentItem.packageId === "monthly"
          ? "Dritzz Black Membership"
          : currentItem.packageId === "premium"
            ? "Premium Plan Active"
            : "Base Plan Active";
      if (currentItem.vehicles && currentItem.vehicles.length > 0) {
        const v = currentItem.vehicles[0];
        displayVehicleName =
          v.model && v.brand ? `${v.brand} ${v.model}` : "My Vehicle";
        displayVehicleNumber = v.vehicleNumber || "";
      }
      showRemaining = currentItem.packageId === "monthly";
      remainingWashes = currentItem.remainingWashes || 0;
      totalWashes = currentItem.totalWashes || 0;
    } else {
      displayTitle =
        currentItem.packageId === "premium"
          ? "Premium Booking"
          : "Base Wash Booking";
      if (currentItem.status === "scheduled") {
        displayTitle += " (Scheduled)";
      } else {
        displayTitle += " (Pending)";
      }
      if (currentItem.vehicles && currentItem.vehicles.length > 0) {
        const v = currentItem.vehicles[0];
        displayVehicleName =
          v.model && v.brand ? `${v.brand} ${v.model}` : "My Vehicle";
        displayVehicleNumber = v.vehicleNumber || "";
      }
    }
  }

  // fallback logic if there are vehicles in userProfile but no bookings
  if (
    displayVehicleName === "Add Vehicle" &&
    userProfile?.vehicles &&
    userProfile.vehicles.length > 0
  ) {
    const defaultVeh = userProfile.vehicles[0];
    if (typeof defaultVeh === "string" && defaultVeh.includes(" | ")) {
      const parts = defaultVeh.split(" | ");
      displayVehicleName = parts[0];
      displayVehicleNumber = parts[1];
    } else if (typeof defaultVeh === "string") {
      displayVehicleName = defaultVeh;
    } else {
      displayVehicleName = "Unknown Vehicle";
    }
  }

  // Determine greeting based on IST
  const getGreeting = () => {
    const istTime = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
    const hour = istTime.getUTCHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";
    return "Good Evening,";
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4 space-y-6">
      {/* Greeting Section */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-white/60 text-sm font-medium">{getGreeting()}</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {userProfile?.fullName?.split(" ")[0] || "User"}
          </h2>
        </motion.div>

        {/* Profile Avatar / Notification */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 p-0.5 border border-white/10"
          onClick={() => navigate("/app/profile")}
        >
          <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-white font-medium text-sm">
              {userProfile?.fullName?.[0]?.toUpperCase() || "U"}
            </span>
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
        <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-400/20 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-zinc-500/10 rounded-full blur-[40px] -ml-16 -mb-16 pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentActiveItemIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-5 relative z-10"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 text-zinc-300 mb-1">
                  <Sparkles size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {displayTitle}
                  </span>
                </div>
                {displayVehicleName === "Add Vehicle" ? (
                  <button
                    onClick={() => navigate("/app/profile?addVehicle=true")}
                    className="text-sm font-bold text-white/70 hover:text-white underline underline-offset-4 decoration-white/30"
                  >
                    + Add Vehicle
                  </button>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white">
                      {displayVehicleName}
                    </h3>
                    {displayVehicleNumber && (
                      <p className="text-white/50 text-sm uppercase font-mono mt-1">
                        {displayVehicleNumber}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                <CarFront className="text-white w-6 h-6" />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                {showRemaining ? (
                  <>
                    <p className="text-white/60 text-xs mb-1">
                      Remaining Washes
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">
                        {remainingWashes}
                      </span>
                      <span className="text-white/40 text-sm">
                        / {totalWashes}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="h-10" />
                )}
              </div>
              <button
                onClick={() => navigate("/app/profile?modal=plans")}
                className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-neutral-200 transition-colors whitespace-nowrap"
              >
                My Plans
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators for Active Items */}
        {activeItems.length > 1 && (
          <div className="absolute top-4 right-4 z-30 flex gap-1.5 pointer-events-none">
            {activeItems.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentActiveItemIndex
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* DRITZZ SERVICES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 pt-4 border-t border-white/5"
      >
        <div className="flex flex-col mb-5">
          <h3 className="font-display text-2xl font-black text-white mb-1 uppercase">
            DRITZZ SERVICES
          </h3>
          <p className="text-white/50 text-[11px] font-medium uppercase tracking-wider">
            Professional doorstep detailing for every vehicle type.
          </p>
        </div>

        <div className="relative h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentServiceIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              onClick={() => navigate("/app/subscriptions")}
              className="absolute inset-x-0 bg-neutral-900/40 backdrop-blur-md border border-white/5 p-6 rounded-[28px] cursor-pointer group overflow-hidden flex flex-col justify-between h-[180px]"
            >
              <div className="absolute inset-0 bg-zinc-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center justify-between z-10 w-full mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-zinc-400/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300`}
                >
                  {SERVICES[currentServiceIndex].icon && 
                    React.createElement(SERVICES[currentServiceIndex].icon as any, {
                      className: `${SERVICES[currentServiceIndex].color} transition-transform duration-300 group-hover:scale-110`,
                      size: 26,
                      strokeWidth: 1.5
                    })
                  }
                </div>
              </div>
              <div className="z-10 relative">
                <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                  {SERVICES[currentServiceIndex].title}
                </h4>
                <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
                  {SERVICES[currentServiceIndex].desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Premium Banner Slideshow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative rounded-3xl overflow-hidden group cursor-pointer h-[220px]"
        onClick={() => navigate("/app/subscriptions")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-900 z-0" />

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={currentSlide}
            src={SLIDES[currentSlide].image}
            alt={SLIDES[currentSlide].title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-20 p-6 h-full flex flex-col justify-end"
          >
            <div>
              <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-2.5 inline-block">
                {SLIDES[currentSlide].badge}
              </span>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight whitespace-pre-line">
                {SLIDES[currentSlide].title}
              </h3>
              <p className="text-white/60 text-sm mb-4 max-w-[200px]">
                {SLIDES[currentSlide].subtitle}
              </p>
              <div className="flex items-center text-sm font-medium text-white gap-1 mb-1 relative z-30">
                Explore Plans <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="absolute top-6 right-6 z-30 flex gap-1.5">
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-4 bg-white" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Customer Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <div className="flex justify-between items-end mb-4 px-1">
          <h3 className="font-display text-2xl font-black text-white uppercase">REVIEWS</h3>
        </div>

        <div className="relative h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReviewIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-x-0 bg-neutral-900/40 backdrop-blur-md border border-white/5 p-5 rounded-[24px]"
            >
              <div className="flex gap-1 text-zinc-300 mb-3">
                {[...Array(REVIEWS[currentReviewIndex].rating)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-white/80 text-sm mb-4 leading-relaxed line-clamp-3">
                "{REVIEWS[currentReviewIndex].review}"
              </p>
              <div className="flex justify-between items-end mt-2">
                <span className="text-white font-bold text-sm block">
                  {REVIEWS[currentReviewIndex].name}
                </span>
                <span className="text-white/40 text-[10px] font-medium tracking-wide uppercase">
                  {REVIEWS[currentReviewIndex].car}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute -bottom-6 inset-x-0 flex justify-center gap-1.5">
            {REVIEWS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentReviewIndex ? "w-4 bg-white" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Booking CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 border border-white/10 rounded-[32px] p-6 bg-gradient-to-br from-zinc-900/40 via-black to-black text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-400/20 rounded-full blur-[50px] pointer-events-none" />
        <h3 className="text-2xl font-black text-white tracking-tight mb-2 relative z-10">
          Ready for a Shine?
        </h3>
        <p className="text-white/60 text-sm mb-6 relative z-10">
          Book your first premium wash today.
        </p>
        <button
          onClick={() => navigate("/app/subscriptions")}
          className="w-full py-4 rounded-xl font-bold tracking-wide transition-all duration-300 relative z-10 block text-center uppercase bg-gradient-to-r from-zinc-800 to-black hover:from-zinc-700 hover:to-zinc-900 text-white border border-white/20 animate-diamond-shine shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          Book Now
        </button>
      </motion.div>
    </div>
  );
}
