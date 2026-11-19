import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AutomationRule } from '../types';

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Partial<AutomationRule>) => void;
}

export const CreateRuleModal: React.FC<CreateRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<'comment_keyword' | 'welcome_new_follower' | 'story_mention'>('comment_keyword');
  const [keywords, setKeywords] = useState('');
  const [publicReplies, setPublicReplies] = useState('Hey @{{username}}, check your DMs! 🚀\nSent you the link in direct messages @{{username}}! 📥');
  const [dmMessage, setDmMessage] = useState('Hey {{username}}! Thanks for commenting. Here is the exclusive link you requested:\n\n🔗 https://example.com/vip');
  const [buttonLabel, setButtonLabel] = useState('Claim Access 🚀');
  const [buttonUrl, setButtonUrl] = useState('https://example.com/vip');
  const [leadTag, setLeadTag] = useState('Instagram VIP Lead');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      triggerType,
      keywords: keywords.split(',').map((s) => s.trim()).filter(Boolean),
      publicReplies: publicReplies.split('\n').filter(Boolean),
      dmMessage,
      leadTag,
      buttons: buttonLabel && buttonUrl ? [{ label: buttonLabel, url: buttonUrl }] : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-[#1f2937] flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">Create Automation Flow</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">Flow Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Free Masterclass Delivery"
              required
              className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">Trigger Type</label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as any)}
              className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
            >
              <option value="comment_keyword">Comment Keyword Match (e.g. "PRICE", "BOOK")</option>
              <option value="welcome_new_follower">New Follower Welcome Drip</option>
              <option value="story_mention">Story Mention Auto-Thank You</option>
            </select>
          </div>

          {triggerType === 'comment_keyword' && (
            <div>
              <label className="block uppercase font-bold text-zinc-400 mb-1.5">Trigger Keywords (Comma Separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. BOOK, GUIDE, LINK, FREE"
                className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">Triggers when any of these words appear in a comment.</span>
            </div>
          )}

          {triggerType === 'comment_keyword' && (
            <div>
              <label className="block uppercase font-bold text-zinc-400 mb-1.5">Public Comment Replies (1 per line, Spintax supported)</label>
              <textarea
                value={publicReplies}
                onChange={(e) => setPublicReplies(e.target.value)}
                rows={2}
                className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          )}

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">Automated Direct Message (DM)</label>
            <textarea
              value={dmMessage}
              onChange={(e) => setDmMessage(e.target.value)}
              rows={3}
              required
              className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">Use &#123;&#123;username&#125;&#125; for recipient name and &#123;Hey|Hello&#125; for Spintax.</span>
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">Call to Action Button (Optional)</label>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                value={buttonLabel}
                onChange={(e) => setButtonLabel(e.target.value)}
                placeholder="Button Label (e.g. Download PDF)"
                className="bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <input
                type="url"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                placeholder="https://..."
                className="bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">CRM Lead Tag</label>
            <input
              type="text"
              value={leadTag}
              onChange={(e) => setLeadTag(e.target.value)}
              placeholder="e.g. VIP Lead"
              className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#1f2937]">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#1f2937] hover:bg-[#374151] text-white px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ig-gradient-bg text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-pink-500/20"
            >
              Save Flow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
