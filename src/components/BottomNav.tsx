import { Home, Calendar, RefreshCcw, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type Tab = 'home' | 'bookings' | 'subscriptions' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'home' as Tab, label: t('home'), icon: Home },
    { id: 'bookings' as Tab, label: t('bookings'), icon: Calendar },
    { id: 'subscriptions' as Tab, label: t('plans'), icon: RefreshCcw },
    { id: 'profile' as Tab, label: t('profile'), icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-xl border-t border-white/5 pb-safe-area pt-2 px-4 shadow-lg">
      <div className="max-w-md mx-auto flex justify-between items-center pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 w-16 relative ${
                isActive 
                  ? 'text-white scale-110 bg-white/5 animate-diamond-shimmer border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                  : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
              }`}
            >
              {/* Pulsing Glowing Diamond Indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white border border-white/50 rotate-45 shadow-[0_0_8px_#fff] animate-pulse z-10" />
              )}
              
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`mb-0.5 ${isActive ? 'text-white animate-pulse' : 'text-neutral-500'}`} />
              <span className={`text-[9px] tracking-wide uppercase font-bold ${isActive ? 'text-white font-black' : 'text-neutral-500 font-bold'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
