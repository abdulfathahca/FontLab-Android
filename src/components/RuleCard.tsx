import React from 'react';
import { Play, Trash2, Link as LinkIcon } from 'lucide-react';
import { AutomationRule } from '../types';

interface RuleCardProps {
  rule: AutomationRule;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (rule: AutomationRule) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  onToggleActive,
  onDelete,
  onTest,
}) => {
  return (
    <div className="glass-card p-5 flex flex-col justify-between hover:border-[#374151] transition-all">
      <div>
        <div className="flex items-start justify-between mb-3.5">
          <div>
            <h3 className="font-bold text-base text-white mb-1">{rule.name}</h3>
            <span
              className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded ${
                rule.triggerType === 'comment_keyword'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                  : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
              }`}
            >
              {rule.triggerType === 'comment_keyword'
                ? 'Comment-to-DM'
                : rule.triggerType === 'welcome_new_follower'
                ? 'Follower Drip'
                : 'Story Mention'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rule.isActive}
              onChange={() => onToggleActive(rule.id)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500" />
          </label>
        </div>

        {/* Keywords */}
        {rule.keywords && rule.keywords.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold mb-1">Trigger Keywords</div>
            <div className="flex flex-wrap gap-1.5">
              {rule.keywords.map((k, i) => (
                <span
                  key={i}
                  className="bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-xs font-semibold"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Message preview */}
        <div className="mb-3">
          <div className="text-[10px] text-zinc-400 uppercase font-semibold mb-1">Direct Message Delivered</div>
          <div className="bg-[#1f2937]/70 border border-[#2d3748] rounded-xl p-2.5 text-xs text-zinc-200 line-clamp-3">
            {rule.dmMessage}
          </div>
        </div>

        {/* Buttons */}
        {rule.buttons && rule.buttons.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold mb-1">Action Buttons</div>
            <div className="flex flex-wrap gap-1.5">
              {rule.buttons.map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-1 rounded text-[11px]"
                >
                  <LinkIcon className="w-3 h-3 text-sky-400" />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#1f2937] pt-3 mt-2 flex items-center justify-between text-xs">
        <div className="text-zinc-400">
          Fired <strong className="text-white">{rule.actionCount || 0}</strong> times
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onTest(rule)}
            className="inline-flex items-center gap-1 bg-[#1f2937] hover:bg-[#374151] text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            <span>Test</span>
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            title="Delete rule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
