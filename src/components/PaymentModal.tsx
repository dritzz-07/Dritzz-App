import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard,
  Banknote,
  QrCode,
  Download,
  CheckCircle2,
  ChevronRight,
  X,
  Wallet,
} from "lucide-react";
import { BookingDetails, Package } from "../types";
import { generateInvoice } from "../lib/pdf";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getApiUrl } from "../lib/api";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: BookingDetails | null;
  pkg: Package | null;
  amount: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  bookingDetails,
  pkg,
  amount,
}: PaymentModalProps) {
  const [step, setStep] = useState<"method" | "success">("method");
  const [method, setMethod] = useState<"cash" | "upi" | "stripe" | "paypal">(
    "upi",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const refId = `DRZ-${Date.now().toString().slice(-6)}`;

  const handleConfirm = async () => {
    if (!bookingDetails || !pkg) return;

    setIsLoading(true);
    try {
      const schDate = bookingDetails.date || bookingDetails.vehicles?.[0]?.date || "";
      const schTime = bookingDetails.timeSlot || bookingDetails.vehicles?.[0]?.timeSlot || "";
      const customerM = bookingDetails.phone || "";

      // Prevent duplicate bookings
      let duplicateQuery;
      if (bookingDetails.userId && bookingDetails.userId !== "guest") {
        duplicateQuery = query(
          collection(db, "bookings"),
          where("userId", "==", bookingDetails.userId),
          where("bookingDate", "==", schDate),
          where("bookingTime", "==", schTime)
        );
      } else {
        duplicateQuery = query(
          collection(db, "bookings"),
          where("mobileNumber", "==", customerM),
          where("bookingDate", "==", schDate),
          where("bookingTime", "==", schTime)
        );
      }

      if (schDate && schTime) {
        const dupSnap = await getDocs(duplicateQuery);
        let isDuplicate = false;
        dupSnap.forEach((doc) => {
          const d = doc.data() as any;
          if (d.status !== "cancelled" && d.status !== "Cancelled") {
            isDuplicate = true;
          }
        });

        if (isDuplicate) {
          alert("A booking is already scheduled for this date and time slot.");
          setIsLoading(false);
          return;
        }
      }

      let subscriptionId;

      if (pkg.id === "monthly") {
        const totalWashes = (bookingDetails.vehicles?.length || 1) * 4;
        const expiresAtDate = new Date();
        expiresAtDate.setMonth(expiresAtDate.getMonth() + 1);

        const subPayload: any = {
          userId: bookingDetails.userId || "guest",
          customerName: bookingDetails.name,
          customerPhone: bookingDetails.phone,
          address: bookingDetails.address,
          packageId: pkg.id,
          vehicles: bookingDetails.vehicles || [],
          status: "active",
          totalWashes: totalWashes,
          usedWashes: 0,
          remainingWashes: totalWashes,
          expiresAt: expiresAtDate,
          createdAt: serverTimestamp(),
          paymentId: refId,
        };

        Object.keys(subPayload).forEach((key) => {
          if (subPayload[key] === undefined) delete subPayload[key];
        });

        try {
          const subRef = await addDoc(
            collection(db, "subscriptions"),
            subPayload,
          );
          subscriptionId = subRef.id;
        } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, "subscriptions");
        }
      }

      // 1. Save to Firestore
      const bookingPayload: any = {
        // Core requested structure/fields
        customerName: bookingDetails.name || "User",
        mobileNumber: customerM,
        vehicleNumber: bookingDetails.vehicles?.[0]?.vehicleNumber || "",
        vehicleType: bookingDetails.vehicles?.[0]?.type || bookingDetails.vehicleType || "hatchback",
        serviceType: pkg.id,
        address: bookingDetails.address || "",
        bookingDate: schDate,
        bookingTime: schTime,
        amount: amount,
        status: "pending",
        createdAt: serverTimestamp(),

        // Plus original legacy fields for compatibility across existing UI
        ...bookingDetails,
        userId: bookingDetails.userId || "guest",
        subscriptionId: subscriptionId || null,
        refId,
        paymentMethod: method,
        bookingStatus: "pending",
        scheduledDate: schDate,
        scheduledTime: schTime,
        updatedAt: serverTimestamp(),
      };

      Object.keys(bookingPayload).forEach((key) => {
        if (bookingPayload[key] === undefined) delete bookingPayload[key];
      });

      try {
        await addDoc(collection(db, "bookings"), bookingPayload);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, "bookings");
      }

      // 2. Send SMS Confirmation (existing logic)
      try {
        await fetch(getApiUrl("/api/send-confirmation"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bookingDetails.name,
            phone: bookingDetails.phone,
            packageName: pkg.name,
            amount: amount,
            refId: refId,
            vehicle: bookingDetails.vehicles?.[0]?.type || "Standard",
            address: bookingDetails.address,
          }),
        });
      } catch (smsError) {
        console.warn(
          "SMS notification failed to send, but booking has been successfully saved:",
          smsError,
        );
      }

      setStep("success");
    } catch (error: any) {
      console.error("Failed to complete booking:", error);
      alert("Failed to save booking. Check console. " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!bookingDetails || !pkg) return;
    setIsGenerating(true);
    try {
      await generateInvoice(bookingDetails, pkg, amount, method, refId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 "
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-neutral-900 border border-white/10 w-full max-w-xl overflow-hidden rounded-3xl shadow-[0_0_100px_-20px_rgba(255,255,255,0.15)]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-xl tracking-tight">
                  {step === "method"
                    ? "Choose Payment Method"
                    : "Booking Successful"}
                </h3>
                <p className="text-neutral-300 text-xs font-medium uppercase tracking-widest mt-1">
                  Reference: {refId}
                </p>
              </div>
              {step === "method" && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-100 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-8 md:p-10">
              {step === "method" ? (
                <div className="space-y-8">
                  {/* Summary Card */}
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-300 uppercase tracking-widest font-bold text-xs">
                        Package
                      </span>
                      <span className="text-white font-medium">
                        {pkg?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-300 uppercase tracking-widest font-bold text-xs">
                        Total Amount
                      </span>
                      <span className="text-white font-black text-2xl tracking-tighter">
                        ₹{amount}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => setMethod("upi")}
                      className={`relative p-5 border rounded-2xl transition-all text-left ${
                        method === "upi"
                          ? "bg-white border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <QrCode
                        className={`w-6 h-6 mb-3 ${method === "upi" ? "text-black" : "text-white"}`}
                      />
                      <div
                        className={`text-xs font-bold uppercase tracking-widest ${method === "upi" ? "text-black" : "text-white"}`}
                      >
                        UPI Payment
                      </div>
                      {method === "upi" && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setMethod("stripe")}
                      className={`relative p-5 border rounded-2xl transition-all text-left ${
                        method === "stripe"
                          ? "bg-white border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <CreditCard
                        className={`w-6 h-6 mb-3 ${method === "stripe" ? "text-black" : "text-white"}`}
                      />
                      <div
                        className={`text-xs font-bold uppercase tracking-widest ${method === "stripe" ? "text-black" : "text-white"}`}
                      >
                        Stripe / Card
                      </div>
                      {method === "stripe" && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setMethod("paypal")}
                      className={`relative p-5 border rounded-2xl transition-all text-left ${
                        method === "paypal"
                          ? "bg-white border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <Wallet
                        className={`w-6 h-6 mb-3 ${method === "paypal" ? "text-black" : "text-white"}`}
                      />
                      <div
                        className={`text-xs font-bold uppercase tracking-widest ${method === "paypal" ? "text-black" : "text-white"}`}
                      >
                        PayPal
                      </div>
                      {method === "paypal" && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setMethod("cash")}
                      className={`relative p-5 border rounded-2xl transition-all text-left ${
                        method === "cash"
                          ? "bg-white border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <Banknote
                        className={`w-6 h-6 mb-3 ${method === "cash" ? "text-black" : "text-white"}`}
                      />
                      <div
                        className={`text-xs font-bold uppercase tracking-widest ${method === "cash" ? "text-black" : "text-white"}`}
                      >
                        Cash on Delivery
                      </div>
                      {method === "cash" && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="w-full btn-primary"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        Confirm Order <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mb-8 flex justify-center">
                    <img
                      src="/logo_v2.svg"
                      alt="Dritzz Logo"
                      className="h-10 w-auto"
                    />
                  </div>
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]">
                    <CheckCircle2 className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">
                    Awesome!
                  </h3>
                  <p className="text-neutral-100 mb-12 max-w-sm mx-auto leading-relaxed">
                    Your car wash is scheduled. We've sent the details to{" "}
                    {bookingDetails?.phone}.
                  </p>

                  <div className="space-y-4">
                    <button
                      onClick={handleDownloadInvoice}
                      disabled={isGenerating}
                      className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-bold text-xs tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                    >
                      {isGenerating ? (
                        <>Generating Bill...</>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download Invoice
                        </>
                      )}
                    </button>

                    <button
                      onClick={onClose}
                      className="w-full text-neutral-300 hover:text-white py-4 rounded-2xl font-bold text-xs tracking-[0.3em] uppercase transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
