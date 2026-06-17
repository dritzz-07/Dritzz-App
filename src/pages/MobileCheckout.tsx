import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Car,
  User,
  Phone,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, getDocs, doc, setDoc, query, where, serverTimestamp } from "firebase/firestore";

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function MobileCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, updateUserProfile } = useAuth();

  const state = location.state as {
    planId: string;
    planName: string;
    amount: number;
    category: string;
    vehicle?: {
      brand: string;
      model: string;
      vehicleNumber: string;
      type: string;
    };
  };

  // State values initialized from profile
  const [customerName, setCustomerName] = useState(userProfile?.fullName || user?.displayName || "");
  const [mobileNumber, setMobileNumber] = useState(userProfile?.phone || user?.phoneNumber || "");
  
  // Address selection/editing
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [customAddress, setCustomAddress] = useState("");
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);
  const [addressInputMode, setAddressInputMode] = useState<"" | "live" | "manual">("");

  // Vehicle selection/editing
  const [selectedVehicleStr, setSelectedVehicleStr] = useState<string>("");
  const [newVehicleBrand, setNewVehicleBrand] = useState(state?.vehicle?.brand || "");
  const [newVehicleModel, setNewVehicleModel] = useState(state?.vehicle?.model || "");
  const [newVehicleNumber, setNewVehicleNumber] = useState(state?.vehicle?.vehicleNumber || "");
  const [saveVehicleToProfile, setSaveVehicleToProfile] = useState(true);

  // Date and Time Slot
  const [serviceDate, setServiceDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.focus();
        dateInputRef.current.showPicker();
      } catch (err) {
        try {
          dateInputRef.current.click();
        } catch (e) {
          console.warn("Could not activate date picker:", e);
        }
      }
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [successBookingId, setSuccessBookingId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod only for now

  // Pre-fill setup when profile loads
  useEffect(() => {
    if (userProfile?.fullName) setCustomerName(userProfile.fullName);
    if (userProfile?.phone) setMobileNumber(userProfile.phone);
    
    if (userProfile?.addresses && userProfile.addresses.length > 0) {
      setSelectedAddress(userProfile.addresses[0]);
    } else if (userProfile?.address) {
      setSelectedAddress("legacy");
      setCustomAddress(userProfile.address);
    } else {
      setSelectedAddress("new");
    }

    if (userProfile?.vehicles && userProfile.vehicles.length > 0) {
      setSelectedVehicleStr(userProfile.vehicles[0]);
    } else {
      setSelectedVehicleStr("new");
    }
  }, [userProfile]);

  if (!state) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] text-white p-6 text-center">
        <p className="text-white/60 mb-4">No active booking session found.</p>
        <button
          onClick={() => navigate("/app")}
          className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const checkoutTotal = state.amount || 0;
  const checkoutBase = Math.round(checkoutTotal / 1.18);
  const checkoutCgst = Math.round((checkoutTotal - checkoutBase) / 2);
  const checkoutSgst = checkoutTotal - checkoutBase - checkoutCgst;

  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      setAddressInputMode("live");
      setCustomAddress("Locating current position...");
      setSelectedAddress("new");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              setCustomAddress(data.display_name);
            } else {
              setCustomAddress(`Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`);
            }
          } catch (e) {
            setCustomAddress(`Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`);
          }
        },
        () => {
          alert("Could not retrieve GPS location. Please type manually.");
          setAddressInputMode("manual");
          setCustomAddress("");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const timeSlots = [
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM"
  ];

  const handleProceedToPayment = () => {
    if (!customerName.trim()) {
      alert("Customer Name is required.");
      return;
    }
    if (!mobileNumber.trim()) {
      alert("Mobile Number is required.");
      return;
    }

    // Address verification
    const finalAddress = selectedAddress === "new" || selectedAddress === "legacy" ? customAddress : selectedAddress;
    if (!finalAddress || !finalAddress.trim()) {
      alert("Please provide a service address.");
      return;
    }
    if (finalAddress === "Locating current position...") {
      alert("Please wait whilst we detect your live location, or enter details manually.");
      return;
    }

    // Vehicle verification
    let plate = "";
    let brand = "";
    if (selectedVehicleStr === "new") {
      if (!newVehicleBrand.trim()) {
        alert("Vehicle Brand is required.");
        return;
      }
      if (!newVehicleNumber.trim()) {
        alert("Vehicle Number is required.");
        return;
      }
      brand = newVehicleBrand.trim();
      plate = newVehicleNumber.trim().toUpperCase();
    } else {
      const parts = selectedVehicleStr.split(" | ");
      brand = parts[0];
      plate = parts[1] || "";
    }

    // Check duplicate vehicle plate number
    if (selectedVehicleStr === "new" && userProfile?.vehicles) {
      const parsedPlates = userProfile.vehicles.map(v => {
        const p = v.split(" | ");
        return p[1] ? p[1].toUpperCase() : "";
      });
      if (parsedPlates.includes(plate)) {
        alert("This vehicle plate number is already registered in your account.");
        return;
      }
    }

    if (!serviceDate) {
      alert("Please select a service date.");
      return;
    }
    if (!timeSlot) {
      alert("Please select a time slot.");
      return;
    }

    setShowPayment(true);
  };

  const createBookingDatabaseRecord = async (method: "cod" | "razorpay", paymentIdVal?: string) => {
    try {
      const finalAddress = selectedAddress === "new" || selectedAddress === "legacy" ? customAddress.trim() : selectedAddress;
      
      let vehicleBrandModel = "";
      let vehiclePlate = "";
      
      if (selectedVehicleStr === "new") {
        vehicleBrandModel = newVehicleBrand.trim() + (newVehicleModel.trim() ? " " + newVehicleModel.trim() : "");
        vehiclePlate = newVehicleNumber.trim().toUpperCase();
      } else {
        const parts = selectedVehicleStr.split(" | ");
        vehicleBrandModel = parts[0];
        vehiclePlate = parts[1] || "";
      }

      // 1. Save address to profile if checked
      if (selectedAddress === "new" && saveAddressToProfile && updateUserProfile) {
        const currentAddresses = userProfile?.addresses || [];
        if (!currentAddresses.includes(finalAddress)) {
          const updatedAddresses = [finalAddress, ...currentAddresses];
          await updateUserProfile({ addresses: updatedAddresses });
        }
      }

      // 2. Save vehicle to profile if checked
      if (selectedVehicleStr === "new" && saveVehicleToProfile && updateUserProfile) {
        const formattedVehicleRecord = `${vehicleBrandModel} | ${vehiclePlate}`;
        const currentVehicles = userProfile?.vehicles || [];
        if (!currentVehicles.includes(formattedVehicleRecord)) {
          const updatedVehicles = [formattedVehicleRecord, ...currentVehicles];
          await updateUserProfile({ vehicles: updatedVehicles });
        }
      }

      // 3. Generate sequential booking ID DZ001, DZ002, DZ003
      // We will perform a real query of all current bookings & subscriptions to deduce next index
      let seqIndex = 1;
      try {
        const bookingsQuery = await getDocs(collection(db, "bookings"));
        const subsQuery = await getDocs(collection(db, "subscriptions"));
        seqIndex = bookingsQuery.size + subsQuery.size + 1;
      } catch (seqErr) {
        console.warn("Could not calculate next booking index via Firebase, using random fallback", seqErr);
        seqIndex = Math.floor(Math.random() * 900) + 100;
      }

      const generatedId = `DZ${String(seqIndex).padStart(3, "0")}`;

      // 4. Set final scheduling format
      const formattedDate = new Date(serviceDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      // Prepare payload to match Firebase structure
      const payload = {
        bookingId: generatedId,
        refId: generatedId,
        customerName: customerName.trim(),
        mobileNumber: mobileNumber.trim(),
        userId: user?.uid || "",
        userEmail: userProfile?.email || user?.email || "",
        userName: customerName.trim(),
        userPhone: mobileNumber.trim(),
        
        vehicleName: vehicleBrandModel,
        vehicleNumber: vehiclePlate,
        vehicleType: state.category.toLowerCase(),
        vehicles: [{
          brand: vehicleBrandModel,
          model: "",
          vehicleNumber: vehiclePlate,
          type: state.category.toLowerCase()
        }],

        address: finalAddress,
        serviceType: state.planId || "basic",
        planId: state.planId || "basic",
        planName: state.planName,
        packageId: state.planId || "basic",

        bookingDate: formattedDate,
        bookingTime: timeSlot,
        scheduledDate: formattedDate,
        scheduledTime: timeSlot,

        amount: state.amount,
        status: "pending",
        bookingStatus: "pending",
        paymentMethod: method,
        paymentStatus: method === "razorpay" ? "Paid" : "Pending",
        paymentId: paymentIdVal || "",
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 5. Add to bookings or subscriptions
      let docRefId = "";
      if (state.planId === "monthly") {
        const docRef = await addDoc(collection(db, "subscriptions"), { ...payload, status: "active" });
        docRefId = docRef.id;
      } else {
        const docRef = await addDoc(collection(db, "bookings"), payload);
        docRefId = docRef.id;
      }

      // Add to notifications
      try {
        await addDoc(collection(db, "notifications"), {
          userId: user?.uid || "",
          title: method === "razorpay" ? "Payment Successful" : "Booking Received",
          message: method === "razorpay"
            ? `Payment of ₹${state.amount} received for booking ${generatedId}.`
            : `Your booking ${generatedId} for ${state.planName} is pending confirmation.`,
          bookingId: generatedId,
          type: "Booking Confirmations",
          read: false,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn("Failed to create notification", e);
      }

      // 6. Generate matched tax Invoice record instantly
      const invoiceRefId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      await addDoc(collection(db, "invoices"), {
        id: `invoice-${Date.now()}`,
        invoiceId: invoiceRefId,
        bookingId: docRefId,
        userId: user?.uid || "",
        createdAt: serverTimestamp(),
        amount: state.amount,
        packageId: state.planId,
        userName: customerName.trim(),
        userPhone: mobileNumber.trim(),
        userEmail: userProfile?.email || user?.email || "",
        scheduledDate: formattedDate,
        scheduledTime: timeSlot,
        address: finalAddress,
        paymentMethod: method,
        paymentStatus: method === "razorpay" ? "Paid" : "Pending",
        paymentId: paymentIdVal || "",
        vehicles: [{
          brand: vehicleBrandModel,
          model: "",
          vehicleNumber: vehiclePlate,
          type: state.category.toLowerCase()
        }]
      });

      setSuccessBookingId(generatedId);
      setIsConfirmed(true);
    } catch (err: any) {
      console.error(err);
      alert("An unexpected error occurred during confirmation. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (paymentMethod === "razorpay") {
      setIsProcessing(true);
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      const finalAddress = selectedAddress === "new" || selectedAddress === "legacy" ? customAddress.trim() : selectedAddress;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_DDR_PublicTestKey",
        amount: state.amount * 100, // Amount in paise
        currency: "INR",
        name: "Dritzz Detailing",
        description: `${state.planName} (${state.category})`,
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200&h=200",
        handler: async function (response: any) {
          try {
            await createBookingDatabaseRecord("razorpay", response.razorpay_payment_id);
          } catch (err) {
            console.error("Payment update database error:", err);
            alert("Payment successful but booking database update failed. Please contact support.");
          }
        },
        prefill: {
          name: customerName,
          contact: mobileNumber,
          email: userProfile?.email || user?.email || "",
        },
        notes: {
          address: finalAddress,
          time_slot: timeSlot,
          service_date: serviceDate
        },
        theme: {
          color: "#050505",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("Razorpay widget error:", err);
        alert("Could not load the Razorpay window. Please use Cash on Delivery.");
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    await createBookingDatabaseRecord("cod");
  };

  const renderProgressIndicator = (step: number) => {
    return (
      <div className="flex items-center gap-1.5 justify-center mb-6 px-4">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-white" : "bg-white/10"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-white" : "bg-white/10"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-white" : "bg-white/10"}`} />
      </div>
    );
  };

  if (isConfirmed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-neutral-900/50 border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={42} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
            Booking Received
          </h2>
          <p className="text-white/60 text-sm mb-6">
            Order confirmed successfully! Our detailing team is on way.
          </p>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 text-left mb-8 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-white/40">BOOKING ID</span>
              <span className="text-white font-bold">{successBookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">PLAN</span>
              <span className="text-white font-bold uppercase">{state.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">TOTAL AMOUNT</span>
              <span className="text-white font-bold">₹{state.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">PAYMENT</span>
              <span className="text-emerald-400 font-bold uppercase">
                {paymentMethod === "razorpay" ? "Online (Paid)" : "Cash On Delivery"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              // Complete and go to bookings list page
              navigate("/app/bookings");
            }}
            className="w-full py-4 rounded-xl bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-neutral-200 transition-colors"
          >
            My Bookings
          </button>
        </motion.div>
      </div>
    );
  }

  // STEP 2: Show payment methods
  if (showPayment) {
    return (
      <div className="flex-1 flex flex-col bg-[#050505] overflow-y-auto pb-32">
        <div className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setShowPayment(false)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-base font-black text-white tracking-tight uppercase">Payment Options</span>
        </div>

        <div className="p-4 space-y-6">
          {renderProgressIndicator(2)}

          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 text-center">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-1">
              Grand Total
            </span>
            <span className="text-4xl font-extrabold text-white tracking-tight">
              ₹{state.amount}
            </span>
            <span className="block text-[11px] text-white/40 mt-1 uppercase">Inclusive of 18% taxes & GST</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest pl-1">
              Select Method
            </h3>

            {/* COD - Active Only */}
            <button
              onClick={() => setPaymentMethod("cod")}
              className={`w-full flex items-center gap-4 p-5 rounded-3xl border text-left transition-all ${
                paymentMethod === "cod"
                  ? "bg-white/5 border-white/30 shadow-lg"
                  : "bg-neutral-900/40 border-white/5 opacity-40"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-white shrink-0">
                <Clock size={22} />
              </div>
              <div className="flex-1">
                <span className="block text-white font-bold text-sm">
                  Cash on Delivery (COD)
                </span>
                <span className="block text-white/50 text-xs mt-0.5">
                  Confirm booking, pay at doorstep
                </span>
              </div>
              <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                {paymentMethod === "cod" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </button>

            {/* Razorpay - Selectable and working */}
            <button
              onClick={() => setPaymentMethod("razorpay")}
              className={`w-full flex items-center gap-4 p-5 rounded-3xl border text-left transition-all ${
                paymentMethod === "razorpay"
                  ? "bg-white/5 border-white/30 shadow-lg"
                  : "bg-neutral-900/40 border-white/5 opacity-40 hover:opacity-100"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-white shrink-0">
                <CreditCard size={22} className={paymentMethod === "razorpay" ? "text-emerald-400" : "text-white"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="block text-white font-bold text-sm">Online Payment</span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase border border-emerald-500/15">ACTIVE</span>
                </div>
                <span className="block text-white/50 text-xs mt-0.5">
                  Razorpay UPI, Credit Card, Netbanking
                </span>
              </div>
              <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                {paymentMethod === "razorpay" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6">
          <button
            onClick={handleConfirmBooking}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl font-bold tracking-wider transition-all uppercase text-xs flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black shadow-lg disabled:opacity-40"
          >
            {isProcessing ? "Processing Booking..." : `Confirm Booking`}
          </button>
        </div>
      </div>
    );
  }

  // STEP 1: Details and configuration
  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-y-auto pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-[#050505]/95 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-base font-black text-white tracking-tight uppercase">Booking Details</span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {renderProgressIndicator(1)}

        {/* Service Details Section */}
        <section className="space-y-4">
          <div className="p-1 px-1">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">
              Contact Information
            </h3>
          </div>

          <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/30 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. +91 99999 99999"
                  className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/30 font-bold font-mono"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Address Selection Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">
              Service Location
            </h3>
          </div>

          <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-5 space-y-4">
            {userProfile?.addresses && userProfile.addresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                  Saved Addresses
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {userProfile.addresses.map((addr) => (
                    <button
                      key={addr}
                      type="button"
                      onClick={() => {
                        setSelectedAddress(addr);
                        setCustomAddress("");
                        setAddressInputMode("");
                      }}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs transition-all ${
                        selectedAddress === addr
                          ? "bg-white/5 border-white/30"
                          : "bg-black/30 border-white/5 text-white/60 hover:border-white/15"
                      }`}
                    >
                      <MapPin size={15} className="mt-0.5 shrink-0 text-white/40" />
                      <span className="font-medium">{addr}</span>
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddress("new");
                      setAddressInputMode("");
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs transition-all ${
                      selectedAddress === "new"
                        ? "bg-white/5 border-white/30 font-bold"
                        : "bg-black/30 border-white/5 text-white/50 hover:border-white/10"
                    }`}
                  >
                    <PlusIcon size={15} className="mt-0.5 shrink-0" />
                    <span>Use a different address / location...</span>
                  </button>
                </div>
              </div>
            )}

            {(selectedAddress === "new" || !userProfile?.addresses || userProfile.addresses.length === 0) && (
              <div className="space-y-4">
                {addressInputMode === "" ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block font-sans">
                      Select Location Source
                    </label>
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        type="button"
                        onClick={handleFetchLocation}
                        className="w-full py-4 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2 text-xs font-bold transition-all uppercase tracking-wider"
                      >
                        <MapPin size={16} className="text-emerald-400" />
                        <span>Detect My Live Location</span>
                      </button>
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px bg-white/5 flex-1" />
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">OR</span>
                        <div className="h-px bg-white/5 flex-1" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddressInputMode("manual");
                          setCustomAddress("");
                        }}
                        className="w-full py-4 px-4 rounded-xl border border-white/5 bg-black/40 hover:bg-black/60 text-white/80 flex items-center justify-center gap-2 text-xs font-bold transition-all uppercase tracking-wider"
                      >
                        <FileText size={16} className="text-zinc-400" />
                        <span>Enter Address Manually</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block font-sans">
                        {addressInputMode === "live" ? "Detected Live Location" : "Manual Address Details"}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAddressInputMode("");
                          setCustomAddress("");
                        }}
                        className="text-[10px] text-zinc-400 hover:text-white underline font-bold uppercase tracking-wider"
                      >
                        Change Mode
                      </button>
                    </div>
                    
                    <textarea
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      placeholder={
                        addressInputMode === "live"
                          ? "Locating position..."
                          : "Enter complete doorway, floor, society or landmark details..."
                      }
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/30 font-medium h-24 resize-none leading-relaxed"
                    />

                    {userProfile && (
                      <label className="flex items-center gap-2.5 select-none pl-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveAddressToProfile}
                          onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                          className="rounded bg-black border-white/20 text-white focus:ring-0"
                        />
                        <span className="text-[11px] font-bold text-white/50 uppercase tracking-wide">
                          Save this address to profile
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Vehicle Selection Section */}
        <section className="space-y-4">
          <div className="px-1">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">
              Vehicle Config
            </h3>
          </div>

          <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-5 space-y-4">
            {userProfile?.vehicles && userProfile.vehicles.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                  Select Vehicle
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {userProfile.vehicles.map((v) => {
                    const parts = v.split(" | ");
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSelectedVehicleStr(v)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition-all ${
                          selectedVehicleStr === v
                            ? "bg-white/5 border-white/30"
                            : "bg-black/30 border-white/5 text-white/60 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Car size={16} className="text-white/40" />
                          <div>
                            <span className="font-bold block text-white">{parts[0]}</span>
                            <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase mt-0.5 block">{parts[1]}</span>
                          </div>
                        </div>
                        {selectedVehicleStr === v && <CheckCircle2 size={16} className="text-zinc-300" />}
                      </button>
                    );
                  })}
                  
                  <button
                    type="button"
                    onClick={() => setSelectedVehicleStr("new")}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs transition-all ${
                      selectedVehicleStr === "new"
                        ? "bg-white/5 border-white/30 font-bold"
                        : "bg-black/30 border-white/5 text-white/50 hover:border-white/10"
                    }`}
                  >
                    <PlusIcon size={16} />
                    <span>Enter a new vehicle...</span>
                  </button>
                </div>
              </div>
            )}

            {(selectedVehicleStr === "new" || !userProfile?.vehicles || userProfile.vehicles.length === 0) && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-wider">Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Porsche, Audi"
                      value={newVehicleBrand}
                      onChange={(e) => setNewVehicleBrand(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-3.5 text-white text-xs focus:outline-none focus:border-white/30 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-wider">Model (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 911 GT3"
                      value={newVehicleModel}
                      onChange={(e) => setNewVehicleModel(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-3.5 text-white text-xs focus:outline-none focus:border-white/30 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-wider">Plate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. MH 12 AB 9999"
                    value={newVehicleNumber}
                    onChange={(e) => setNewVehicleNumber(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/30 uppercase font-mono font-bold tracking-widest placeholder:normal-case placeholder:tracking-normal"
                  />
                </div>

                {userProfile && (
                  <label className="flex items-center gap-2.5 select-none pl-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveVehicleToProfile}
                      onChange={(e) => setSaveVehicleToProfile(e.target.checked)}
                      className="rounded bg-black border-white/20 text-white focus:ring-0"
                    />
                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-wide">
                      Add to My Registered Vehicles
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Date and Time Slot selection */}
        <section className="space-y-4">
          <div className="px-1">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">
              Schedule washing
            </h3>
          </div>

          <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                Service Date
              </label>
              <div className="relative cursor-pointer" onClick={openDatePicker}>
                <Calendar 
                  size={16} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer z-20 pointer-events-none" 
                />
                <input
                  ref={dateInputRef}
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      (e.target as any).showPicker();
                    } catch (err) {}
                  }}
                  className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/30 font-bold text-left cursor-pointer select-none custom-date-input"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block">
                Time Slot
              </label>
              <div className="grid grid-cols-1 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`flex items-center justify-between p-3 px-4 rounded-xl text-left text-xs font-bold border transition-all ${
                      timeSlot === slot
                        ? "bg-white/5 border-white/30 text-white shadow"
                        : "bg-black/30 border-white/5 text-white/60 hover:border-white/10"
                    }`}
                  >
                    <span>{slot}</span>
                    {timeSlot === slot && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Order Summary box */}
        <section className="space-y-4">
          <div className="px-1">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">
              Order Summary
            </h3>
          </div>

          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-5 space-y-4">
            <div className="border-b border-white/5 pb-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-white font-extrabold text-base block">{state.planName}</span>
                  <span className="text-[10px] tracking-wider text-white/40 font-mono mt-0.5 block uppercase">
                    CATEGORY: {state.category}
                  </span>
                </div>
                <div className="text-lg font-black text-white">
                  ₹{state.amount}
                </div>
              </div>

              {/* Dynamic Vehicle Details Badge Row */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex flex-wrap gap-y-2 items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="font-bold text-white uppercase">Vehicle:</span>
                  <span>
                    {selectedVehicleStr === "new"
                      ? (newVehicleBrand.trim() + (newVehicleModel.trim() ? " " + newVehicleModel.trim() : "")) || "(New Vehicle)"
                      : selectedVehicleStr.split(" | ")[0] || "Registered Vehicle"}
                  </span>
                </div>
                <div className="font-mono bg-white/5 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-lg">
                  {selectedVehicleStr === "new"
                    ? newVehicleNumber.trim().toUpperCase() || "PLATE NO"
                    : selectedVehicleStr.split(" | ")[1] || "PLATE NO"}
                </div>
              </div>


            </div>

            <div className="space-y-2.5 text-xs text-white/60 border-b border-white/5 pb-4">
              <div className="flex justify-between">
                <span>Base Wash Service Charge</span>
                <span>₹{checkoutBase}</span>
              </div>
              <div className="flex justify-between">
                <span>Central GST (9%)</span>
                <span>₹{checkoutCgst}</span>
              </div>
              <div className="flex justify-between">
                <span>State GST (9%)</span>
                <span>₹{checkoutSgst}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-1">
              <span className="text-white/80">Grand Total</span>
              <span className="text-2xl font-black text-white">₹{state.amount}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Persistent Proceed Footer */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6">
        <button
          onClick={handleProceedToPayment}
          className="w-full py-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold tracking-wider transition-all uppercase text-xs flex items-center justify-center gap-2 shadow-lg"
        >
          <span>Continue to Payment</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// Inline support component for adding elements
function PlusIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 16}
      height={size || 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
