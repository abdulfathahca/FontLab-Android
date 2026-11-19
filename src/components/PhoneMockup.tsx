import React from 'react';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { Account, ScheduledPost } from '../types';

interface PhoneMockupProps {
  account: Account;
  post: ScheduledPost | null;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ account, post }) => {
  const displayPost = post || {
    caption: 'Schedule a post to preview how it looks live on Instagram feeds.',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    hashtags: ['#socialmedia', '#growth', '#automation'],
    likesEstimate: 1420,
  };

  return (
    <div className="w-[330px] bg-black border-[7px] border-[#27272a] rounded-[40px] shadow-2xl overflow-hidden text-xs text-white">
      {/* Phone Notch */}
      <div className="w-28 h-4 bg-[#27272a] mx-auto rounded-b-xl" />

      {/* IG Top App Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 font-bold border-b border-[#18181b]">
        <span className="font-semibold">Instagram</span>
        <div className="flex items-center gap-3">
          <Heart className="w-4 h-4" />
          <Send className="w-4 h-4" />
        </div>
      </div>

      {/* User Header */}
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <img
          src={account.avatar}
          alt={account.username}
          className="w-8 h-8 rounded-full object-cover border-2 border-pink-500"
        />
        <div>
          <div className="font-bold text-xs">{account.username}</div>
          <div className="text-[10px] text-zinc-400">Sponsored • Audio viral mix</div>
        </div>
      </div>

      {/* Post Media */}
      <div className="w-full h-72 bg-zinc-900 overflow-hidden">
        <img
          src={displayPost.mediaUrl}
          alt="Post"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-3.5">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <MessageCircle className="w-4 h-4" />
          <Send className="w-4 h-4" />
        </div>
        <Bookmark className="w-4 h-4" />
      </div>

      {/* Caption & Likes */}
      <div className="px-3.5 pb-4 space-y-1 text-zinc-300">
        <div className="font-bold text-white">
          {(displayPost.likesEstimate || 1200).toLocaleString()} likes
        </div>
        <div className="leading-snug">
          <span className="font-bold text-white mr-1.5">{account.username}</span>
          <span>{displayPost.caption}</span>
        </div>
        <div className="text-sky-400 text-[11px] pt-1">
          {(displayPost.hashtags || []).join(' ')}
        </div>
      </div>
    </div>
  );
};
