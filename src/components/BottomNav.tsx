import { Home, Calendar, RefreshCcw, User } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'bookings' as Tab, label: 'Bookings', icon: Calendar },
    { id: 'subscriptions' as Tab, label: 'Plans', icon: RefreshCcw },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-t border-neutral-800 pb-safe-area pt-2 px-4 shadow-lg">
      <div className="max-w-md mx-auto flex justify-between items-center pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-16 ${
                isActive ? 'text-blue-500 scale-110' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
