import { Bell } from 'lucide-react';

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/5 px-5 py-4 flex justify-between items-center pt-safe-area">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-display font-bold tracking-tight text-white">DRITZZ</h1>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1"></div>
      </div>
      <button className="relative p-2 rounded-full bg-neutral-900 text-neutral-300 hover:text-white transition-colors">
        <Bell size={20} />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-neutral-900"></span>
      </button>
    </header>
  );
}
