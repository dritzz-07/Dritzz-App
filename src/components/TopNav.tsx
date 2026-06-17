import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc, writeBatch } from "firebase/firestore";
import { Bell, X, BellOff, Calendar, ShieldAlert, MessageSquare, Tag, Check, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import brandLogo from "../assets/images/regenerated_image_1779967524984.png";

export function TopNav() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Subscribe real-time to customer's notifications in Firestore
    const nq = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(nq, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort chronological descending (newest first)
      items.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setNotifications(items);

      // Quantify unread items
      const unreads = items.filter((n: any) => !n.read).length;
      setUnreadCount(unreads);
    }, (error) => {
      const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
          userId: user?.uid,
        },
        operationType: "list",
        path: "notifications",
      };
      console.error("Firestore Error: ", JSON.stringify(errInfo));
    });

    return () => unsub();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user?.uid) return;
    try {
      const unreads = notifications.filter((n: any) => !n.read);
      if (unreads.length === 0) return;

      const batch = writeBatch(db);
      unreads.forEach((item) => {
        const itemRef = doc(db, "notifications", item.id);
        batch.update(itemRef, { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error("Could not dismiss notifications:", err);
    }
  };

  const handleDismissOne = async (id: string) => {
    try {
      const itemRef = doc(db, "notifications", id);
      await updateDoc(itemRef, { read: true });
    } catch (err) {
      console.error("Could not read notification:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("offer") || t.includes("discount")) {
      return <Tag size={15} className="text-emerald-400" />;
    } else if (t.includes("confirm") || t.includes("status")) {
      return <Calendar size={15} className="text-sky-400" />;
    } else if (t.includes("payment")) {
      return <Check size={15} className="text-yellow-400" />;
    } else if (t.includes("admin")) {
      return <ShieldAlert size={15} className="text-rose-400" />;
    }
    return <MessageSquare size={15} className="text-neutral-400" />;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/5 px-5 py-0 flex justify-between items-center pt-safe-area">
        <div className="flex items-center gap-2">
          <img src={brandLogo} alt="Dritzz Logo" className="w-[80px] h-[80px] object-contain" />
        </div>
        
        {/* Bell Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-2 rounded-full bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all active:scale-95 shadow-lg"
          id="bell-notification-btn"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 border border-neutral-900 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Floating Notifications sliding overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-[#050505] flex flex-col pt-6 font-sans text-white"
          >
            <div className="flex-1 flex flex-col p-4 pb-20 overflow-y-auto">
              
              {/* Overlay header */}
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#050505] py-2 z-10 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black uppercase tracking-tight">Notification Center</span>
                  {unreadCount > 0 && (
                    <span className="bg-white/10 text-white/80 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {unreadCount} UNREAD
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Notification contents */}
              {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-5 text-white/20">
                    <BellOff size={24} />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1 uppercase tracking-tight">No Notifications Yet</h4>
                  <p className="text-white/40 text-xs leading-relaxed max-w-2xs">
                    We will ping you about discount promotional offers, scheduled slot arrivals, or payment updates!
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-3">
                  
                  {/* Mark All Read button */}
                  {unreadCount > 0 && (
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5"
                      >
                        <CheckSquare size={11} />
                        Dismiss All Unread
                      </button>
                    </div>
                  )}

                  {/* List items */}
                  <div className="space-y-3">
                    {notifications.map((item) => {
                      const dateStr = item.createdAt?.toDate 
                        ? item.createdAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      
                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-2xl border transition-all flex gap-3 relative overflow-hidden ${
                            !item.read 
                              ? "bg-neutral-900 border-white/15" 
                              : "bg-neutral-950/40 border-white/5 opacity-60"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                            {getNotificationIcon(item.type)}
                          </div>
                          
                          <div className="flex-1 pr-6">
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-extrabold text-sm text-white block uppercase tracking-tight">
                                {item.title || "Notification"}
                              </span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed mt-1">{item.message}</p>
                            <span className="text-[9px] font-mono block text-white/30 uppercase mt-2">{dateStr}</span>
                          </div>

                          {!item.read && (
                            <button
                              onClick={() => handleDismissOne(item.id)}
                              className="absolute top-4 right-4 text-white/30 hover:text-white p-1 rounded-full hover:bg-white/5 shrink-0"
                              title="Mark as Read"
                            >
                              <Check size={14} className="text-emerald-400" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
