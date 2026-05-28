import { Settings, CreditCard, HelpCircle, LogOut, ChevronRight, Car } from 'lucide-react';

export function ProfileView() {
  return (
    <div className="px-4 pt-6 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 p-[2px]">
          <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent" alt="User Profile" className="w-full h-full object-cover" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-white">Ashutosh Kumar</h2>
          <p className="text-sm text-neutral-400">+91 98765 43210</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <Car size={20} className="text-blue-500 mb-2" />
          <div className="text-xl font-bold text-white">2</div>
          <div className="text-xs text-neutral-400">Saved Vehicles</div>
        </div>
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <CreditCard size={20} className="text-blue-500 mb-2" />
          <div className="text-xl font-bold text-white">1</div>
          <div className="text-xs text-neutral-400">Active Plan</div>
        </div>
      </div>

      <div className="space-y-2">
        <ProfileOption icon={Settings} label="Account Settings" />
        <ProfileOption icon={Car} label="Manage Vehicles" />
        <ProfileOption icon={CreditCard} label="Payment Methods" />
        <ProfileOption icon={HelpCircle} label="Help & Support" />
      </div>

      <button className="w-full mt-8 p-4 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center gap-2 font-medium transition-colors hover:bg-red-500/20">
        <LogOut size={18} />
        Log Out
      </button>
    </div>
  );
}

function ProfileOption({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-2xl border border-neutral-800 cursor-pointer hover:bg-neutral-800 transition-colors">
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-neutral-400" />
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      <ChevronRight size={18} className="text-neutral-500" />
    </div>
  );
}
