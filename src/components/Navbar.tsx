import React from 'react';
import { Zap, LayoutDashboard, Bot, Calendar, Smartphone, Users, ShieldCheck } from 'lucide-react';
import { Account } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  accounts,
  selectedAccountId,
  onSelectAccount,
}) => {
  const currentAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'automations', label: 'DM & Comment Rules', icon: Bot },
    { id: 'scheduler', label: 'Post Scheduler', icon: Calendar },
    { id: 'simulator', label: 'Live Simulator', icon: Smartphone },
    { id: 'leads', label: 'Leads & CRM', icon: Users },
    { id: 'settings', label: 'Safe Mode & API', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 h-[68px] border-b border-[#1f2937] bg-[#0b0f19]/90 backdrop-blur-xl px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <a href="#" className="flex items-center gap-3 font-bold text-lg tracking-tight">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center ig-gradient-bg shadow-[0_0_16px_rgba(220,39,67,0.4)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span>
            Insta<span className="ig-gradient-text">Flow</span> Pro
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1f2937] text-white border border-[#2d3748] shadow-sm'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[#1f2937]/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Engine Active</span>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2.5 bg-[#111827] border border-[#1f2937] px-3 py-1.5 rounded-xl cursor-pointer">
            <img
              src={currentAccount?.avatar}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover border-2 border-pink-500"
            />
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">@{currentAccount?.username}</div>
              <div className="text-[10px] text-emerald-400 font-medium leading-tight">● Safe Mode On</div>
            </div>
            <select
              value={selectedAccountId}
              onChange={(e) => onSelectAccount(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  @{acc.username} ({acc.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
