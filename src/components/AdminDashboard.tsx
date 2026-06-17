import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  Mail,
  Lock,
  LogIn,
  ArrowRight,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Car,
  Search,
  Phone,
  Plus,
  Minus,
  X,
  Trash2,
  Download,
  FileText,
  MapPin,
  Navigation,
  Gem,
  LayoutList,
} from "lucide-react";
import * as XLSX from "xlsx";
import { PACKAGES } from "../constants";
import { generateInvoice } from "../lib/pdf";

interface Booking {
  id: string;
  refId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  packageId: string;
  date: string;
  timeSlot: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: any;
  address?: string;
  latitude?: number;
  longitude?: number;
  vehicles?: any[];
}

export default function AdminDashboard() {
  const {
    user,
    userProfile,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    resetPassword,
    logout,
  } = useAuth();

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Dashboard State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add Booking State
  const [isAddingBooking, setIsAddingBooking] = useState(false);

  const adminEmails = [
    "dritzz.info@gmail.com",
    "sujitsinghguw@gmail.com",
    "admin@dritzz.info",
  ];
  const userEmail = user?.email?.toLowerCase() || "";
  const isAdmin = userProfile?.isAdmin || adminEmails.some(
    (aEmail) => userEmail === aEmail.toLowerCase(),
  );

  useEffect(() => {
    if (!isAdmin) return;
    
    setLoading(true);

    const unsubBookings = onSnapshot(query(collection(db, "bookings")), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      fetched.sort((a, b) => {
        const da = a.createdAt?.seconds || 0;
        const db = b.createdAt?.seconds || 0;
        return db - da;
      });

      setBookings(fetched);
    });

    const unsubSubscriptions = onSnapshot(query(collection(db, "subscriptions")), (snapshot) => {
      const fetched_s = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      fetched_s.sort((a, b) => {
        const da = a.createdAt?.seconds || 0;
        const db = b.createdAt?.seconds || 0;
        return db - da;
      });

      setSubscriptions(fetched_s);
      
      setLoading(false);
      setIsRefreshing(false);
    });

    return () => {
      unsubBookings();
      unsubSubscriptions();
    };
  }, [isAdmin]);


  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    let loginEmail = email.trim();
    // Allow UserID "Admin" map to the actual admin email for Firebase Auth
    if (loginEmail === "Admin" || loginEmail === "admin") {
      loginEmail = "admin@dritzz.info";
    }

    try {
      await loginWithEmail(loginEmail, password);
    } catch (err: any) {
      if (err?.code === "auth/operation-not-allowed") {
        setLoginError(
          "Email/Password sign-in is disabled in your Firebase project (or the change is still propagating). If you just enabled it, please wait 5-10 minutes for Firebase cache to clear.",
        );
      } else if (err?.code === "auth/network-request-failed") {
        setLoginError(
          "Network request failed. Please check your connection or turn off adblockers.",
        );
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential" ||
        err.message.includes("invalid")
      ) {
        // Auto-create the admin user if it doesn't exist yet but credentials are correct for the default admin
        if (loginEmail === "admin@dritzz.info" && password === "admin@123") {
          try {
            await signupWithEmail(loginEmail, password, "Admin Account");
            return;
          } catch (signupErr: any) {
             setLoginError(signupErr.message || "Invalid User ID or password.");
          }
        } else {
          setLoginError("Invalid User ID or password. Please verify your credentials.");
        }
      } else {
         setLoginError(err.message || "Failed to login.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [activeTab, setActiveTab] = useState<
    "bookings" | "sub_tasks" | "subscriptions"
  >("bookings");
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // fetchBookings removed because onSnapshot handles data real-time

  const handleUpdateSubscription = async (subId: string, updates: any) => {
    try {
      await updateDoc(doc(db, "subscriptions", subId), updates);
      // Real-time handles updates
    } catch (e: any) {
      alert("Failed to update subscription. " + e.message);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const bRef = doc(db, "bookings", bookingId);
      const booking = bookings.find((b) => b.id === bookingId);

      // If marking as completed, check if it belongs to a subscription
      if (newStatus === "completed") {
        if (booking && booking.subscriptionId) {
          // decrement remaining washes
          const subRef = doc(db, "subscriptions", booking.subscriptionId);
          const subSnap = await getDocs(query(collection(db, "subscriptions")));
          const subscription = subSnap.docs
            .find((d) => d.id === booking.subscriptionId)
            ?.data();
          if (subscription && subscription.remainingWashes > 0) {
            await updateDoc(subRef, {
              remainingWashes: subscription.remainingWashes - 1,
              usedWashes: subscription.usedWashes + 1,
              status:
                subscription.remainingWashes - 1 === 0
                  ? "completed"
                  : subscription.status,
            });
          }
        }
      }

      await updateDoc(bRef, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
      );

      // Distouch a secure user notification
      if (booking && booking.userId) {
        let nTitle = "Booking Status Update";
        let nMessage = `Your booking ${booking.refId || ""} has been updated to ${newStatus.toUpperCase()}.`;
        let nType = "Status Updates";

        if (newStatus === "confirmed") {
          nTitle = "Booking Approved";
          nMessage = `Great news! Your booking ${booking.refId || ""} has been approved and confirmed.`;
          nType = "Booking Confirmations";
        } else if (newStatus === "scheduled") {
          nTitle = "Service Scheduled";
          nMessage = `Your wash is scheduled for ${booking.date || ""} within slot: ${booking.timeSlot || ""}. See you soon!`;
          nType = "Status Updates";
        } else if (newStatus === "in-progress") {
          nTitle = "Service Started";
          nMessage = `Your car care session of ${booking.vehicleMake || ""} is now actively in progress.`;
          nType = "Status Updates";
        } else if (newStatus === "completed") {
          nTitle = "Wash Completed";
          nMessage = `Your vehicle wash is completed! Review details under invoices or tap 'Book Again' anytime. Thank you!`;
          nType = "Status Updates";
        } else if (newStatus === "cancelled") {
          nTitle = "Booking Cancelled";
          nMessage = `Your booking ${booking.refId || ""} has been cancelled. Contact support at dros.info@gmail.com for questions.`;
          nType = "Status Updates";
        }

        await addDoc(collection(db, "notifications"), {
          userId: booking.userId,
          title: nTitle,
          message: nMessage,
          type: nType,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    // Verify booking type matches tab selection
    if (activeTab === "bookings" && b.packageId === "monthly") {
      // Exclude subscription tasks from one-time bookings and vice-versa
      return false;
    }
    if (activeTab === "sub_tasks" && b.packageId !== "monthly") {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (b.refId || "").toLowerCase().includes(searchLower) ||
      (b.name || "").toLowerCase().includes(searchLower) ||
      (b.customerName || "").toLowerCase().includes(searchLower) ||
      (b.email || "").toLowerCase().includes(searchLower) ||
      (b.phone || "").includes(searchTerm) ||
      (b.mobileNumber || "").includes(searchTerm) ||
      (b.vehicleNumber || "").toLowerCase().includes(searchLower);

    let matchesDate = true;
    if (filterDate) {
      if (b.createdAt?.toDate) {
        const createdDate = b.createdAt.toDate();
        const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}-${String(createdDate.getDate()).padStart(2, "0")}`;
        matchesDate = createdDateStr === filterDate;
      } else {
        matchesDate = false;
      }
    }

    let matchesStatus = true;
    if (filterStatus) {
      matchesStatus = (b.status || "").toLowerCase() === filterStatus.toLowerCase();
    }

    return matchesSearch && matchesDate && matchesStatus;
  });

  const filteredSubscriptions = subscriptions.filter((s) => {
    if (s.packageId !== "monthly") return false;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (s.customerName || "").toLowerCase().includes(searchLower) ||
      (s.id || "").toLowerCase().includes(searchLower) ||
      (s.customerPhone || "").includes(searchTerm);

    // Also filter by date so Export and Table filters logic matches
    let matchesDate = true;
    if (filterDate) {
      if (s.createdAt?.toDate) {
        const createdDate = s.createdAt.toDate();
        const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}-${String(createdDate.getDate()).padStart(2, "0")}`;
        matchesDate = createdDateStr === filterDate;
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const handleDownloadInvoice = async (b: Booking) => {
    const pkg = PACKAGES.find((p) => p.id === b.packageId);
    if (!pkg) {
      alert("Package details not found.");
      return;
    }
    const details = {
      name: b.name,
      phone: b.phone,
      email: b.email,
      address: b.address || "",
      date: b.date,
      timeSlot: b.timeSlot,
      vehicleType: b.vehicleType as any,
      packageId: b.packageId,
      vehicles: b.vehicles || [],
      notes: "",
    };
    await generateInvoice(
      details,
      pkg,
      b.amount,
      b.paymentMethod || "Manual",
      b.refId,
      b.status,
    );
  };

  const handleExportExcel = () => {
    const exportData = filteredBookings.map((b) => ({
      "Ref ID": b.refId,
      Name: b.name,
      Email: b.email,
      Phone: b.phone,
      Address: b.address || "",
      "Vehicle Type":
        b.vehicles && b.vehicles.length > 0
          ? b.vehicles.map((v) => v.type).join(", ")
          : b.vehicleType,
      "Vehicles Count": b.vehicles ? b.vehicles.length : 1,
      Package: b.packageId,
      Amount: b.amount,
      Date: b.date,
      "Time Slot": b.timeSlot,
      Status: b.status,
      "Payment Method": b.paymentMethod,
      "Created At": b.createdAt?.toDate
        ? b.createdAt.toDate().toLocaleString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const fileName = filterDate
      ? `bookings_${filterDate}.xlsx`
      : `all_bookings.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const nonCancelledBookings = bookings.filter((b) => b.status !== "cancelled");

  // Quick stats
  const totalBookings = nonCancelledBookings.length;
  const totalRevenue = nonCancelledBookings.reduce(
    (sum, b) => sum + (b.amount || 0),
    0,
  );
  const pendingBookings = nonCancelledBookings.filter(
    (b) => b.status === "confirmed",
  ).length;

  let displayDateLabel = "Today";
  const dateObj = new Date();

  const displayBookingsArr = nonCancelledBookings.filter((b) => {
    if (!b.createdAt?.toDate) return false;
    const createdDate = b.createdAt.toDate();

    if (filterDate) {
      const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}-${String(createdDate.getDate()).padStart(2, "0")}`;
      return createdDateStr === filterDate;
    }

    return (
      createdDate.getFullYear() === dateObj.getFullYear() &&
      createdDate.getMonth() === dateObj.getMonth() &&
      createdDate.getDate() === dateObj.getDate()
    );
  });
  const displayBookingsCount = displayBookingsArr.length;
  const displayRevenue = displayBookingsArr.reduce(
    (sum, b) => sum + (b.amount || 0),
    0,
  );

  // Subscription Stats
  const activeSubs = subscriptions.filter((s) => {
    const isExpired = s.expiresAt?.toDate
      ? new Date() > s.expiresAt.toDate()
      : false;
    const activeStatus =
      s.status ||
      (isExpired
        ? "expired"
        : (s.remainingWashes || 0) > 0
          ? "active"
          : "completed");
    return activeStatus === "active";
  }).length;
  const washesCompleted = subscriptions.reduce(
    (sum, s) => sum + (s.usedWashes || 0),
    0,
  );
  const scheduledWashesPending = bookings.filter(
    (b) => b.subscriptionId && ["pending", "scheduled"].includes(b.status),
  ).length;
  const expiringNext7Days = subscriptions.filter((s) => {
    if (!s.expiresAt || !s.expiresAt.toDate) return false;
    const exp = s.expiresAt.toDate();
    const diff = exp.getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        {user ? (
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-neutral-100 text-xs mb-6">
              You are signed in as {user.email}, which is not an administrator
              account.
            </p>
            <button
              onClick={logout}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 max-w-[400px] w-full shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Lock className="w-8 h-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                System Admin
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">
                Restricted Clearance Portal
              </p>
            </div>

            {loginError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] text-center font-medium leading-relaxed">
                {loginError.includes("disabled in your Firebase project") ? (
                  <span>
                    <strong className="block text-red-300 mb-1">FIREBASE CONFIG REQUIRED:</strong>
                    Email/Password is currently disabled in your Firebase console for project <strong>charged-axle-k8gvj</strong>. To use custom User IDs, you must enable "Email/Password" under Authentication Sign-In Methods.<br/><br/>
                    <em>Please use <strong>Google Sign-In</strong> below as a fallback.</em>
                  </span>
                ) : (
                  loginError
                )}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-neutral-400 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin User ID (e.g. Admin)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-mono"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-neutral-400 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Access Code"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-12 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold transition-all text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
              >
                {isLoggingIn ? "Authenticating..." : "Establish Link"}
                {!isLoggingIn && <LogIn className="w-3.5 h-3.5" />}
              </button>
            </form>

            <div className="mt-8 relative z-10">
              <div className="relative py-2 mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
                  <span className="bg-[#121212] px-4 text-neutral-500 rounded-full">
                    Secondary Access
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                  } catch (e: any) {
                    setLoginError(e.message || "Failed to sign in with Google");
                  }
                }}
                className="w-full h-12 bg-transparent border border-white/10 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-white/5 active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-neutral-300 hover:text-white transition-colors mr-2"
            >
              ← Home
            </a>
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-black tracking-tight text-xl">DRITZZ ADMIN</h1>
          </div>
          <button
            onClick={logout}
            className="text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 pb-24 md:pb-8">
        {/* Stats Row */}
        {activeTab === "subscriptions" ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <div className="bg-neutral-900 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4">
                <Gem className="w-4 h-4 md:w-6 md:h-6 text-neutral-100" />
              </div>
              <div>
                <p className="text-neutral-400 text-[10px] md:text-xs font-medium mb-1 truncate">
                  Active Subs
                </p>
                <p className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                  {activeSubs}
                </p>
              </div>
            </div>
            <div className="bg-neutral-900 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500/10 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4">
                <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 text-green-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-[10px] md:text-xs font-medium mb-1 truncate">
                  Total Washes Done
                </p>
                <p className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                  {washesCompleted}
                </p>
              </div>
            </div>
            <div className="bg-neutral-900 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-500/10 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4">
                <Calendar className="w-4 h-4 md:w-6 md:h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-[10px] md:text-xs font-medium mb-1 truncate">
                  Pending scheduled
                </p>
                <p className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                  {scheduledWashesPending}
                </p>
              </div>
            </div>
            <div className="bg-neutral-900 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-red-500/10 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4">
                <LayoutList className="w-4 h-4 md:w-6 md:h-6 text-red-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-[10px] md:text-xs font-medium mb-1 truncate">
                  Expiring (7 days)
                </p>
                <p className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                  {expiringNext7Days}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
            <div className="bg-neutral-900 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4">
                <Calendar className="w-4 h-4 md:w-6 md:h-6 text-neutral-100" />
              </div>
              <div>
                <p className="text-neutral-400 text-[10px] md:text-xs font-medium mb-1 truncate">
                  {filterDate ? "Filtered Bookings" : "Today's Bookings"}
                </p>
                <p className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                  {displayBookingsCount}
                </p>
              </div>
            </div>
            <div className="bg-neutral-900 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500/10 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4">
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-green-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-[10px] md:text-xs font-medium mb-1 truncate">
                  {filterDate ? "Filtered Revenue" : "Today's Revenue"}
                </p>
                <p className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                  ₹{displayRevenue}
                </p>
              </div>
            </div>
            <div className="bg-neutral-900 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between hidden md:flex">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4">
                <Calendar className="w-4 h-4 md:w-6 md:h-6 text-neutral-100" />
              </div>
              <div>
                <p className="text-neutral-400 text-[10px] md:text-xs font-medium mb-1 truncate">
                  Total Bookings
                </p>
                <p className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                  {totalBookings}
                </p>
              </div>
            </div>
            <div className="bg-neutral-900 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between hidden lg:flex">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500/10 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4">
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-green-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-[10px] md:text-xs font-medium mb-1 truncate">
                  Total Revenue
                </p>
                <p className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                  ₹{totalRevenue}
                </p>
              </div>
            </div>
            <div className="bg-neutral-900 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between col-span-2 sm:col-span-1">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-500/10 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4">
                <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-[10px] md:text-xs font-medium mb-1 truncate">
                  Active / Pending
                </p>
                <p className="text-2xl md:text-4xl font-black tracking-tighter text-white">
                  {pendingBookings}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Hidden on mobile, shown in bottom nav */}
        <div className="hidden md:flex gap-2 p-1 bg-white/5 w-fit rounded-xl border border-white/10 flex-wrap">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "bookings" ? "bg-zinc-800 text-white border border-white/10" : "text-neutral-100 hover:text-white"}`}
          >
            One-Time Bookings
          </button>
          <button
            onClick={() => setActiveTab("sub_tasks")}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "sub_tasks" ? "bg-orange-500 text-white" : "text-neutral-100 hover:text-white"}`}
          >
            Subscription Tasks
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "subscriptions" ? "bg-zinc-600 text-white" : "text-neutral-100 hover:text-white"}`}
          >
            Active Subscriptions
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="relative w-full sm:max-w-[160px]">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-2xl py-3 px-4 text-xs focus:outline-none focus:border-white transition-colors text-white"
                style={{ colorScheme: "dark" }}
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative w-full sm:max-w-[160px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-2xl py-3 px-4 text-xs focus:outline-none focus:border-white transition-colors text-white appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
              title="Export to Excel"
            >
              <Download className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => {
                setIsRefreshing(true);
                setTimeout(() => setIsRefreshing(false), 500);
              }}
              className="flex-1 sm:flex-none px-4 py-3 bg-neutral-900 border border-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors shrink-0"
            >
              {isRefreshing ? "..." : "Refresh"}
            </button>
            <button
              onClick={() => setIsAddingBooking(true)}
              className="flex-1 sm:flex-none btn-primary !px-4 !py-3 !rounded-2xl"
            >
              <Plus className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === "bookings" || activeTab === "sub_tasks" ? (
              // Bookings Table
              loading && bookings.length === 0 ? (
                <div className="p-12 text-center text-neutral-300 text-xs font-medium">
                  Loading bookings...
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-12 text-center text-neutral-300 text-xs font-medium">
                  No bookings found for this category.
                </div>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-white/5 text-neutral-100 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-bold">
                            Ref / Booking Date
                          </th>
                          <th className="px-6 py-4 font-bold">Customer Info</th>
                          <th className="px-6 py-4 font-bold">
                            Service Details
                          </th>
                          <th className="px-6 py-4 font-bold">Slot</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredBookings.map((b) => (
                          <tr
                            key={b.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-mono text-xs bg-black/50 px-2 py-1 rounded inline-block text-neutral-300 w-fit">
                                  {b.refId}
                                </span>
                                <span className="text-xs text-neutral-300 font-medium tracking-wider">
                                  Booked for:{" "}
                                  {b.date
                                    ? new Date(
                                        b.date + "T00:00:00",
                                      ).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "—"}
                                </span>
                                {b.createdAt && b.createdAt.toDate && (
                                  <span className="text-[11px] text-neutral-600 font-medium tracking-wider">
                                    Created:{" "}
                                    {b.createdAt
                                      .toDate()
                                      .toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-white mb-1">
                                {b.name}
                              </div>
                              <div className="text-xs text-neutral-300 flex flex-col gap-1">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {b.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {b.phone}
                                </span>
                                {b.address &&
                                  (b.latitude && b.longitude ? (
                                    <a
                                      href={`https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-start gap-1 mt-1 pt-1 border-t border-white/5 text-[11px] text-white hover:text-neutral-300 max-w-[200px] leading-tight transition-colors cursor-pointer group"
                                      title="Click to get directions on Google Maps"
                                    >
                                      <MapPin className="w-3 h-3 text-white shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                      <span className="line-clamp-2 underline decoration-dashed decoration-zinc-500/30 group-hover:decoration-zinc-400">
                                        {b.address}
                                      </span>
                                    </a>
                                  ) : (
                                    <span
                                      className="flex items-start gap-1 mt-1 pt-1 border-t border-white/5 text-[11px] text-neutral-100 max-w-[200px] leading-tight"
                                      title={b.address}
                                    >
                                      <MapPin className="w-3 h-3 text-neutral-300 shrink-0 mt-0.5" />
                                      <span className="line-clamp-2">
                                        {b.address}
                                      </span>
                                    </span>
                                  ))}
                                {b.latitude && b.longitude && (
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 mt-1 text-xs text-white hover:text-neutral-300 font-bold uppercase tracking-widest bg-zinc-500/10 hover:bg-zinc-500/20 px-2 py-1 rounded transition-all w-fit cursor-pointer"
                                  >
                                    <Navigation className="w-2.5 h-2.5 text-white animate-pulse" />
                                    Get Directions
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Car className="w-4 h-4 text-neutral-100" />
                                <span className="font-medium text-white capitalize">
                                  {b.vehicleMake} {b.vehicleModel}
                                </span>
                              </div>
                              <div className="text-xs text-neutral-300 uppercase tracking-wider">
                                {b.vehicles && b.vehicles.length > 0
                                  ? `${b.vehicles.length} Vehicles`
                                  : b.vehicleType}{" "}
                                &bull; {b.packageId} &bull; ₹{b.amount}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-neutral-300">
                              <div className="font-medium">{b.date}</div>
                              <div className="text-xs text-neutral-300">
                                {b.timeSlot}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={b.status}
                                onChange={(e) =>
                                  handleStatusChange(b.id, e.target.value)
                                }
                                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border-2 appearance-none cursor-pointer outline-none transition-colors
                                ${
                                  b.status === "completed"
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : b.status === "confirmed"
                                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                      : b.status === "scheduled"
                                        ? "bg-zinc-500/10 text-white border-white/5"
                                        : b.status === "cancelled"
                                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                                          : "bg-neutral-800 text-neutral-300 border-neutral-700"
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDownloadInvoice(b)}
                                  className="p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                  title="Download Invoice"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBooking(b.id)}
                                  className="p-2 text-neutral-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Delete Booking"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile View */}
                  <div className="md:hidden flex flex-col gap-4 p-4 pb-20">
                    {filteredBookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] bg-black/50 px-2 py-1 rounded inline-block text-neutral-300 w-fit">
                              {b.refId}
                            </span>
                            <span className="font-bold text-white capitalize text-sm">
                              {b.name}
                            </span>
                          </div>

                          <select
                            value={b.status}
                            onChange={(e) =>
                              handleStatusChange(b.id, e.target.value)
                            }
                            className={`text-[10px] shrink-0 font-bold uppercase tracking-wider px-2 py-1 rounded-lg border-2 appearance-none cursor-pointer outline-none transition-colors
                              ${
                                b.status === "completed"
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : b.status === "confirmed"
                                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                    : b.status === "scheduled"
                                      ? "bg-zinc-500/10 text-white border-white/5"
                                      : b.status === "cancelled"
                                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                                        : "bg-neutral-800 text-neutral-300 border-neutral-700"
                              }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Car className="w-4 h-4 text-neutral-100" />
                            <span className="font-medium text-white text-sm capitalize">
                              {b.vehicleMake} {b.vehicleModel}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400 font-medium">
                            {b.vehicles && b.vehicles.length > 0
                              ? `${b.vehicles.length} Vehicles`
                              : b.vehicleType}{" "}
                            &bull; {b.packageId} &bull;{" "}
                            <span className="text-white font-bold">
                              ₹{b.amount}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-zinc-900 border border-white/5 rounded-xl p-3">
                          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <span className="text-sm font-bold text-white">
                              {b.date
                                ? new Date(
                                    b.date + "T00:00:00",
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                              {b.timeSlot}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                          <div className="text-xs text-neutral-300 flex items-center gap-2">
                            <Phone className="w-3 h-3 shrink-0" />{" "}
                            <a
                              href={`tel:${b.phone}`}
                              className="hover:text-white underline decoration-dashed decoration-white/20"
                            >
                              {b.phone}
                            </a>
                          </div>
                          {b.address && (
                            <div className="flex items-start gap-2 text-xs text-neutral-300 mt-1">
                              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-white" />
                              <span className="line-clamp-2">{b.address}</span>
                            </div>
                          )}
                          {b.latitude && b.longitude && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 flex items-center justify-center gap-1 text-[10px] text-black font-black uppercase tracking-widest bg-white hover:bg-neutral-200 px-3 py-2.5 rounded-lg transition-all w-full cursor-pointer shadow-md"
                            >
                              <Navigation className="w-3 h-3 text-black animate-pulse" />
                              Navigate
                            </a>
                          )}
                        </div>

                        <div className="flex justify-between items-center border-t border-white/5 pt-3">
                          {b.createdAt && b.createdAt.toDate && (
                            <span className="text-[9px] text-neutral-500 font-mono">
                              Booked:{" "}
                              {b.createdAt
                                .toDate()
                                .toLocaleDateString("en-GB") || "N/A"}
                            </span>
                          )}
                          <div className="flex gap-2 ml-auto">
                            <button
                              onClick={() => handleDownloadInvoice(b)}
                              className="p-2 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10 shadow-sm"
                              title="Download Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 shadow-sm"
                              title="Delete Booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            ) : // Subscriptions Table
            loading && subscriptions.length === 0 ? (
              <div className="p-12 text-center text-neutral-300 text-xs font-medium">
                Loading subscriptions...
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="p-12 text-center text-neutral-300 text-xs font-medium">
                No active subscriptions found.
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-white/5 text-neutral-100 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-bold">Details</th>
                        <th className="px-6 py-4 font-bold">Customer Info</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold">Usage</th>
                        <th className="px-6 py-4 font-bold">Dates</th>
                        <th className="px-6 py-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredSubscriptions.map((s) => {
                        const isExpired = s.expiresAt?.toDate
                          ? new Date() > s.expiresAt.toDate()
                          : false;
                        let activeStatus = s.status;
                        if (!activeStatus) {
                          activeStatus = isExpired
                            ? "expired"
                            : (s.remainingWashes || 0) > 0
                              ? "active"
                              : "completed";
                        }

                        return (
                          <tr
                            key={s.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-white capitalize flex flex-col gap-1">
                                <span>{s.packageId || "Plan"}</span>
                                <span className="text-xs text-neutral-400">
                                  ID: {s.id.slice(0, 8)}
                                </span>
                              </div>
                              <div className="text-[10px] text-neutral-300 uppercase tracking-widest mt-1">
                                {s.vehicles?.length} Vehicle(s)
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-white mb-1">
                                {s.customerName}
                              </div>
                              <div className="text-xs text-neutral-300">
                                {s.customerPhone} <br />
                                <span
                                  className="truncate block max-w-[150px]"
                                  title={s.address}
                                >
                                  {s.address}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={activeStatus}
                                onChange={(e) =>
                                  handleUpdateSubscription(s.id, {
                                    status: e.target.value,
                                  })
                                }
                                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border-2 appearance-none cursor-pointer outline-none transition-colors
                                ${
                                  activeStatus === "active"
                                    ? "bg-zinc-500/10 text-zinc-300 border-zinc-500/20"
                                    : activeStatus === "paused"
                                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                      : activeStatus === "cancelled"
                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                                }`}
                              >
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                                <option value="expired">Expired</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 w-48">
                              <div className="flex flex-col gap-2">
                                <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold text-center">
                                  Washes Used
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    disabled={(s.usedWashes || 0) <= 0}
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `Undo 1 wash deduction for ${s.customerName}?`,
                                        )
                                      ) {
                                        handleUpdateSubscription(s.id, {
                                          remainingWashes:
                                            (s.remainingWashes || 0) + 1,
                                          usedWashes: (s.usedWashes || 0) - 1,
                                        });
                                      }
                                    }}
                                    title="Undo Wash"
                                    className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>

                                  <div className="flex flex-col items-center min-w-[3rem]">
                                    <span className="text-xl font-black text-white leading-none">
                                      {s.usedWashes || 0}
                                    </span>
                                    <span className="text-[9px] text-neutral-500 font-mono mt-0.5">
                                      / {s.totalWashes || 0}
                                    </span>
                                  </div>

                                  <button
                                    disabled={(s.remainingWashes || 0) <= 0}
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `Log 1 wash for ${s.customerName}?`,
                                        )
                                      ) {
                                        handleUpdateSubscription(s.id, {
                                          remainingWashes:
                                            (s.remainingWashes || 0) - 1,
                                          usedWashes: (s.usedWashes || 0) + 1,
                                        });
                                      }
                                    }}
                                    title="Log Wash"
                                    className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-white text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-[9px] font-bold mt-1 text-center bg-zinc-800/50 py-1.5 rounded-md border border-white/5 uppercase tracking-widest">
                                  <span
                                    className={
                                      (s.remainingWashes || 0) > 0
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }
                                  >
                                    {s.remainingWashes || 0}
                                  </span>
                                  <span className="text-neutral-400">
                                    {" "}
                                    Remaining
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[10px] text-neutral-100 font-mono">
                              <div>
                                <span className="font-bold text-neutral-500 uppercase">
                                  Start:
                                </span>
                                <br />
                                {s.createdAt
                                  ?.toDate?.()
                                  ?.toLocaleDateString("en-GB") || "N/A"}
                              </div>
                              <div className="mt-1">
                                <span className="font-bold text-neutral-500 uppercase">
                                  Exp:
                                </span>
                                <br />
                                {s.expiresAt
                                  ?.toDate?.()
                                  ?.toLocaleDateString("en-GB") || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  const newExp = new Date(
                                    s.expiresAt?.toDate
                                      ? s.expiresAt.toDate()
                                      : new Date(),
                                  );
                                  newExp.setMonth(newExp.getMonth() + 1);
                                  handleUpdateSubscription(s.id, {
                                    expiresAt: newExp,
                                  });
                                }}
                                className="px-3 py-1.5 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/20 rounded-lg text-[10px] uppercase font-bold tracking-widest border border-zinc-500/20 transition-colors"
                              >
                                Extend 1M
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Mobile View */}
                <div className="md:hidden flex flex-col gap-4 p-4 pb-20">
                  {filteredSubscriptions.map((s) => {
                    const isExpired = s.expiresAt?.toDate
                      ? new Date() > s.expiresAt.toDate()
                      : false;
                    let activeStatus = s.status;
                    if (!activeStatus) {
                      activeStatus = isExpired
                        ? "expired"
                        : (s.remainingWashes || 0) > 0
                          ? "active"
                          : "completed";
                    }
                    return (
                      <div
                        key={s.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-white capitalize">
                              {s.packageId || "Plan"}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              ID: {s.id.slice(0, 8)}
                            </div>
                            <div className="text-[10px] flex items-center gap-1 mt-1 text-neutral-300">
                              <Car className="w-3 h-3" />
                              {s.vehicles?.length} Vehicle(s)
                            </div>
                          </div>
                          <select
                            value={activeStatus}
                            onChange={(e) =>
                              handleUpdateSubscription(s.id, {
                                status: e.target.value,
                              })
                            }
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg border-2 appearance-none cursor-pointer outline-none transition-colors
                                ${
                                  activeStatus === "active"
                                    ? "bg-zinc-500/10 text-zinc-300 border-zinc-500/20"
                                    : activeStatus === "paused"
                                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                      : activeStatus === "cancelled"
                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                                }`}
                          >
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                          <div className="font-bold text-white text-sm">
                            {s.customerName}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-300">
                            <Phone className="w-3 h-3" /> {s.customerPhone}
                          </div>
                          {s.address && (
                            <div className="flex items-start gap-2 text-xs text-neutral-300 mt-1">
                              <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-white" />
                              <span className="line-clamp-2">{s.address}</span>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-white/5 pt-3 flex flex-col gap-3">
                          <div className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3">
                            <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold text-center mb-2">
                              Washes Used
                            </div>
                            <div className="flex items-center justify-center gap-4">
                              <button
                                disabled={(s.usedWashes || 0) <= 0}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Undo 1 wash deduction for ${s.customerName}?`,
                                    )
                                  ) {
                                    handleUpdateSubscription(s.id, {
                                      remainingWashes:
                                        (s.remainingWashes || 0) + 1,
                                      usedWashes: (s.usedWashes || 0) - 1,
                                    });
                                  }
                                }}
                                className="w-10 h-10 shadow-md rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-5 h-5" />
                              </button>

                              <div className="flex flex-col items-center min-w-[3rem]">
                                <span className="text-3xl font-black text-white leading-none">
                                  {s.usedWashes || 0}
                                </span>
                                <span className="text-xs text-neutral-500 font-mono mt-1 font-bold">
                                  / {s.totalWashes || 0}
                                </span>
                              </div>

                              <button
                                disabled={(s.remainingWashes || 0) <= 0}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Log 1 wash for ${s.customerName}?`,
                                    )
                                  ) {
                                    handleUpdateSubscription(s.id, {
                                      remainingWashes:
                                        (s.remainingWashes || 0) - 1,
                                      usedWashes: (s.usedWashes || 0) + 1,
                                    });
                                  }
                                }}
                                className="w-10 h-10 shadow-md rounded-full bg-zinc-100 hover:bg-white text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="text-[10px] font-bold mt-3 text-center bg-zinc-800/80 py-2 rounded-lg border border-white/5 uppercase tracking-widest w-full">
                              <span
                                className={
                                  (s.remainingWashes || 0) > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }
                              >
                                {s.remainingWashes || 0}
                              </span>
                              <span className="text-neutral-400">
                                {" "}
                                Remaining
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/5 pt-3">
                          <div className="text-[10px] flex flex-col gap-0.5 text-neutral-300 font-mono">
                            <span>
                              Start:{" "}
                              {s.createdAt
                                ?.toDate?.()
                                ?.toLocaleDateString("en-GB") || "N/A"}
                            </span>
                            <span>
                              Exp:{" "}
                              {s.expiresAt
                                ?.toDate?.()
                                ?.toLocaleDateString("en-GB") || "N/A"}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const newExp = new Date(
                                s.expiresAt?.toDate
                                  ? s.expiresAt.toDate()
                                  : new Date(),
                              );
                              newExp.setMonth(newExp.getMonth() + 1);
                              handleUpdateSubscription(s.id, {
                                expiresAt: newExp,
                              });
                            }}
                            className="px-4 py-2 bg-zinc-500/10 shadow-inner text-zinc-300 rounded-lg text-[10px] uppercase font-bold tracking-widest border border-zinc-500/20 active:scale-95 transition-all"
                          >
                            Extend 1M
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add Booking Modal */}
      {isAddingBooking && (
        <AddBookingModal
          onClose={() => setIsAddingBooking(false)}
          onAdded={() => {
            setIsAddingBooking(false);
          }}
        />
      )}

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-white/5 pb-safe z-40">
        <div className="flex items-center justify-around p-2">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === "bookings" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Bookings
            </span>
          </button>
          <button
            onClick={() => setActiveTab("sub_tasks")}
            className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === "sub_tasks" ? "text-orange-400" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            <LayoutList className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Tasks
            </span>
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === "subscriptions" ? "text-zinc-400" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            <Gem className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Members
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Separate component for adding bookings manually
function AddBookingModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleType: "hatchback",
    packageId: "basic",
    date: "",
    timeSlot: "09:00 AM - 11:00 AM",
    amount: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const refId = `ADMIN-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      let subscriptionId = null;

      if (formData.packageId === "monthly") {
        const expiresAtDate = new Date();
        expiresAtDate.setMonth(expiresAtDate.getMonth() + 1);

        const subPayload = {
          userId: "admin_manual_entry",
          customerName: formData.name,
          customerPhone: formData.phone,
          packageId: "monthly",
          vehicles: [
            {
              type: formData.vehicleType,
              make: formData.vehicleMake,
              model: formData.vehicleModel,
            },
          ],
          status: "active",
          totalWashes: 4,
          usedWashes: 0,
          remainingWashes: 4,
          expiresAt: expiresAtDate,
          createdAt: serverTimestamp(),
          paymentId: refId,
        };

        const subRef = await addDoc(
          collection(db, "subscriptions"),
          subPayload,
        );
        subscriptionId = subRef.id;
      }

      await addDoc(collection(db, "bookings"), {
        ...formData,
        subscriptionId,
        amount: Number(formData.amount),
        refId,
        status: "confirmed",
        paymentMethod:
          formData.packageId === "monthly" ? "subscription" : "manual_admin",
        userId: "admin_manual_entry",
        createdAt: serverTimestamp(),
      });
      onAdded();
    } catch (error) {
      console.error("Error adding booking:", error);
      alert("Failed to add booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 ">
      <div className="bg-neutral-900 border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-neutral-900 z-10">
          <h2 className="text-xl font-black uppercase tracking-tight">
            Manual Booking entry
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">
                Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">
                Email
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">
                Phone
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">
                Amount (₹)
              </label>
              <input
                required
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none"
              />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-white mb-4">
                Vehicle Details
              </h3>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">
                Make
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Maruti Suzuki"
                value={formData.vehicleMake}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleMake: e.target.value })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">
                Model
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Swift"
                value={formData.vehicleModel}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleModel: e.target.value })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">
                Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleType: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 px-4 py-3.5 text-xs font-medium focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all appearance-none rounded-xl text-white shadow-sm"
              >
                <option value="hatchback">Hatchback</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">
                Package
              </label>
              <select
                value={formData.packageId}
                onChange={(e) =>
                  setFormData({ ...formData, packageId: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 px-4 py-3.5 text-xs font-medium focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all appearance-none rounded-xl text-white shadow-sm"
              >
                <option value="basic">Basic Wash</option>
                <option value="premium">Premium Care</option>
                <option value="monthly">Monthly Care</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-white mb-4">Schedule</h3>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">
                Date
              </label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-white transition-colors outline-none"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-100 uppercase tracking-wider mb-2 block">
                Time Slot
              </label>
              <select
                value={formData.timeSlot}
                onChange={(e) =>
                  setFormData({ ...formData, timeSlot: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 px-4 py-3.5 text-xs font-medium focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all appearance-none rounded-xl text-white shadow-sm"
              >
                {[
                  "09:00 AM - 11:00 AM",
                  "11:00 AM - 01:00 PM",
                  "01:00 PM - 03:00 PM",
                  "03:00 PM - 05:00 PM",
                  "05:00 PM - 07:00 PM",
                ].map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary !py-4 !rounded-xl"
            >
              {loading ? "Adding..." : "Add Booking manually"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
