import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MapPin,
  CarFront,
  FileText,
  LifeBuoy,
  Settings,
  Loader2,
  Download,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { generateInvoice } from "../lib/pdf";
import { BookingDocument, Package } from "../types";
import { PACKAGES } from "../constants";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "addresses" | "vehicles" | "invoices" | "support" | "settings";
}

export default function AccountSettingsModal({
  isOpen,
  onClose,
  initialTab = "settings",
}: AccountSettingsModalProps) {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [carModel, setCarModel] = useState(userProfile?.carModel || "");

  // Settings form
  const [fullName, setFullName] = useState(userProfile?.fullName || "");
  const [email, setEmail] = useState(userProfile?.email || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  // Address form
  const [address, setAddress] = useState(userProfile?.address || "");

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Invoices data
  const [pastBookings, setPastBookings] = useState<BookingDocument[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setSaveSuccess(null);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false);
      return;
    }
    if (isOpen && userProfile && !hasInitialized) {
      setCarModel("");
      setFullName(userProfile.fullName || "");
      setEmail(userProfile.email || "");
      setPhone(userProfile.phone || "");
      setAddress("");
      setHasInitialized(true);
    }
  }, [isOpen, userProfile, hasInitialized]);

  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    setLoadingBookings(true);
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BookingDocument[];

      const completed = fetchedBookings;
      completed.sort(
        (a, b) =>
          new Date(b.date || "").getTime() - new Date(a.date || "").getTime(),
      );

      setPastBookings(completed);
      setLoadingBookings(false);
    });

    return () => unsubscribe();
  }, [isOpen, user?.uid]);

  const handleSaveCarOption = async () => {
    if (!carModel.trim()) return;
    setIsSaving(true);
    try {
      const vehicles = userProfile?.vehicles || [];
      const updatedVehicles = Array.from(new Set([carModel, ...vehicles]));
      await updateUserProfile({ carModel, vehicles: updatedVehicles });
      setCarModel("");
      setSaveSuccess("vehicles");
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const handleDeleteVehicle = async (index: number) => {
    if (!userProfile?.vehicles) return;
    const newVehicles = userProfile.vehicles.filter((_, i) => i !== index);
    const newCarModel = newVehicles.length > 0 ? newVehicles[0] : "";
    try {
      await updateUserProfile({ vehicles: newVehicles, carModel: newCarModel });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMakeDefaultVehicle = async (index: number) => {
    if (!userProfile?.vehicles || index === 0) return;
    const newVehicles = [...userProfile.vehicles];
    const [selected] = newVehicles.splice(index, 1);
    newVehicles.unshift(selected);
    try {
      await updateUserProfile({
        vehicles: newVehicles,
        carModel: newVehicles[0],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({ fullName, email, phone });
      setSaveSuccess("settings");
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const handleSaveAddress = async () => {
    if (!address.trim()) return;
    setIsSaving(true);
    try {
      const addresses = userProfile?.addresses || [];
      const updatedAddresses = Array.from(new Set([address, ...addresses]));
      await updateUserProfile({ address, addresses: updatedAddresses });
      setAddress("");
      setSaveSuccess("addresses");
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const handleDeleteAddress = async (index: number) => {
    if (!userProfile?.addresses) return;
    const newAddresses = userProfile.addresses.filter((_, i) => i !== index);
    const newDefaultAddress = newAddresses.length > 0 ? newAddresses[0] : "";
    try {
      await updateUserProfile({
        addresses: newAddresses,
        address: newDefaultAddress,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMakeDefaultAddress = async (index: number) => {
    if (!userProfile?.addresses || index === 0) return;
    const newAddresses = [...userProfile.addresses];
    const [selected] = newAddresses.splice(index, 1);
    newAddresses.unshift(selected);
    try {
      await updateUserProfile({
        addresses: newAddresses,
        address: newAddresses[0],
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 "
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[600px]"
        >
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-black/50 border-r border-white/5 p-4 flex flex-col gap-1 overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4 px-2 tracking-tight">
              Account
            </h2>

            <div className="flex-1">
              {[
                { id: "vehicles", icon: CarFront, label: "Saved Vehicles" },
                { id: "addresses", icon: MapPin, label: "Saved Addresses" },
                { id: "invoices", icon: FileText, label: "Invoices" },
                { id: "support", icon: LifeBuoy, label: "Support" },
                { id: "settings", icon: Settings, label: "Settings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs mb-1 ${
                    activeTab === tab.id
                      ? "bg-zinc-500/10 text-white"
                      : "text-neutral-100 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="mt-8 border-t border-white/5 pt-4">
              <button
                onClick={() => {
                  logout?.();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </div>
                Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-neutral-900 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-100 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              {activeTab === "vehicles" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Saved Vehicles
                  </h3>
                  <p className="text-xs text-neutral-100 mb-8">
                    Manage your registered vehicles for quick bookings.
                  </p>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-100 uppercase tracking-wider mb-2">
                        Add New Vehicle Model
                      </label>
                      <input
                        type="text"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        placeholder="e.g. Hyundai Creta"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-medium"
                      />
                    </div>
                    <button
                      onClick={handleSaveCarOption}
                      disabled={isSaving || !carModel.trim()}
                      className={`w-full flex justify-center items-center gap-2 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 ${saveSuccess === "vehicles" ? "bg-zinc-600 hover:bg-zinc-500 text-white" : "bg-zinc-600 hover:bg-zinc-500 text-white"}`}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saveSuccess === "vehicles" ? (
                        "Saved Successfully"
                      ) : (
                        "Save Vehicle"
                      )}
                    </button>

                    {userProfile?.vehicles &&
                      userProfile.vehicles.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-white/10">
                          <label className="block text-xs font-semibold text-neutral-100 uppercase tracking-wider mb-4">
                            Your Saved Vehicles
                          </label>
                          <div className="space-y-3">
                            {userProfile.vehicles.map((vehicle, idx) => (
                              <div
                                key={idx}
                                className="bg-white/5 border border-white/10 p-4 rounded-xl text-neutral-100 font-medium flex items-center justify-between group"
                              >
                                <span className="truncate pr-4">{vehicle}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  {idx === 0 ? (
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-white/10 px-2 py-1.5 rounded-md text-white">
                                      Default
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleMakeDefaultVehicle(idx)
                                      }
                                      className="text-zinc-400 hover:text-white p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                      title="Make Default"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteVehicle(idx)}
                                    className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </motion.div>
              )}

              {activeTab === "addresses" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Saved Addresses
                  </h3>
                  <p className="text-xs text-neutral-100 mb-8">
                    Manage your default location.
                  </p>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-100 uppercase tracking-wider mb-2">
                        Add New Address
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 123 Main St, Appt 4B"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-medium resize-none h-24 whitespace-pre-wrap"
                      />
                    </div>
                    <button
                      onClick={handleSaveAddress}
                      disabled={isSaving || !address.trim()}
                      className={`w-full flex justify-center items-center gap-2 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 ${saveSuccess === "addresses" ? "bg-zinc-600 hover:bg-zinc-500 text-white" : "bg-zinc-600 hover:bg-zinc-500 text-white"}`}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saveSuccess === "addresses" ? (
                        "Saved Successfully"
                      ) : (
                        "Save Address"
                      )}
                    </button>

                    {userProfile?.addresses &&
                      userProfile.addresses.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-white/10">
                          <label className="block text-xs font-semibold text-neutral-100 uppercase tracking-wider mb-4">
                            Your Saved Addresses
                          </label>
                          <div className="space-y-3">
                            {userProfile.addresses.map((addr, idx) => (
                              <div
                                key={idx}
                                className="bg-white/5 border border-white/10 p-4 rounded-xl text-neutral-100 font-medium whitespace-pre-wrap flex items-start justify-between gap-4 group"
                              >
                                <span className="flex-1">{addr}</span>
                                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                  {idx === 0 ? (
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-white/10 px-2 py-1.5 rounded-md text-white">
                                      Default
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleMakeDefaultAddress(idx)
                                      }
                                      className="text-zinc-400 hover:text-white p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                      title="Make Default"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteAddress(idx)}
                                    className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </motion.div>
              )}

              {activeTab === "invoices" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Invoices
                  </h3>
                  <p className="text-xs text-neutral-100 mb-8">
                    Download past billing statements.
                  </p>

                  {loadingBookings ? (
                    <div className="flex flex-col items-center justify-center py-10 text-neutral-300">
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      <p className="text-xs uppercase tracking-widest font-bold">
                        Loading Data...
                      </p>
                    </div>
                  ) : pastBookings.length === 0 ? (
                    <div className="p-8 border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
                      <FileText className="w-8 h-8 text-neutral-600 mb-4" />
                      <p className="text-neutral-100 font-medium">
                        No invoices available.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastBookings.map((booking) => {
                        const pkgName =
                          PACKAGES.find((p) => p.id === booking.packageId)
                            ?.name || booking.packageId;
                        return (
                          <div
                            key={booking.id}
                            className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:bg-white/10"
                          >
                            <div>
                              <p className="font-bold text-white mb-1">
                                {pkgName}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-neutral-100">
                                <span>
                                  {booking.date
                                    ? new Date(booking.date).toLocaleDateString(
                                        "en-GB",
                                      )
                                    : "Unknown date"}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                                <span>Ref: {booking.refId}</span>
                                <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                                <span className="capitalize">
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-white font-mono">
                                ₹{booking.amount}
                              </span>
                              {booking.status !== "cancelled" && (
                                <button
                                  onClick={() => {
                                    const pkg =
                                      PACKAGES.find(
                                        (p) => p.id === booking.packageId,
                                      ) || PACKAGES[0];
                                    const details = {
                                      name:
                                        booking.name ||
                                        userProfile?.fullName ||
                                        user?.displayName ||
                                        "Customer",
                                      phone: booking.phone || "",
                                      email: booking.email || user?.email || "",
                                      address: booking.address || "",
                                      date: booking.date || "",
                                      timeSlot: booking.timeSlot || "",
                                      vehicleType: booking.vehicleType as any,
                                      packageId: booking.packageId || "",
                                      vehicles: booking.vehicles || [],
                                      notes: "",
                                    };
                                    generateInvoice(
                                      details,
                                      pkg,
                                      booking.amount || 0,
                                      booking.paymentMethod || "Manual",
                                      booking.refId || "REF000",
                                      booking.status,
                                    );
                                  }}
                                  className="p-2 bg-zinc-500 hover:bg-zinc-600 text-white rounded-lg transition-colors flex items-center justify-center"
                                  title="Download Invoice"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "support" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Support
                  </h3>
                  <p className="text-xs text-neutral-100 mb-8">
                    Get help with your bookings or account.
                  </p>
                  <div className="space-y-4">
                    <button className="w-full p-4 bg-black/30 border border-white/5 hover:border-white/20 rounded-xl text-left transition-colors">
                      <p className="font-bold text-white">Chat with us</p>
                      <p className="text-xs text-neutral-100 mt-1">
                        Typically replies in 5 minutes
                      </p>
                    </button>
                    <button
                      className="w-full p-4 bg-black/30 border border-white/5 hover:border-white/20 rounded-xl text-left transition-colors"
                      onClick={() =>
                        (window.location.href = "mailto:dritzz.info@gmail.com")
                      }
                    >
                      <p className="font-bold text-white">Email Support</p>
                      <p className="text-xs text-neutral-100 mt-1">
                        dritzz.info@gmail.com
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Account Settings
                  </h3>
                  <p className="text-xs text-neutral-100 mb-8">
                    Manage your base account preferences.
                  </p>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <p className="text-xs font-semibold text-neutral-100 uppercase tracking-wider mb-2">
                        Full Name
                      </p>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Full Name"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-100 uppercase tracking-wider mb-2">
                        Email Address
                      </p>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your Email"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-100 uppercase tracking-wider mb-2">
                        Phone Number
                      </p>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your Phone Number"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-medium"
                      />
                    </div>
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className={`w-full flex justify-center items-center gap-2 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-4 ${saveSuccess === "settings" ? "bg-zinc-600 hover:bg-zinc-500 text-white" : "bg-zinc-600 hover:bg-zinc-500 text-white"}`}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saveSuccess === "settings" ? (
                        "Saved Successfully"
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
