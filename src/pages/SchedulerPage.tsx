import React, { useState } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';
import { Account, ScheduledPost } from '../types';
import { PhoneMockup } from '../components/PhoneMockup';

interface SchedulerPageProps {
  account: Account;
  posts: ScheduledPost[];
  onOpenCreatePost: () => void;
  onPublishNow: (id: string) => void;
  onDeletePost: (id: string) => void;
}

export const SchedulerPage: React.FC<SchedulerPageProps> = ({
  account,
  posts,
  onOpenCreatePost,
  onPublishNow,
  onDeletePost,
}) => {
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(posts[0] || null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Content & Post Scheduler</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Queue Reels, Carousels, and Feed posts with live mobile previews and AI caption generator.
          </p>
        </div>

        <button
          onClick={onOpenCreatePost}
          className="flex items-center gap-2 ig-gradient-bg text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-pink-500/20 hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Post</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Posts List (2 Cols) */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <h3 className="font-bold text-sm text-white">Queue & Published History</h3>
            <span className="text-xs text-zinc-400">{posts.length} Total Posts</span>
          </div>

          <div className="space-y-3">
            {posts.map((post) => {
              const isScheduled = post.status === 'scheduled';
              const isSelected = selectedPost?.id === post.id;

              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                    isSelected
                      ? 'bg-[#1f2937] border-pink-500/50'
                      : 'bg-[#1f2937]/50 border-[#2d3748] hover:border-[#374151]'
                  }`}
                >
                  <img
                    src={post.mediaUrl}
                    alt="Thumbnail"
                    className="w-16 h-16 rounded-lg object-cover bg-zinc-900 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isScheduled
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-purple-500/15 text-purple-300'
                        }`}
                      >
                        {post.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                        {post.type}
                      </span>
                      <span className="text-[10px] text-zinc-500 ml-auto">
                        {new Date(post.scheduledTime).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-200 font-medium truncate mb-1">{post.caption}</p>
                    <p className="text-[11px] text-sky-400 truncate">
                      {(post.hashtags || []).slice(0, 3).join(' ')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    {isScheduled ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPublishNow(post.id);
                        }}
                        className="flex items-center gap-1 ig-gradient-bg text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                      >
                        <Send className="w-3 h-3" />
                        <span>Publish</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-400 text-center">Live</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePost(post.id);
                      }}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded transition self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Instagram Mobile Preview (1 Col) */}
        <div className="glass-card p-6 flex flex-col items-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
            Live Mobile Feed Mockup
          </h4>
          <PhoneMockup account={account} post={selectedPost} />
        </div>
      </div>
    </div>
  );
};
