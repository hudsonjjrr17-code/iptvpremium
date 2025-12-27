
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-full shrink-0">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
            <span className="text-white font-black text-xl italic">P+</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter uppercase">
            IPTV <span className="text-red-600">Plus</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-red-600 text-white shadow-xl shadow-red-600/20 font-bold' 
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-sm uppercase tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="px-4 py-2 border-t border-zinc-900">
           <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">Premium Experience</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
