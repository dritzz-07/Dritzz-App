import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Droplets,
  Car,
  User,
  LogOut,
  Calendar,
  Crown,
  MapPin,
  CarFront,
  FileText,
  LifeBuoy,
  Settings,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImage from "../assets/images/regenerated_image_1779231339878.png";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

interface NavbarProps {
  openLogin: () => void;
  openBookings: (tab?: "upcoming" | "history" | "subscriptions") => void;
  openSettings?: (
    tab?: "addresses" | "vehicles" | "invoices" | "support" | "settings",
  ) => void;
}

const MenuButton = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full px-3 py-2.5 text-left text-[13px] font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl flex items-center justify-between transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
        <Icon className="w-4 h-4 text-neutral-100 group-hover:text-white transition-colors" />
      </div>
      {label}
    </div>
    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-100 transition-colors" />
  </button>
);

export default function Navbar({
  openLogin,
  openBookings,
  openSettings,
}: NavbarProps) {
  const [splashes, setSplashes] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const { user, userProfile, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName =
    userProfile?.fullName?.split(" ")[0] ||
    user?.displayName?.split(" ")[0] ||
    localStorage.getItem("authFullName")?.split(" ")[0] ||
    "Customer";

  const handleNavClick = (e: React.MouseEvent) => {
    const splash = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    setSplashes((prev) => [...prev, splash]);
    setTimeout(() => {
      setSplashes((prev) => prev.filter((s) => s.id !== splash.id));
    }, 1000);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pt-1 pb-4 md:px-8 lg:px-16 bg-black/80 backdrop-blur-md border-b border-white/5">
      <a
        href="/"
        className="flex items-center gap-2 decoration-none text-white group"
        onClick={handleNavClick}
      >
        <motion.img
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          src={logoImage}
          alt="Dritzz Logo"
          className="w-[100px] h-[100px] lg:w-[150px] lg:h-[150px] object-contain transition-all"
        />
      </a>

      <ul className="hidden md:flex items-center md:gap-6 lg:gap-10 list-none">
        <li>
          <a
            href="/"
            onClick={handleNavClick}
            className="text-xs font-medium text-neutral-100 hover:text-white transition-colors decoration-none relative"
          >
            Home
          </a>
        </li>
        {["Services", "Packages", "How It Works", "Why Us", "Contact"].map(
          (item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={handleNavClick}
                className="text-xs font-medium text-neutral-100 hover:text-white transition-colors decoration-none relative"
              >
                {item}
              </a>
            </li>
          ),
        )}
      </ul>

      <div className="flex items-center gap-4 md:gap-6">
        {user ? (
          <div className="relative" ref={menuRef}>
            <motion.button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 px-1.5 py-1.5 pr-4 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/10 text-neutral-100 uppercase tracking-[0.2em] text-[11px] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-[0.98] transition-all duration-300 font-black"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[13px] font-black text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="max-w-[120px] truncate">Hi, {displayName}</span>
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute right-0 mt-4 w-80 bg-black/90 border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden z-50 flex flex-col max-h-[calc(100vh-100px)]"
                >
                  {/* Top Glow */}
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-zinc-500/10 to-transparent pointer-events-none" />

                  <div className="flex-shrink-0 relative p-5 border-b border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-zinc-600/30 to-zinc-900/20 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.3)]">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-neutral-100 mb-0.5">
                        Good Evening,
                      </p>
                      <p className="text-xs text-white font-medium truncate tracking-tight">
                        {displayName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs uppercase tracking-widest font-bold text-neutral-100 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                          Member
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto overflow-x-hidden dropdown-scrollbar relative z-10">
                    <div className="p-2">
                      <div className="px-2 py-2 mb-1">
                        <div className="flex items-center justify-between text-xs mb-1 px-2">
                          <span className="text-neutral-300 font-medium">
                            Verified Phone
                          </span>
                          <span className="text-neutral-300 font-medium">
                            {userProfile?.phone
                              ? userProfile.phone.replace(
                                  /(\+\d{2})(\d{5})(\d{5})/,
                                  "$1 $2 $3",
                                )
                              : user?.phoneNumber?.replace(
                                  /(\+\d{2})(\d{5})(\d{5})/,
                                  "$1 $2 $3",
                                ) || "Not set"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs mb-1 px-2 mt-4">
                          <span className="text-neutral-300 font-medium">
                            Your Vehicle
                          </span>
                          {userProfile?.carModel ? (
                            <span className="text-white font-medium">
                              {userProfile.carModel}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                openSettings?.("vehicles");
                                setShowProfileMenu(false);
                              }}
                              className="text-white font-medium hover:text-neutral-300 transition-colors"
                            >
                              + Add Vehicle
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-0.5 mt-2">
                        <MenuButton
                          icon={Calendar}
                          label="My Bookings"
                          onClick={() => {
                            openBookings("upcoming");
                            setShowProfileMenu(false);
                          }}
                        />
                        <MenuButton
                          icon={MapPin}
                          label="Saved Addresses"
                          onClick={() => {
                            openSettings?.("addresses");
                            setShowProfileMenu(false);
                          }}
                        />
                        <MenuButton
                          icon={CarFront}
                          label="Saved Vehicles"
                          onClick={() => {
                            openSettings?.("vehicles");
                            setShowProfileMenu(false);
                          }}
                        />
                        <MenuButton
                          icon={FileText}
                          label="Invoices"
                          onClick={() => {
                            openSettings?.("invoices");
                            setShowProfileMenu(false);
                          }}
                        />
                        <MenuButton
                          icon={LifeBuoy}
                          label="Support"
                          onClick={() => {
                            openSettings?.("support");
                            setShowProfileMenu(false);
                          }}
                        />
                        <MenuButton
                          icon={Settings}
                          label="Account Settings"
                          onClick={() => {
                            openSettings?.("settings");
                            setShowProfileMenu(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 p-2 border-t border-white/5 bg-black/40 relative z-10">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-3 py-3 text-left text-[13px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                          <LogOut className="w-4 h-4" />
                        </div>
                        Sign Out of Dritzz
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <motion.button
              onClick={openLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex-none !px-6 !py-2.5 !text-[11px] animate-diamond-shine"
            >
              <Car className="w-4 h-4" strokeWidth={2.5} />
              <span>Sign In</span>
            </motion.button>
          </>
        )}
      </div>

      <div className="fixed inset-0 pointer-events-none z-[60]">
        <AnimatePresence>
          {splashes.map((splash) => (
            <div
              key={splash.id}
              className="absolute"
              style={{ left: splash.x, top: splash.y }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                  animate={{
                    opacity: 0,
                    x: (Math.random() - 0.5) * 150,
                    y: (Math.random() - 0.5) * 150,
                    scale: 0,
                    rotate: Math.random() * 360,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute"
                >
                  <Droplets
                    size={20}
                    className="text-white fill-zinc-400/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  />
                </motion.div>
              ))}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </nav>
  );
}
