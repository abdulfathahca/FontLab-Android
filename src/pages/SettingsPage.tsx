import React, { useState } from 'react';
import { ShieldCheck, Key } from 'lucide-react';
import { Account } from '../types';

interface SettingsPageProps {
  account: Account;
  onUpdateAccount: (updated: Partial<Account>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  account,
  onUpdateAccount,
}) => {
  const [safeMode, setSafeMode] = useState(account.safeMode);
  const [maxDms, setMaxDms] = useState(account.limits?.maxDmsPerHour || 35);
  const [maxComments, setMaxComments] = useState(account.limits?.maxCommentsPerHour || 40);
  const [isLiveMode, setIsLiveMode] = useState(account.apiConfig?.isLiveMode || false);
  const [token, setToken] = useState(account.apiConfig?.pageAccessToken || '');
  const [igId, setIgId] = useState(account.apiConfig?.instagramAccountId || '');

  const handleSave = () => {
    onUpdateAccount({
      safeMode,
      limits: {
        ...account.limits,
        maxDmsPerHour: maxDms,
        maxCommentsPerHour: maxComments,
      },
      apiConfig: {
        ...account.apiConfig,
        isLiveMode,
        pageAccessToken: token,
        instagramAccountId: igId,
      },
    });
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Anti-Ban Safety Guard & Meta Graph API</h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
          Configure Instagram rate limits, safe mode jitter, and live production credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anti-Ban Safety Guard */}
        <div className="glass-card p-6 space-y-5 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Ban Safe Guardrails</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#1f2937]">
            <div>
              <div className="font-bold text-sm text-white">Instagram Safe Mode</div>
              <div className="text-zinc-400 text-[11px]">
                Enforces randomized jitter (4s - 15s) to emulate human typing velocity.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={safeMode}
                onChange={(e) => setSafeMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500" />
            </label>
          </div>

          <div>
            <div className="flex justify-between font-bold uppercase text-zinc-400 mb-1">
              <span>Max DMs Per Hour</span>
              <span className="text-pink-400">{maxDms} / hr</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              value={maxDms}
              onChange={(e) => setMaxDms(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <span className="text-[10px] text-zinc-500 block mt-1">
              Recommended: 25-40/hr for aged accounts; 15-20/hr for warmups.
            </span>
          </div>

          <div>
            <div className="flex justify-between font-bold uppercase text-zinc-400 mb-1">
              <span>Max Comments Per Hour</span>
              <span className="text-sky-400">{maxComments} / hr</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={maxComments}
              onChange={(e) => setMaxComments(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <button
            onClick={handleSave}
            className="ig-gradient-bg text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:opacity-95 transition"
          >
            Save Guardrails
          </button>
        </div>

        {/* Meta Graph API Credentials */}
        <div className="glass-card p-6 space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Meta Instagram Graph API</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#1f2937]">
            <div>
              <div className="font-bold text-sm text-white">Execution Mode</div>
              <div className="text-zinc-400 text-[11px]">
                {isLiveMode ? 'Live Meta Production Mode' : 'High-Fidelity Simulation Engine (No Meta App Required)'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isLiveMode}
                onChange={(e) => setIsLiveMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500" />
            </label>
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1">Page Access Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="EAAG... (Leave blank for Simulation Mode)"
              className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
            />
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1">Instagram Business Account ID</label>
            <input
              type="text"
              value={igId}
              onChange={(e) => setIgId(e.target.value)}
              placeholder="17841400..."
              className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
            />
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1">Webhook Verify Token</label>
            <input
              type="text"
              value={account.apiConfig?.webhookVerifyToken || 'instaflow_secret_token_123'}
              readOnly
              className="w-full bg-[#1f2937]/50 border border-[#2d3748] rounded-xl px-3.5 py-2 text-xs text-zinc-400 font-mono"
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-[#1f2937] hover:bg-[#2d3748] text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-[#374151] transition"
          >
            Update API Config
          </button>
        </div>
      </div>
    </div>
  );
};
