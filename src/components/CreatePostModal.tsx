import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { ScheduledPost } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<ScheduledPost>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<'feed' | 'reel' | 'carousel' | 'story'>('reel');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('#socialmediamarketing #instagramgrowth #automation');
  const [aiTopic, setAiTopic] = useState('5 AI automations for social media agencies in 2026');

  if (!isOpen) return null;

  const handleGenerateAi = () => {
    setCaption(
      `Nobody is talking about this Instagram automation secret in 2026...\n\nIf you want to scale your ${aiTopic || 'business'} on autopilot, here are the 3 non-negotiables:\n\n1. Stop hard selling in feed—use keyword-triggered DMs.\n2. Structure reels with a 1.8s hook and high loop velocity.\n3. Turn commenters into email leads within 60 seconds.\n\nDrop "SCALE" below and our automated bot will DM you the free masterclass! 👇`
    );
    setHashtags('#ai #instagramgrowth #socialmediamarketing #automation #creatoreconomy');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : new Date().toISOString(),
      mediaUrl,
      caption,
      hashtags: hashtags.split(/\s+/).filter((h) => h.startsWith('#')),
      status: scheduledTime ? 'scheduled' : 'published',
      likesEstimate: Math.floor(Math.random() * 2000) + 400,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-[#1f2937] flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">Schedule Post / Reel</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-zinc-400 mb-1.5">Format</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              >
                <option value="feed">Standard Feed Post</option>
                <option value="reel">Instagram Reel</option>
                <option value="carousel">Carousel Post</option>
                <option value="story">Story</option>
              </select>
            </div>

            <div>
              <label className="block uppercase font-bold text-zinc-400 mb-1.5">Schedule Time</label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">Media Image URL</label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              required
              className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* AI Generator Box */}
          <div className="bg-[#1f2937]/80 border border-[#2d3748] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-pink-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Viral Caption & Hashtags Generator
              </span>
              <button
                type="button"
                onClick={handleGenerateAi}
                className="bg-[#2d3748] hover:bg-[#374151] text-white px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                Auto-Generate
              </button>
            </div>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Post topic..."
              className="w-full bg-[#111827] border border-[#374151] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              required
              placeholder="Write an engaging caption with a keyword call to action..."
              className="w-full bg-[#1f2937] border border-[#374151] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block uppercase font-bold text-zinc-400 mb-1.5">Hashtags</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
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
              Queue Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
