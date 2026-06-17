import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export type Language = "English" | "Hindi" | "Marathi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionary: Record<Language, Record<string, string>> = {
  English: {
    "home": "Home",
    "bookings": "My Bookings",
    "profile": "Profile",
    "plans": "Plans",
    "book_now": "Book Now",
    "welcome_back": "Welcome Back",
    "doorstep_service": "Doorstep Car Wash Service",
    "select_plan": "Select Plan",
    "order_summary": "Order Summary",
    "continue_payment": "Continue to Payment",
    "cash_on_delivery": "Cash on Delivery",
    "confirm_booking": "Confirm Booking",
    "contact_info": "Contact Information",
    "service_location": "Service Location",
    "schedule_washing": "Schedule Washing",
    "full_name": "Full Name",
    "mobile_number": "Mobile Number",
    "service_date": "Service Date",
    "time_slot": "Time Slot",
    "grand_total": "Grand Total",
    "eco_badge": "ECO-FRIENDLY WATERLESS DETAILED SERVICE",
    "save_preferences": "Save My Preferences",
    "settings": "App Settings",
    "saved_addresses": "Saved Addresses",
    "registered_vehicles": "My Registered Vehicles",
    "laundry_msg": "Realtime alerts block"
  },
  Hindi: {
    "home": "मुख्य पृष्ठ",
    "bookings": "मेरी बुकिंग",
    "profile": "मेरी प्रोफ़ाइल",
    "plans": "योजनाएं",
    "book_now": "अभी बुक करें",
    "welcome_back": "वापसी पर आपका स्वागत है",
    "doorstep_service": "घर बैठे कार धोने की सेवा",
    "select_plan": "योजना चुनें",
    "order_summary": "ऑर्डर का सारांश",
    "continue_payment": "भुगतान के लिए आगे बढ़ें",
    "cash_on_delivery": "कैश ऑन डिलीवरी (सीओडी)",
    "confirm_booking": "बुकिंग की पुष्टि करें",
    "contact_info": "संपर्क जानकारी",
    "service_location": "सेवा का स्थान",
    "schedule_washing": "धुलाई का समय चुनें",
    "full_name": "पूरा नाम",
    "mobile_number": "मोबाइल नंबर",
    "service_date": "सेवा की तिथि",
    "time_slot": "समय स्लॉट",
    "grand_total": "कुल योग",
    "eco_badge": "पर्यावरण के अनुकूल ईको-वॉश सेवा",
    "save_preferences": "मेरी प्राथमिकताएं सहेजें",
    "settings": "ऐप सेटिंग्स",
    "saved_addresses": "सहेजे गए पते",
    "registered_vehicles": "पंजीकृत वाहन",
    "laundry_msg": "वास्तविक समय अलर्ट"
  },
  Marathi: {
    "home": "मुख्य पृष्ठ",
    "bookings": "माझ्या बुकिंग्स",
    "profile": "प्रोफाईल",
    "plans": "प्लॅन्स",
    "book_now": "आता बुक करा",
    "welcome_back": "पुन्हा आपले स्वागत आहे",
    "doorstep_service": "घरपोच कार वॉश सेवा",
    "select_plan": "प्लॅन निवडा",
    "order_summary": "ऑर्डर तपशील",
    "continue_payment": "पेमेंटसाठी पुढे जा",
    "cash_on_delivery": "कॅश ऑन डिलिव्हरी",
    "confirm_booking": "बुकिंगची खात्री करा",
    "contact_info": "संपर्क माहिती",
    "service_location": "सेवेचे ठिकाण",
    "schedule_washing": "धुण्याचे वेळापत्रक",
    "full_name": "पूर्ण नाव",
    "mobile_number": "मोबाईल नंबर",
    "service_date": "तारीख निवडा",
    "time_slot": "वेळ निवडा",
    "grand_total": "एकूण रक्कम",
    "eco_badge": "पर्यावरण पूरक वॉटरलेस वॉश सर्व्हिस",
    "save_preferences": "माझ्या पसंती जतन करा",
    "settings": "अॅप सेटिंग्स",
    "saved_addresses": "जतन केलेले पत्ते",
    "registered_vehicles": "नोंदणीकृत वाहने",
    "laundry_msg": "रिअलटाइम वॉश अलर्ट"
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [language, setLanguageState] = useState<Language>("English");

  useEffect(() => {
    // 1. Check local storage
    const localLang = localStorage.getItem("dritzz_lang") as Language;
    if (localLang && ["English", "Hindi", "Marathi"].includes(localLang)) {
      setLanguageState(localLang);
    } else if (userProfile?.appLang && ["English", "Hindi", "Marathi"].includes(userProfile.appLang)) {
      setLanguageState(userProfile.appLang as Language);
    }
  }, [userProfile]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("dritzz_lang", lang);
    if (updateUserProfile) {
      try {
        await updateUserProfile({ appLang: lang } as any);
      } catch (err) {
        console.warn("Could not sync language with Firebase profile:", err);
      }
    }
    window.dispatchEvent(new Event("languageChanged"));
  };

  const t = (key: string): string => {
    const translation = dictionary[language]?.[key];
    if (translation) return translation;
    
    // Check fallback English
    const englishFallback = dictionary["English"]?.[key];
    return englishFallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
