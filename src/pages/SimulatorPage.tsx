import React, { useState } from 'react';
import { Terminal, Zap, Smartphone } from 'lucide-react';
import { Account, AutomationRule, ScheduledPost } from '../types';
import { interpolate } from '../lib/utils';

interface SimulatorPageProps {
  account: Account;
  rules: AutomationRule[];
  posts: ScheduledPost[];
  initialComment?: string;
  onNewLeadTriggered?: (username: string, ruleName: string) => void;
}

export const SimulatorPage: React.FC<SimulatorPageProps> = ({
  account,
  rules,
  posts,
  initialComment = 'Hey, can you send me the free BOOK download link?',
  onNewLeadTriggered,
}) => {
  const [username, setUsername] = useState('sarah_growth');
  const [commentText, setCommentText] = useState(initialComment);
  const [selectedPostId, setSelectedPostId] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    triggered: boolean;
    ruleName?: string;
    commentReply?: string;
    dmMessage?: string;
    buttons?: { label: string; url: string }[];
    jitterSec?: number;
    error?: string;
  } | null>(null);

  const handleRunSimulation = () => {
    setIsProcessing(true);
    setSimulationResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      const normalizedComment = commentText.toUpperCase();

      const matchedRule = rules.find((r) => {
        if (!r.isActive || r.triggerType !== 'comment_keyword') return false;
        return (r.keywords || []).some((kw) => normalizedComment.includes(kw.toUpperCase()));
      });

      if (!matchedRule) {
        setSimulationResult({
          triggered: false,
          error: `No active rule matched comment: "${commentText}". Try keywords like BOOK, PRICE, or GUIDE.`,
        });
        return;
      }

      const jitter = Math.floor(Math.random() * 8) + 4;
      const replies = matchedRule.publicReplies || ['Hey @{{username}}, check your DMs! 🚀'];
      const chosenReply = replies[Math.floor(Math.random() * replies.length)];

      const formattedReply = interpolate(chosenReply, { username });
      const formattedDm = interpolate(matchedRule.dmMessage, { username });

      setSimulationResult({
        triggered: true,
        ruleName: matchedRule.name,
        commentReply: formattedReply,
        dmMessage: formattedDm,
        buttons: matchedRule.buttons || [],
        jitterSec: jitter,
      });

      if (onNewLeadTriggered) {
        onNewLeadTriggered(username, matchedRule.name);
      }
    }, 700);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Live Instagram Automation Test Bench</h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
          Simulate user comments, test keyword triggers, watch anti-spam jitter, and preview instant DM delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Simulator Panel */}
        <div className="glass-card p-6 space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>Simulate User Interaction</span>
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">Target Post</label>
            <select
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
              className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="all">Any Active Post / Reel (Global Keywords)</option>
              {posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.type.toUpperCase()}: {p.caption.substring(0, 40)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">Commenter's Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-zinc-500">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] rounded-xl pl-8 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">
              User Comment (Try typing: "BOOK", "PRICE", "GUIDE")
            </label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Keyword quick test chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCommentText('Can you send me the free BOOK?')}
              className="bg-[#1f2937] hover:bg-[#2d3748] text-zinc-300 border border-[#374151] px-2.5 py-1 rounded-lg text-[11px]"
            >
              Keyword "BOOK"
            </button>
            <button
              type="button"
              onClick={() => setCommentText('How much is the PRICE for this package?')}
              className="bg-[#1f2937] hover:bg-[#2d3748] text-zinc-300 border border-[#374151] px-2.5 py-1 rounded-lg text-[11px]"
            >
              Keyword "PRICE"
            </button>
            <button
              type="button"
              onClick={() => setCommentText('Send me the VIP GUIDE please!')}
              className="bg-[#1f2937] hover:bg-[#2d3748] text-zinc-300 border border-[#374151] px-2.5 py-1 rounded-lg text-[11px]"
            >
              Keyword "GUIDE"
            </button>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 ig-gradient-bg text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-500/20 hover:opacity-95 transition text-xs mt-3 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Automation Engine...' : 'Fire Automation Engine Now'}</span>
          </button>
        </div>

        {/* Right: Live DM Chat Preview */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-white mb-4">
            <Smartphone className="w-4 h-4 text-pink-500" />
            <span>Simulated Instagram Direct Inbox</span>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 flex-1 flex flex-col min-h-[340px]">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-[#27272a] pb-3 mb-4">
              <img
                src={account.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-pink-500"
              />
              <div>
                <div className="font-bold text-xs text-white">@{account.username}</div>
                <div className="text-[10px] text-emerald-400">● Active now • Verified Business</div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col justify-center space-y-3 overflow-y-auto">
              {!simulationResult && !isProcessing && (
                <div className="text-center text-zinc-500 text-xs py-8">
                  Trigger an automation on the left to watch live comment-to-DM delivery.
                </div>
              )}

              {isProcessing && (
                <div className="text-center text-pink-400 text-xs py-8 animate-pulse">
                  ● Analyzing comment and calculating human anti-ban jitter delay...
                </div>
              )}

              {simulationResult && !simulationResult.triggered && (
                <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs text-center">
                  ⚠️ {simulationResult.error}
                </div>
              )}

              {simulationResult && simulationResult.triggered && (
                <>
                  {/* User Comment Bubble */}
                  <div className="self-end max-w-[80%] ig-gradient-bg text-white text-xs p-3 rounded-2xl rounded-br-sm shadow-md">
                    <div className="text-[9px] opacity-75 mb-0.5">User Comment Detected:</div>
                    "{commentText}"
                  </div>

                  {/* Bot Delivered DM */}
                  <div className="self-start max-w-[85%] bg-[#262626] text-white text-xs p-3.5 rounded-2xl rounded-bl-sm space-y-2 border border-[#333]">
                    <div className="text-[10px] text-zinc-400 flex items-center gap-1 font-semibold">
                      ⚡ InstaFlow Bot ({simulationResult.jitterSec}s anti-ban jitter applied):
                    </div>
                    <div className="whitespace-pre-line leading-relaxed">{simulationResult.dmMessage}</div>

                    {simulationResult.buttons && simulationResult.buttons.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        {simulationResult.buttons.map((b, i) => (
                          <a
                            key={i}
                            href={b.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center bg-[#363636] hover:bg-[#404040] text-sky-400 font-semibold py-1.5 px-3 rounded-xl text-[11px] border border-[#484848] transition"
                          >
                            🔗 {b.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Public reply footer banner */}
            {simulationResult && simulationResult.triggered && (
              <div className="mt-3 bg-[#27272a] p-2.5 rounded-xl text-[11px] border border-[#333]">
                <div className="font-bold text-pink-400 mb-0.5">💬 Public Post Comment Reply:</div>
                <div className="text-zinc-200">{simulationResult.commentReply}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
