import React from 'react';
import { Plus } from 'lucide-react';
import { AutomationRule } from '../types';
import { RuleCard } from '../components/RuleCard';

interface AutomationsPageProps {
  rules: AutomationRule[];
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (rule: AutomationRule) => void;
  onOpenCreateRule: () => void;
}

export const AutomationsPage: React.FC<AutomationsPageProps> = ({
  rules,
  onToggleActive,
  onDelete,
  onTest,
  onOpenCreateRule,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">DM & Comment Automation Flows</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Trigger automated public replies, keyword-matched direct messages, and lead conversions.
          </p>
        </div>

        <button
          onClick={onOpenCreateRule}
          className="flex items-center gap-2 ig-gradient-bg text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-pink-500/20 hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Flow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onToggleActive={onToggleActive}
            onDelete={onDelete}
            onTest={onTest}
          />
        ))}
      </div>
    </div>
  );
};
