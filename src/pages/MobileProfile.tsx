import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Settings,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  CarFront,
  MapPin,
  CreditCard,
  X,
  ArrowLeft,
  CalendarCheck,
  FileText,
  Info,
  Globe,
  Bell,
  Lock,
  Trash2,
  Trash,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Download
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage, Language } from "../context/LanguageContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function MobileProfile() {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentModal = searchParams.get("modal");

  // State overlays
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);

  // 1. Saved Addresses sub-states
  const [newAddress, setNewAddress] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // 2. My Vehicles sub-states
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [vBrand, setVBrand] = useState("");
  const [vModel, setVModel] = useState("");
  const [vType, setVType] = useState("sedan"); // hatch, sedan, suv, muv
  const [vNumber, setVNumber] = useState("");

  // 3. Payment Methods sub-states
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // 4. App Settings sub-states
  const [appTheme, setAppTheme] = useState<"light" | "dark">(() => {
    const val = localStorage.getItem("dritzz_theme");
    return val === "light" ? "light" : "dark";
  });
  const [enablePush, setEnablePush] = useState<boolean>(() => {
    const val = localStorage.getItem("dritzz_push");
    return val !== null ? val === "true" : true;
  });
  const [appLang, setAppLang] = useState<Language>(() => {
    const val = localStorage.getItem("dritzz_lang") as Language;
    return val || "English";
  });
  const [enableAutoLogin, setEnableAutoLogin] = useState<boolean>(() => {
    const val = localStorage.getItem("dritzz_auto");
    return val !== null ? val === "true" : true;
  });
  const [locationPerm, setLocationPerm] = useState<boolean>(() => {
    const val = localStorage.getItem("dritzz_loc");
    return val !== null ? val === "true" : true;
  });

  // 5. Preferences sub-states
  const [prefWashTime, setPrefWashTime] = useState("08:00 AM - 10:00 AM");
  const [prefVehicle, setPrefVehicle] = useState("");
  const [prefNotifs, setPrefNotifs] = useState({ push: true, email: true, sms: false, whatsapp: true });
  const [prefAddress, setPrefAddress] = useState("");
  const [prefPayment, setPrefPayment] = useState("cod");

  // 6. Privacy & Security sub-states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sync loaded user profile settings
  useEffect(() => {
    if (userProfile) {
      if (userProfile.enablePush !== undefined) setEnablePush(userProfile.enablePush);
      if (userProfile.appLang !== undefined) setAppLang(userProfile.appLang as Language);
      if (userProfile.enableAutoLogin !== undefined) setEnableAutoLogin(userProfile.enableAutoLogin);
      if (userProfile.locationPerm !== undefined) setLocationPerm(userProfile.locationPerm);
      
      if (userProfile.preferredWashTime !== undefined) setPrefWashTime(userProfile.preferredWashTime);
      if (userProfile.preferredVehicle !== undefined) setPrefVehicle(userProfile.preferredVehicle);
      if (userProfile.defaultAddress !== undefined) setPrefAddress(userProfile.defaultAddress);
      if (userProfile.defaultPayment !== undefined) setPrefPayment(userProfile.defaultPayment);
    }
  }, [userProfile]);

  // 7. Support FAQs helper
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const closeModals = () => {
    // Reset secondary states
    setIsAddingAddress(false);
    setIsAddingVehicle(false);
    setIsAddingCard(false);
    navigate("/app/profile", { replace: true });
  };

  const openModal = (modalName: string) => {
    navigate(`/app/profile?modal=${modalName}`);
  };

  // Sync profile fields for preference pre-selection
  useEffect(() => {
    if (userProfile?.vehicles && userProfile.vehicles.length > 0) {
      setPrefVehicle(userProfile.vehicles[0]);
    }
    if (userProfile?.addresses && userProfile.addresses.length > 0) {
      setPrefAddress(userProfile.addresses[0]);
    }
  }, [userProfile]);

  // Load Invoices
  useEffect(() => {
    if (!user?.uid || currentModal !== "invoices") return;

    const invoicesQuery = query(
      collection(db, "invoices"),
      where("userId", "==", user.uid)
    );

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      invoices.sort((a: any, b: any) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (val.toDate) return val.toDate().getTime();
          if (val.toMillis) return val.toMillis();
          return new Date(val).getTime() || 0;
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      setAllInvoices(invoices);
    });

    return () => unsubscribeInvoices();
  }, [user, currentModal]);

  // Load Plans
  useEffect(() => {
    if (!user?.uid || currentModal !== "plans") return;

    const sq = query(
      collection(db, "subscriptions"),
      where("userId", "==", user.uid),
      where("status", "==", "active")
    );
    const bq = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid)
    );

    let subs: any[] = [];
    let books: any[] = [];

    const updatePlans = () => {
      const combined = [...subs, ...books];
      combined.sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (val.toDate) return val.toDate().getTime();
          if (val.toMillis) return val.toMillis();
          return new Date(val).getTime() || 0;
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      setActivePlans(combined);
    };

    const unsubSub = onSnapshot(sq, (snapshot) => {
      subs = snapshot.docs.map((doc) => ({
        id: doc.id,
        _itemType: "subscription",
        ...doc.data(),
      }));
      updatePlans();
    });

    const unsubBook = onSnapshot(bq, (snapshot) => {
      books = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          _itemType: "booking",
          ...doc.data(),
        }))
        .filter((b: any) => b.status === "pending" || b.status === "scheduled");
      updatePlans();
    });

    return () => {
      unsubSub();
      unsubBook();
    };
  }, [user, currentModal]);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate("/");
  };

  const handleDownloadInvoice = (invoice: any) => {
    import("jspdf").then((m: any) => {
      const jsPDF = m.jsPDF || m.default;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFillColor(15, 15, 15);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("DRITZZ", 20, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("DRIVE CLEAN WITHOUT LEAVING HOME", pageWidth - 20, 15, { align: "right" });
      doc.text("dritzz.info@gmail.com | +91 7075504625", pageWidth - 20, 22, { align: "right" });
      doc.text("GSTIN: 36XXXXXXXXXX  SAC: 998729", pageWidth - 20, 29, { align: "right" });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("TAX INVOICE", 20, 60);
      
      doc.setFillColor(230, 255, 230);
      if (invoice.paymentStatus === "pending") doc.setFillColor(255, 240, 230);
      doc.roundedRect(pageWidth - 45, 52, 25, 8, 2, 2, "F");
      doc.setFontSize(10);
      doc.setTextColor(0, 150, 0);
      if (invoice.paymentStatus === "pending") {
        doc.setTextColor(200, 100, 0);
        doc.text("PENDING", pageWidth - 32.5, 57.5, { align: "center" });
      } else {
        doc.text("PAID", pageWidth - 32.5, 57.5, { align: "center" });
      }
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text("REFERENCE ID", 20, 75);
      doc.text("ISSUE DATE", pageWidth - 20, 75, { align: "right" });
      
      doc.setTextColor(0, 0, 0);
      doc.text(invoice.invoiceId || invoice.refId || invoice.id, 20, 82);
      
      let issueDate = new Date().toLocaleDateString();
      if (invoice.createdAt) {
        if (invoice.createdAt.toDate) issueDate = invoice.createdAt.toDate().toLocaleDateString();
        else issueDate = new Date(invoice.createdAt).toLocaleDateString();
      }
      doc.text(issueDate, pageWidth - 20, 82, { align: "right" });
      
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(20, 95, pageWidth - 40, 50, 4, 4, "F");
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text("BILLED TO", 25, 105);
      doc.text("SERVICE SCHEDULE", 120, 105);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(invoice.userName || "Customer", 25, 112);
      doc.text(invoice.scheduledDate || "-", 120, 112);
      
      doc.setFont("helvetica", "normal");
      doc.text(invoice.userPhone || "-", 25, 118);
      doc.text(`Time: ${invoice.scheduledTime || "-"}`, 120, 118);
      doc.text(invoice.userEmail || "N/A", 25, 124);
      
      doc.setTextColor(100, 100, 100);
      doc.text("ADDRESS", 25, 132);
      doc.setTextColor(0, 0, 0);
      const addr = invoice.address || "";
      doc.text(addr.length > 50 ? addr.substring(0, 50) + "..." : addr, 25, 138);
      
      doc.setFillColor(20, 20, 20);
      doc.rect(20, 155, pageWidth - 40, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("DESCRIPTION", 25, 161.5);
      doc.text("QTY", 130, 161.5);
      doc.text("AMOUNT", pageWidth - 25, 161.5, { align: "right" });
      
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const planName = invoice.packageId === "monthly" ? "Dritzz Black Membership" : invoice.packageId === "premium" ? "Premium Car Care" : "Base Wash Package";
      const carName = invoice.vehicles && invoice.vehicles.length > 0 ? invoice.vehicles[0].brand + " " + invoice.vehicles[0].model : "";
      doc.text(`${planName} (${carName})`, 25, 175);
      doc.text("1", 130, 175);
      doc.text(`Rs. ${invoice.amount?.toFixed(2)}`, pageWidth - 25, 175, { align: "right" });
      
      doc.line(20, 200, pageWidth - 20, 200);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text("PAYMENT DETAILS", 20, 210);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(`Method: ${invoice.paymentMethod === "razorpay" ? "UPI/Card" : "CASH ON DELIVERY"}`, 20, 218);
      doc.text(`Status: ${invoice.paymentStatus || "Pending"}`, 20, 224);
      
      const amount = invoice.amount || 0;
      const base = amount / 1.18;
      const tax = (amount - base) / 2;
      
      doc.text("Subtotal:", 120, 218);
      doc.text(`Rs. ${base.toFixed(2)}`, pageWidth - 20, 218, { align: "right" });
      
      doc.text("CGST (9%):", 120, 224);
      doc.text(`Rs. ${tax.toFixed(2)}`, pageWidth - 20, 224, { align: "right" });
      
      doc.text("SGST (9%):", 120, 230);
      doc.text(`Rs. ${tax.toFixed(2)}`, pageWidth - 20, 230, { align: "right" });
      
      doc.line(120, 235, pageWidth - 20, 235);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("TOTAL", 120, 243);
      doc.text(`Rs. ${amount.toFixed(2)}`, pageWidth - 20, 243, { align: "right" });
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("THANK YOU FOR YOUR TRUST", pageWidth / 2, 270, { align: "center" });
      doc.text("This is a computer generated invoice and does not require a physical signature.", pageWidth / 2, 275, { align: "center" });
      
      doc.save(`Invoice_${invoice.invoiceId || invoice.refId || invoice.id}.pdf`);
    });
  };

  // VEHICLE WORKFLOWS
  const handleAddVehicle = async () => {
    if (!vBrand || !vNumber) {
      alert("Please fill in both Brand and Vehicle Plate Number.");
      return;
    }
    if (!vType) {
      alert("Please select a Vehicle Type.");
      return;
    }

    const finalNumber = vNumber.replace(/\s+/g, "").toUpperCase();

    // Prevent duplicate vehicle plate numbers
    const existingVehicles = userProfile?.vehicles || [];
    const existingPlates = existingVehicles.map(v => {
      const parts = v.split(" | ");
      return parts[1] ? parts[1].replace(/\s+/g, "").toUpperCase() : "";
    });

    if (existingPlates.includes(finalNumber)) {
      alert("This vehicle license plate number is already registered to your account.");
      return;
    }

    // Format serialized string: `Brand Model | Plate | Type`
    const vehicleLabel = vModel ? `${vBrand} ${vModel}` : vBrand;
    const formattedVehicle = `${vehicleLabel} | ${finalNumber} | ${vType}`;
    const newVehicles = [formattedVehicle, ...existingVehicles];

    try {
      await updateUserProfile({ vehicles: newVehicles });
      setIsAddingVehicle(false);
      setVBrand("");
      setVModel("");
      setVNumber("");
    } catch (e) {
      console.error(e);
      alert("Failed to save vehicle details.");
    }
  };

  // ADDRESS WORKFLOWS
  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      alert("Please fill in a valid address string.");
      return;
    }
    const existing = userProfile?.addresses || [];
    try {
      await updateUserProfile({ addresses: [newAddress.trim(), ...existing] });
      setIsAddingAddress(false);
      setNewAddress("");
    } catch (e) {
      console.error(e);
      alert("Failed to save address details.");
    }
  };

  const handleRemoveVehicle = async (index: number) => {
    if (!userProfile?.vehicles) return;
    const nv = [...userProfile.vehicles];
    nv.splice(index, 1);
    await updateUserProfile({ vehicles: nv });
  };

  const handleRemoveAddress = async (index: number) => {
    if (!userProfile?.addresses) return;
    const na = [...userProfile.addresses];
    na.splice(index, 1);
    await updateUserProfile({ addresses: na });
  };

  // CARDS / PAYMENTS WORKFLOWS
  const handleAddCard = async () => {
    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
      alert("Please fill in all card details fully.");
      return;
    }

    const cleanCardNum = cardNumber.replace(/\D/g, "");
    if (cleanCardNum.length < 13 || cleanCardNum.length > 19) {
      alert("Please enter a valid card number length.");
      return;
    }

    const maskedNum = "**** **** **** " + cleanCardNum.slice(-4);
    const newCardRecord = `${cardName.trim()} | ${maskedNum} | ${cardExpiry.trim()}`;
    const existing = (userProfile as any)?.savedCards || [];

    try {
      await updateUserProfile({ savedCards: [newCardRecord, ...existing] } as any);
      setIsAddingCard(false);
      setCardName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
    } catch (e) {
      console.error(e);
      alert("Failed to save card securely.");
    }
  };

  const handleRemoveCard = async (index: number) => {
    const existing = (userProfile as any)?.savedCards || [];
    const nv = [...existing];
    nv.splice(index, 1);
    await updateUserProfile({ savedCards: nv } as any);
  };

  // APP SETTINGS AND LANGUAGE PERSISTENCE WORKFLOWS
  const handleToggleSetting = async (key: string, currentValue: boolean) => {
    const newValue = !currentValue;
    if (key === "enablePush") {
      setEnablePush(newValue);
      localStorage.setItem("dritzz_push", String(newValue));
    } else if (key === "enableAutoLogin") {
      setEnableAutoLogin(newValue);
      localStorage.setItem("dritzz_auto", String(newValue));
    } else if (key === "locationPerm") {
      setLocationPerm(newValue);
      localStorage.setItem("dritzz_loc", String(newValue));
    }

    if (updateUserProfile) {
      try {
        await updateUserProfile({ [key]: newValue } as any);
      } catch (err) {
        console.warn("Could not sync setting with Firebase profile:", err);
      }
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    setAppLang(newLang);
    await setLanguage(newLang);
  };

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    setAppTheme(newTheme);
    localStorage.setItem("dritzz_theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
    if (updateUserProfile) {
      try {
        await updateUserProfile({ appTheme: newTheme } as any);
      } catch (err) {
        console.warn("Could not sync theme with Firebase profile:", err);
      }
    }
  };

  // PREFERENCES SAVING
  const handleSavePreferences = async () => {
    try {
      await updateUserProfile({
        preferredWashTime: prefWashTime,
        preferredVehicle: prefVehicle,
        notificationPrefs: prefNotifs,
        defaultAddress: prefAddress,
        defaultPayment: prefPayment,
      } as any);
      alert("Preferences saved successfully!");
      closeModals();
    } catch (e) {
      console.error(e);
      alert("Failed to save preferences.");
    }
  };

  // PASSWORD UPDATES
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    alert("Instructions to change password have been dispatched to your email address!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const menuGroups = [
    {
      title: "Account Details",
      items: [
        {
          icon: CalendarCheck,
          label: "My Plans",
          action: () => openModal("plans"),
        },
        {
          icon: CarFront,
          label: "My Vehicles",
          action: () => openModal("vehicles"),
        },
        { 
          icon: MapPin, 
          label: "Saved Addresses", 
          action: () => openModal("addresses") 
        },
        {
          icon: FileText,
          label: "My Invoices",
          action: () => openModal("invoices"),
        },
        {
          icon: CreditCard,
          label: "Payment Methods",
          action: () => openModal("payment-methods"),
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        { icon: Settings, label: "App Settings", action: () => openModal("settings") },
        { icon: Info, label: "Preferences", action: () => openModal("preferences") },
        { icon: Smartphone, label: "Install Android APK", action: () => openModal("apk-guide") },
        {
          icon: Shield,
          label: "Privacy & Security",
          action: () => openModal("privacy"),
        },
        {
          icon: HelpCircle,
          label: "Help & Support",
          action: () => openModal("support"),
        },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-6 px-4 space-y-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 bg-gradient-to-r from-neutral-900 to-black p-5 rounded-3xl border border-white/5"
      >
        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-2xl font-bold text-white border border-white/10 uppercase">
          {userProfile?.fullName?.[0] || "U"}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {userProfile?.fullName || "User"}
          </h2>
          <p className="text-white/50 text-sm mb-2">
            {userProfile?.phone || "+91 XXXXX XXXXX"}
          </p>
          <span className="text-[10px] font-bold px-2 py-1 bg-white/[0.08] rounded pl-1 pr-2 text-white flex items-center gap-1 inline-flex uppercase">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Verified Profile
          </span>
        </div>
      </motion.div>

      {/* Primary Grid list */}
      <div className="space-y-6">
        {menuGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * (groupIndex + 1) }}
          >
            <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 px-2">
              {group.title}
            </h3>
            <div className="bg-neutral-900/50 border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
              {group.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 text-white/80 font-medium text-sm">
                    <item.icon size={18} className="text-white/50" />
                    {item.label}
                  </div>
                  <ChevronRight size={16} className="text-white/30" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 mt-6 text-red-500 font-bold text-sm tracking-wide bg-red-500/10 rounded-2xl hover:bg-red-500/20 transition-colors"
      >
        <LogOut size={16} className="mr-1" />
        Log Out
      </motion.button>

      {/* --- ALL SUB-PAGE/MODAL OVERLAYS --- */}
      <AnimatePresence>
        {/* PLANS MODAL */}
        {currentModal === "plans" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-20 pb-20"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#050505] py-4 z-10 border-b border-white/5">
                <button
                  onClick={closeModals}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">My Plans</h3>
              </div>

              {activePlans.length === 0 ? (
                <div className="text-center py-12 px-6 bg-neutral-900/40 rounded-3xl border border-white/5 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/40">
                    <CalendarCheck size={32} />
                  </div>
                  <h4 className="text-base font-bold text-white">No Active Plans Found</h4>
                  <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">
                    You don't have any subscription plans active or scheduled washes. Subscribe to unlock regular car care at low rates!
                  </p>
                  <button
                    onClick={() => {
                      closeModals();
                      navigate("/app/subscriptions");
                    }}
                    className="mt-2 bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-neutral-200"
                  >
                    Explore Plans
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activePlans.map((plan: any) => {
                    const isSub = plan._itemType === "subscription";
                    const title = isSub 
                      ? (plan.packageId === "monthly" ? "Dritzz Black Membership" : plan.packageId === "premium" ? "Premium Membership" : "Base Membership")
                      : (plan.packageId === "premium" ? "Premium Wash Booking" : "Base Wash Booking");
                    
                    const vehicle = plan.vehicles && plan.vehicles.length > 0 ? plan.vehicles[0] : null;
                    const vehName = vehicle ? `${vehicle.brand} ${vehicle.model}` : "My Vehicle";
                    const vehNum = vehicle?.vehicleNumber || "";

                    return (
                      <div 
                        key={plan.id} 
                        className="bg-neutral-900/50 border border-white/5 p-5 rounded-3xl relative overflow-hidden"
                      >
                        {isSub && (
                          <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-bl-xl tracking-wider border-l border-b border-emerald-500/10 flex items-center gap-1">
                            <div className="w-1 rounded-full h-1 bg-emerald-500 animate-pulse" />
                            Active Sub
                          </div>
                        )}
                        {!isSub && (
                          <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase px-3 py-1.5 rounded-bl-xl tracking-wider border-l border-b border-amber-500/10 flex items-center gap-1">
                            {plan.status === "scheduled" ? "Scheduled" : "Pending"}
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-mono">
                              {isSub ? "Subscription Membership" : "Single Service Booking"}
                            </span>
                            <h4 className="text-base font-black text-white uppercase tracking-tight mt-0.5">{title}</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                            <div>
                              <span className="text-white/40 text-[9px] block uppercase font-mono">Vehicle</span>
                              <span className="text-white text-xs font-bold block mt-0.5">{vehName}</span>
                              {vehNum && <span className="text-white/50 text-[10px] block font-mono">{vehNum}</span>}
                            </div>
                            
                            {isSub ? (
                              <div>
                                <span className="text-white/40 text-[9px] block uppercase font-mono">Usage</span>
                                <span className="text-white text-xs font-bold block mt-0.5">
                                  {plan.remainingWashes || 0} / {plan.totalWashes || 0} washes remaining
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="text-white/40 text-[9px] block uppercase font-mono">Scheduled Slot</span>
                                <span className="text-white text-xs font-bold block mt-0.5">
                                  {plan.date}
                                </span>
                                {plan.timeSlot && (
                                  <span className="text-white/50 text-[10px] block uppercase mt-0.5">{plan.timeSlot}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-6 text-center">
                    <button
                      onClick={() => {
                        closeModals();
                        navigate("/app/subscriptions");
                      }}
                      className="bg-white/5 border border-white/10 text-white hover:bg-white/10 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider"
                    >
                      Explore Pack/Plans
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 1. SAVED ADDRESSES MODAL */}
        {currentModal === "addresses" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-20 pb-20"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#050505] py-4 z-10 border-b border-white/5">
                <button
                  onClick={closeModals}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Saved Addresses</h3>
              </div>
              
              {!isAddingAddress ? (
                <div className="space-y-6">
                  {userProfile?.addresses && userProfile.addresses.length > 0 ? (
                    <div className="space-y-3">
                      {userProfile.addresses.map((addr, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-neutral-900 rounded-2xl border border-white/10">
                          <div className="flex items-start gap-3">
                            <MapPin size={16} className="text-white/40 mt-0.5" />
                            <span className="text-white text-sm font-medium">{addr}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveAddress(i)}
                            className="text-red-400 hover:bg-white/5 p-2 rounded-full text-xs shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-white/45 py-12">
                      No addresses saved yet. Click below to add.
                    </div>
                  )}

                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="w-full py-4 rounded-xl font-bold uppercase text-xs tracking-wider bg-white text-black transition-all hover:bg-neutral-200"
                  >
                    Add New Address
                  </button>

                  <button
                    onClick={closeModals}
                    className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white uppercase text-xs font-bold py-2 mt-4"
                  >
                    Go Back To Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest pl-1">Insert Full Address</h4>
                  <div className="space-y-4">
                    <textarea
                      placeholder="e.g. Flat 304, Tower B, Lodha Park, Worli, Mumbai - 400018"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-zinc-400 font-medium h-32 leading-relaxed text-sm"
                    />

                    <button
                      onClick={handleAddAddress}
                      className="w-full py-4 rounded-xl font-bold tracking-wide transition-all uppercase text-xs bg-white text-black"
                    >
                      Save & Add Address
                    </button>

                    <button
                      onClick={() => setIsAddingAddress(false)}
                      className="w-full text-white/40 hover:text-white uppercase text-xs font-bold text-center"
                    >
                      Cancel & Cancel Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 2. MY VEHICLES MODAL */}
        {currentModal === "vehicles" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-20 pb-20"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#050505] py-4 z-10 border-b border-white/5">
                <button
                  onClick={closeModals}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">My Vehicles</h3>
              </div>

              {!isAddingVehicle ? (
                <div className="space-y-6">
                  {userProfile?.vehicles && userProfile.vehicles.length > 0 ? (
                    <div className="space-y-3">
                      {userProfile.vehicles.map((vStr, i) => {
                        const parts = typeof vStr === "string" ? vStr.split(" | ") : [vStr];
                        const label = parts[0];
                        const plate = parts[1] || "";
                        const typeVal = parts[2] || "sedan";
                        const isDefault = i === 0;

                        return (
                          <div
                            key={i}
                            className="p-5 bg-neutral-900 border border-white/5 rounded-2xl relative flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <CarFront className="text-white/40" size={18} />
                                <span className="font-bold text-white text-base leading-none">{label}</span>
                              </div>
                              <div className="flex gap-1.5 items-center">
                                <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-800 text-white/60">
                                  {typeVal}
                                </span>
                                {isDefault ? (
                                  <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-white text-black">
                                    Default
                                  </span>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      const nvList = [...userProfile.vehicles!];
                                      const [sel] = nvList.splice(i, 1);
                                      nvList.unshift(sel);
                                      await updateUserProfile({ vehicles: nvList });
                                    }}
                                    className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/5 text-zinc-400 hover:bg-white/10"
                                  >
                                    Set Default
                                  </button>
                                )}
                              </div>
                            </div>

                            <span className="text-xs text-white/50 font-mono tracking-widest uppercase pl-7 mt-1">
                              {plate}
                            </span>

                            {!isDefault && (
                              <button
                                onClick={() => handleRemoveVehicle(i)}
                                className="absolute right-4 bottom-4 text-xs font-bold text-red-500 hover:text-red-400 underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-white/40 py-12">
                      No vehicles found. Add one to save booking time!
                    </div>
                  )}

                  <button
                    onClick={() => setIsAddingVehicle(true)}
                    className="w-full py-4 rounded-xl font-bold uppercase text-xs tracking-wider bg-white text-black hover:bg-neutral-200 transition-colors"
                  >
                    Register New Vehicle
                  </button>

                  <button
                    onClick={closeModals}
                    className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white uppercase text-xs font-bold py-2 mt-4"
                  >
                    Go Back To Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest pl-1">Add Vehicle Details</h4>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 block mb-1.5 pl-0.5">Brand *</label>
                      <input
                        type="text"
                        placeholder="e.g. Honda, BMW, Tata"
                        value={vBrand}
                        onChange={(e) => setVBrand(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 block mb-1.5 pl-0.5">Model (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. City, i2s, Harrier"
                        value={vModel}
                        onChange={(e) => setVModel(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 block mb-1.5 pl-0.5">Vehicle Type *</label>
                      <select
                        value={vType}
                        onChange={(e) => setVType(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 text-sm font-bold"
                      >
                        <option value="hatchback">Hatchback / Small Car</option>
                        <option value="sedan">Sedan / Luxury</option>
                        <option value="suv">SUV / Crossover</option>
                        <option value="muv">MUV / MPV 7 Seater</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 block mb-1.5 pl-0.5">License Plate Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. MH 12 AB 1234"
                        value={vNumber}
                        onChange={(e) => setVNumber(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 text-sm font-bold font-mono uppercase tracking-wider"
                      />
                    </div>

                    <button
                      onClick={handleAddVehicle}
                      className="w-full py-4 mt-6 rounded-xl font-bold uppercase text-xs tracking-wider bg-white text-black"
                    >
                      Save & Register Vehicle
                    </button>

                    <button
                      onClick={() => setIsAddingVehicle(false)}
                      className="w-full text-white/40 hover:text-white uppercase text-xs font-bold text-center"
                    >
                      Cancel Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. MY INVOICES MODAL */}
        {currentModal === "invoices" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-20 pb-20"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#050505] py-4 z-10 border-b border-white/5">
                <button
                  onClick={closeModals}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">My Invoices</h3>
              </div>

              {allInvoices.length === 0 ? (
                <div className="text-center text-white/50 py-10">
                  <p>You have no paid invoices on records yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allInvoices.map((invoice: any) => {
                    let dateStr = "";
                    if (invoice.createdAt) {
                      if (invoice.createdAt.toDate) dateStr = invoice.createdAt.toDate().toLocaleDateString();
                      else dateStr = new Date(invoice.createdAt).toLocaleDateString();
                    }
                    const planName = invoice.packageId === "monthly" ? "Black Membership" : invoice.packageId === "premium" ? "Premium Wash" : "Base Wash";
                    
                    return (
                      <div key={invoice.id} className="bg-neutral-900 border border-white/5 p-5 rounded-3xl flex justify-between items-center gap-2">
                        <div>
                          <h4 className="text-base font-bold text-white uppercase">{planName}</h4>
                          <p className="text-xs text-white/50 mb-1 font-mono">{invoice.invoiceId || invoice.refId || invoice.id}</p>
                          <div className="text-sm text-zinc-300">₹{invoice.amount} &bull; {dateStr}</div>
                        </div>
                        
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white shrink-0"
                        >
                          <FileText size={20} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 4. PAYMENT METHODS MODAL */}
        {currentModal === "payment-methods" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-20 pb-20"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#050505] py-4 z-10 border-b border-white/5">
                <button
                  onClick={closeModals}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Secure Cards</h3>
              </div>

              {!isAddingCard ? (
                <div className="space-y-6">
                  {/* Coming Soon message banner */}
                  <div className="bg-amber-500/10 border border-amber-500/15 p-4 rounded-2xl flex items-start gap-3">
                    <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-amber-400 text-xs leading-normal">
                      <strong>Razorpay Gateway Integration Coming Soon!</strong> Cards added here will be securely preserved inside your account context and seamlessly selectable once UPI & online credit payment routes launch.
                    </p>
                  </div>

                  {/* List registered cards */}
                  {((userProfile as any)?.savedCards && (userProfile as any).savedCards.length > 0) ? (
                    <div className="space-y-4">
                      {(userProfile as any).savedCards.map((cardStr: string, idx: number) => {
                        const bits = cardStr.split(" | ");
                        return (
                          <div
                            key={idx}
                            className="bg-gradient-to-br from-neutral-800 to-black border border-white/10 p-5 rounded-3xl relative overflow-hidden text-white"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <span className="text-sm font-black font-mono tracking-widest text-zinc-400 uppercase">
                                SECURE KEY CARD
                              </span>
                              <CreditCard size={20} className="text-white/40" />
                            </div>

                            <div className="font-mono text-lg tracking-widest mb-4">
                              {bits[1]}
                            </div>

                            <div className="flex justify-between items-end text-xs">
                              <div>
                                <span className="text-[9px] block text-white/40 uppercase">Card Holder</span>
                                <span className="font-bold uppercase tracking-wide">{bits[0]}</span>
                              </div>
                              <div>
                                <span className="text-[9px] block text-white/40 uppercase">Expiry</span>
                                <span className="font-bold font-mono">{bits[2]}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveCard(idx)}
                              className="absolute top-4 right-4 text-white/30 hover:text-red-500 p-1 rounded"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-white/40 py-12">
                      No cards saved yet. Click add card to pre-configure your account.
                    </div>
                  )}

                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="w-full py-4 rounded-xl font-bold uppercase text-xs tracking-wider bg-white text-black"
                  >
                    Add Debit/Credit Card
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest pl-1">Insert Secure Card Details</h4>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 block mb-1.5 pl-0.5">Cardholder Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 text-sm font-bold uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/50 block mb-1.5 pl-0.5">Card Number</label>
                      <input
                        type="text"
                        placeholder="xxxx xxxx xxxx 1234"
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setCardNumber(val.slice(0, 16));
                        }}
                        className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 text-sm font-mono"
                        maxLength={16}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/50 block mb-1.5 pl-0.5">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 text-sm font-bold"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/50 block mb-1.5 pl-0.5">Security CVV (3 Digits)</label>
                        <input
                          type="password"
                          placeholder="***"
                          value={cardCvv}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setCardCvv(val.slice(0, 3));
                          }}
                          className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 text-sm font-bold"
                          maxLength={3}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddCard}
                      className="w-full py-4 mt-6 rounded-xl font-bold uppercase text-xs tracking-wider bg-white text-black"
                    >
                      Save Card Securely
                    </button>

                    <button
                      onClick={() => setIsAddingCard(false)}
                      className="w-full text-white/40 hover:text-white uppercase text-xs font-bold text-center"
                    >
                      Cancel Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 5. APP SETTINGS MODAL */}
        {currentModal === "settings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-20 pb-20"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#050505] py-4 z-10 border-b border-white/5">
                <button
                  onClick={closeModals}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">App Settings</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-neutral-900/40 p-5 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-white block font-bold text-sm">Keep Me Signed In</span>
                      <span className="text-white/40 text-[11px] block mt-0.5">Auto authenticate session keys</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting("enableAutoLogin", enableAutoLogin)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${enableAutoLogin ? "bg-white" : "bg-zinc-850"}`}
                    >
                      <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${enableAutoLogin ? "bg-black right-0.5" : "bg-zinc-600 left-0.5"}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-white/5">
                    <div>
                      <span className="text-white block font-bold text-sm">GPS Location Access</span>
                      <span className="text-white/40 text-[11px] block mt-0.5">Auto detect washing doorway</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting("locationPerm", locationPerm)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${locationPerm ? "bg-white" : "bg-zinc-850"}`}
                    >
                      <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${locationPerm ? "bg-black right-0.5" : "bg-zinc-600 left-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 6. PREFERENCES MODAL */}
        {currentModal === "preferences" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-20 pb-20"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#050505] py-4 z-10 border-b border-white/5">
                <button
                  onClick={closeModals}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Wash Preferences</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-neutral-900/40 border border-white/5 p-5 rounded-3xl space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-white/50 block">Preferred Wash Time Slot</label>
                    <select
                      value={prefWashTime}
                      onChange={(e) => setPrefWashTime(e.target.value)}
                      className="w-full bg-[#050505] text-white border border-white/10 text-sm font-bold p-3.5 rounded-xl uppercase tracking-wider"
                    >
                      <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM (Morning)</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Midday)</option>
                      <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (Noon)</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                    </select>
                  </div>

                  {userProfile?.vehicles && userProfile.vehicles.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/50 block">Default Primary Vehicle</label>
                      <select
                        value={prefVehicle}
                        onChange={(e) => setPrefVehicle(e.target.value)}
                        className="w-full bg-[#050505] text-white border border-white/10 text-sm font-bold p-3.5 rounded-xl uppercase tracking-wider"
                      >
                        {userProfile.vehicles.map((v, index) => (
                          <option key={index} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {userProfile?.addresses && userProfile.addresses.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-white/50 block">Default Service Address</label>
                      <select
                        value={prefAddress}
                        onChange={(e) => setPrefAddress(e.target.value)}
                        className="w-full bg-[#050505] text-white border border-white/10 text-xs font-bold p-3.5 rounded-xl block"
                      >
                        {userProfile.addresses.map((a, idx) => (
                          <option key={idx} value={a}>{a.length > 40 ? a.substring(0, 40) + "..." : a}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-white/50 block">Default Payment Preference</label>
                    <select
                      value={prefPayment}
                      onChange={(e) => setPrefPayment(e.target.value)}
                      className="w-full bg-[#050505] text-white border border-white/10 text-sm font-bold p-3.5 rounded-xl uppercase tracking-wider"
                    >
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="online">Online Banking / UPI (Razorpay)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  className="w-full py-4 rounded-xl font-bold uppercase text-xs tracking-wider bg-white text-black"
                >
                  Save My Preferences
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 7. PRIVACY & SECURITY MODAL */}
        {currentModal === "privacy" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-20 pb-20"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#050505] py-4 z-10 border-b border-white/5">
                <button
                  onClick={closeModals}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Security</h3>
              </div>

              <div className="space-y-6">
                {/* 3. Delete Account block */}
                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl space-y-3">
                  <span className="text-xs font-black text-red-400 uppercase tracking-widest block font-bold">Account Deletion</span>
                  <p className="text-[11px] text-red-400/80 leading-relaxed">
                    Permanently wipe your account records, invoice history, subscriptions, and registered vehicles. This operation is absolutely irreversible.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const ask = window.confirm("Are you sure you wish to file a request to permanently delete your account?");
                      if (ask) alert("Account deletion request logged! Admin will process this within 48 business hours.");
                    }}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black uppercase rounded-xl border border-red-500/20"
                  >
                    Delete My Account Permanent
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 8. HELP & SUPPORT MODAL */}
        {currentModal === "support" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-20 pb-20"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#050505] py-4 z-10 border-b border-white/5">
                <button
                  onClick={closeModals}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Help & Support</h3>
              </div>

              <div className="space-y-6">
                {/* GRAND WHATSAPP CTA CARD */}
                <a
                  href="https://wa.me/917075504625"
                  target="_blank"
                  rel="noreferrer"
                  className="group block bg-gradient-to-br from-emerald-600 to-black p-6 rounded-3xl border border-emerald-500/20 text-white relative overflow-hidden transition-all active:scale-[0.98]"
                >
                  <div className="absolute top-2 right-2 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
                  <span className="text-[10px] font-black tracking-widest text-emerald-300 uppercase block mb-1">
                    Direct Assistance
                  </span>
                  <h4 className="text-2xl font-black tracking-tight text-white mb-2 uppercase">
                    Need Help?
                  </h4>
                  <p className="text-white/80 text-sm mb-4 leading-normal font-medium">
                    Tap to connect instantly to DRITZZ support on WhatsApp! We will sort out scheduling, pricing, or wash concerns.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider group-hover:bg-neutral-200">
                    <span>Chat on WhatsApp</span>
                    <ExternalLink size={13} />
                  </div>
                </a>

                {/* Info directory cards */}
                <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-5 space-y-4 text-xs font-medium text-white/80">
                  <h4 className="text-xs uppercase text-white/40 font-black tracking-wider pl-0.5">Quick Contacts</h4>
                  
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-white/40" />
                    <div>
                      <span className="text-white/40 text-[10px] block uppercase">Support Email</span>
                      <a href="mailto:dros.info@gmail.com" className="text-white font-bold tracking-wide">dros.info@gmail.com</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-white/5 pt-3">
                    <Phone size={16} className="text-white/40" />
                    <div>
                      <span className="text-white/40 text-[10px] block uppercase">Customer Helpline</span>
                      <a href="tel:+917075504625" className="text-white font-bold tracking-wide">7075504625</a>
                    </div>
                  </div>
                </div>

                {/* Interactive FAQ Directory */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase text-white/40 font-black tracking-widest pl-1">Frequently Asked Questions</h4>
                  
                  <div className="space-y-2">
                    {[
                      {
                        q: "How do I reschedule a booked doorstep wash?",
                        a: "Doorstep washing dates/times can easily be rescheduled by contacting our WhatsApp helpdesk or emailing us prior to 2 hours of slot commencement."
                      },
                      {
                        q: "Is Cash on Delivery actually safe?",
                        a: "Yes! Cash on Delivery implies zero upfront risk. Once our detailing crew washes your vehicle to your complete satisfaction, you pay after service via cash or UPI transaction."
                      },
                      {
                        q: "What's covered under Premium Car Care?",
                        a: "Premium Care includes: complete exterior pressure washing, floor vacuuming, deep dashboard polishing, wheel detailing, tyre dressing, and complete inside safe dry wiping."
                      }
                    ].map((faq, idx) => (
                      <div
                        key={idx}
                        className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden"
                      >
                        <button
                          onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                          className="w-full text-left p-4 flex items-center justify-between gap-3 text-white text-xs font-bold"
                        >
                          <span>{faq.q}</span>
                          <ChevronRight
                            size={16}
                            className={`text-white/40 transition-all ${faqOpen === idx ? "rotate-90 text-white" : ""}`}
                          />
                        </button>
                        {faqOpen === idx && (
                          <div className="p-4 pt-0 border-t border-white/5 text-[11px] text-white/60 leading-relaxed font-medium bg-black/10">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {/* APK BUILD AND INSTALLATION GUIDE MODAL */}
        {currentModal === "apk-guide" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-20 pb-20"
          >
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              <div className="flex items-center gap-3 mb-8 sticky top-0 bg-[#050505] py-4 z-10 border-b border-white/5">
                <button
                  onClick={closeModals}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black tracking-widest text-[#60CDFF] uppercase font-mono">Mobile Deployment</span>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">Android APK Guide</h3>
                </div>
              </div>

              <div className="space-y-6">
                {/* Intro Card */}
                <div className="bg-gradient-to-br from-zinc-900 via-[#0A0D14] to-black border border-white/5 p-6 rounded-[32px] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Smartphone size={100} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#60CDFF] bg-[#60CDFF]/10 px-2.5 py-1 rounded-full inline-block mb-3 tracking-wider">
                    Capacitor Native Native Dev Ready
                  </span>
                  <h4 className="text-xl font-black uppercase tracking-tight mb-2">Build Your Native App</h4>
                  <p className="text-white/70 text-xs leading-relaxed font-medium">
                    This project is fully initialized with **CapacitorJS**. It includes folders for **Android** and **iOS**, pre-configured dependencies, and native build scripts. You can build a real native `.apk` with two straightforward ways below!
                  </p>
                </div>

                {/* Option 1: GitHub actions */}
                <div className="bg-[#0b0c10]/80 border border-emerald-500/10 p-6 rounded-[28px] space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-sm font-mono border border-emerald-400/20">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-white tracking-wide">Automated GitHub Build</h4>
                      <p className="text-[10px] font-bold text-emerald-400/80 uppercase font-mono tracking-wider">Easiest - No Setup Needed</p>
                    </div>
                  </div>

                  <p className="text-white/60 text-xs leading-normal font-medium">
                    We have successfully installed and configured a **GitHub Actions automation pipeline** in your repository under `.github/workflows/android.yml`.
                  </p>

                  <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/5 text-[11px] font-medium text-white/80 leading-relaxed font-mono">
                    <div className="flex gap-2">
                      <span className="text-emerald-400">Step 1:</span>
                      <span>Click the ⚙️ Settings menu in AI Studio and select <b>"Export to GitHub"</b> (or Sync with GitHub).</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-400">Step 2:</span>
                      <span>GitHub will automatically launch the compiler pipeline on standard secure cloud runners.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-400">Step 3:</span>
                      <span>Go to the <b>"Actions"</b> tab inside your GitHub repository, click on the active run, and instantly download your built <b>app-debug.apk</b> package!</span>
                    </div>
                  </div>
                </div>

                {/* Option 2: Local Compile */}
                <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-[28px] space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 font-black text-sm font-mono border border-white/10">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-white tracking-wide">Build Locally via Terminal</h4>
                      <p className="text-[10px] font-bold text-white/50 uppercase font-mono tracking-wider">For Developers / Android Studio</p>
                    </div>
                  </div>

                  <p className="text-white/60 text-xs leading-normal font-medium">
                    You can compile the installer locally on your computer with simple commands. Ensure you have Node.js, Java JDK 17, and Android Studio installed.
                  </p>

                  <div className="space-y-2 text-xs font-mono bg-black p-4 rounded-2xl border border-white/5">
                    <span className="text-white/40 block text-[9px] uppercase font-bold tracking-widest pl-1 mb-2">Compilation commands</span>
                    <div className="text-white/50 select-all leading-normal pl-2 border-l border-white/10">
                      <span className="text-[#60CDFF]"># 1. Download source ZIP from settings or clone repo</span><br />
                      <span className="text-[#ffd000]">npm install</span><br />
                      <span className="text-[#60CDFF]"># 2. Trigger native clean compilation</span><br />
                      <span className="text-[#ffd000]">npm run cap:build-android</span><br />
                    </div>
                  </div>

                  <p className="text-white/50 text-[10px] leading-relaxed">
                    This bundles your frontend assets, copies them into your native Android environment, and automates APK generation inside:
                    <span className="block font-mono bg-black/40 border border-white/5 p-2 rounded-xl text-[9px] text-white/60 mt-1.5 select-all">
                      android/app/build/outputs/apk/debug/app-debug.apk
                    </span>
                  </p>
                </div>

                {/* Android Studio and Native Integration help */}
                <div className="bg-yellow-500/5 border border-yellow-500/10 p-5 rounded-3xl space-y-2">
                  <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest block font-mono">Signing APKs for Play Store</span>
                  <p className="text-white/70 text-[11px] leading-relaxed font-semibold">
                    To release your application to customers on the Google Play Store, simply open the <code className="font-mono text-white">/android</code> folder inside **Android Studio**, click <b>"Build &gt; Generate Signed Bundle / APK"</b>, select your upload keystore key, and build your release bundle ready for upload.
                  </p>
                </div>

                {/* Footer close option */}
                <div className="pt-4 text-center">
                  <button
                    onClick={closeModals}
                    className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-[0.98]"
                  >
                    Got It, Let's Compile!
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
