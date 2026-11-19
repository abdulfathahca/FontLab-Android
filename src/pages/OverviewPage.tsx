import React from 'react';
import { Send, MessageCircle, UserPlus, ShieldCheck, Play, Plus, Activity } from 'lucide-react';
import { Account, AutomationRule, ActivityLog } from '../types';
import { StatCard } from '../components/StatCard';

interface OverviewPageProps {
  account: Account;
  rules: AutomationRule[];
  logs: ActivityLog[];
  onOpenCreateRule: () => void;
  onNavigateTab: (tab: string) => void;
  onTestRule: (rule: AutomationRule) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  account,
  rules,
  logs,
  onOpenCreateRule,
  onNavigateTab,
  onTestRule,
}) => {
  const stats = account.stats || {
    dmsSentToday: 184,
    commentsRepliedToday: 219,
    leadsCapturedToday: 94,
    safetyScore: 98,
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="DMs Sent Today"
          value={stats.dmsSentToday}
          subtext="+24.5% vs yesterday"
          icon={Send}
          iconColor="text-pink-500"
        />
        <StatCard
          label="Comments Auto-Replied"
          value={stats.commentsRepliedToday}
          subtext="100% response rate"
          icon={MessageCircle}
          iconColor="text-blue-500"
        />
        <StatCard
          label="Leads Captured"
          value={stats.leadsCapturedToday}
          subtext="38.2% conversion rate"
          icon={UserPlus}
          iconColor="text-emerald-500"
        />
        <StatCard
          label="Anti-Ban Safety Score"
          value={`${stats.safetyScore}/100`}
          subtext="Safe Mode Guardrails Active"
          icon={ShieldCheck}
          iconColor="text-amber-500"
        />
      </div>

      {/* Quick Launchpad Bar */}
      <div className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-pink-500/10 border border-pink-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-pink-400">⚡ Active Funnels:</span>
            <span className="text-xs text-zinc-300 ml-2">E-Book Lead Magnet ("BOOK") + Pricing Demo ("PRICE")</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('simulator')}
            className="flex items-center gap-2 bg-[#1f2937] hover:bg-[#374151] text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition"
          >
            <Play className="w-3.5 h-3.5 text-sky-400" />
            <span>Test Simulator</span>
          </button>
          <button
            onClick={onOpenCreateRule}
            className="flex items-center gap-2 ig-gradient-bg text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-pink-500/20 hover:opacity-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Flow</span>
          </button>
        </div>
      </div>

      {/* Two Columns: Active Rules & Real-time Live Log Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Active Rules */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white">Active Automations</h3>
            <button
              onClick={() => onNavigateTab('automations')}
              className="text-xs text-sky-400 hover:underline"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {rules.slice(0, 4).map((rule) => (
              <div
                key={rule.id}
                className="bg-[#1f2937]/70 border border-[#2d3748] rounded-xl p-3.5 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <span>{rule.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        rule.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Keywords: <span className="text-sky-400">{(rule.keywords || []).join(', ') || 'Any'}</span> • Fired{' '}
                    {rule.actionCount || 0} times
                  </div>
                </div>

                <button
                  onClick={() => onTestRule(rule)}
                  className="bg-[#2d3748] hover:bg-[#374151] text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                >
                  Test
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Live Activity Feed */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Live Execution Feed</h3>
            </div>
            <span className="text-xs text-zinc-400">{logs.length} events</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-[#1f2937]/70 border border-[#2d3748] rounded-xl p-3 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                    ● {log.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-zinc-200 text-xs leading-relaxed">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
