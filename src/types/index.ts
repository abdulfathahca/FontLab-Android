export interface Account {
  id: string;
  username: string;
  name: string;
  avatar: string;
  followers: number;
  following: number;
  postsCount: number;
  status: 'active' | 'warming_up' | 'paused' | 'cooldown';
  safeMode: boolean;
  limits: {
    maxDmsPerHour: number;
    maxCommentsPerHour: number;
    delayMinSec: number;
    delayMaxSec: number;
  };
  stats: {
    dmsSentToday: number;
    commentsRepliedToday: number;
    leadsCapturedToday: number;
    postsPublishedToday: number;
    safetyScore: number;
  };
  apiConfig: {
    isLiveMode: boolean;
    pageAccessToken: string;
    instagramAccountId: string;
    appId: string;
    appSecret: string;
    webhookVerifyToken: string;
  };
}

export interface ButtonAction {
  label: string;
  url: string;
}

export interface AutomationRule {
  id: string;
  accountId: string;
  name: string;
  triggerType: 'comment_keyword' | 'welcome_new_follower' | 'story_mention';
  keywords: string[];
  matchType: 'contains' | 'exact';
  isActive: boolean;
  targetPosts: string;
  publicReplies: string[];
  dmMessage: string;
  buttons: ButtonAction[];
  leadTag: string;
  actionCount: number;
  createdAt: string;
}

export interface ScheduledPost {
  id: string;
  accountId: string;
  type: 'feed' | 'reel' | 'carousel' | 'story';
  caption: string;
  mediaUrl: string;
  hashtags: string[];
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  likesEstimate?: number;
  commentsEstimate?: number;
  createdAt: string;
  publishedAt?: string | null;
}

export interface Lead {
  id: string;
  accountId: string;
  username: string;
  name: string;
  avatar: string;
  sourceTrigger: string;
  ruleId: string;
  tag: string;
  email: string;
  status: 'delivered' | 'engaged' | 're-engaged';
  interactionTime: string;
}

export interface ActivityLog {
  id: string;
  accountId: string;
  type: 'comment_to_dm' | 'post_published' | 'safety_check' | 'rule_created';
  timestamp: string;
  user: string;
  message: string;
  status: 'success' | 'warning' | 'error';
}
