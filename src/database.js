const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'instaflow.json');

// Initial seed data
const initialData = {
  accounts: [
    {
      id: 'acc_1',
      username: 'techgrowth.studio',
      name: 'Tech Growth Studio',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      followers: 124500,
      following: 482,
      postsCount: 342,
      status: 'active', // active, warming_up, paused, cooldown
      safeMode: true,
      limits: {
        maxDmsPerHour: 35,
        maxCommentsPerHour: 40,
        delayMinSec: 8,
        delayMaxSec: 25,
      },
      stats: {
        dmsSentToday: 184,
        commentsRepliedToday: 219,
        leadsCapturedToday: 94,
        postsPublishedToday: 3,
        safetyScore: 98, // 0 - 100
      },
      apiConfig: {
        isLiveMode: false, // false = high-fidelity simulator, true = meta graph api
        pageAccessToken: '',
        instagramAccountId: '',
        appId: '',
        appSecret: '',
        webhookVerifyToken: 'instaflow_secret_token_123',
      }
    },
    {
      id: 'acc_2',
      username: 'fitlife.academy',
      name: 'FitLife Global',
      avatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80',
      followers: 48900,
      following: 215,
      postsCount: 189,
      status: 'warming_up',
      safeMode: true,
      limits: {
        maxDmsPerHour: 20,
        maxCommentsPerHour: 25,
        delayMinSec: 15,
        delayMaxSec: 45,
      },
      stats: {
        dmsSentToday: 62,
        commentsRepliedToday: 88,
        leadsCapturedToday: 31,
        postsPublishedToday: 1,
        safetyScore: 95,
      },
      apiConfig: {
        isLiveMode: false,
        pageAccessToken: '',
        instagramAccountId: '',
        appId: '',
        appSecret: '',
        webhookVerifyToken: 'fitlife_secret_token_456',
      }
    }
  ],
  selectedAccountId: 'acc_1',
  automationRules: [
    {
      id: 'rule_1',
      accountId: 'acc_1',
      name: 'E-Book Lead Magnet (Keyword "BOOK")',
      triggerType: 'comment_keyword', // comment_keyword, welcome_new_follower, story_mention
      keywords: ['BOOK', 'EBOOK', 'GUIDE', 'PDF'],
      matchType: 'contains', // exact, contains
      isActive: true,
      targetPosts: 'all', // all, or specific post id
      publicReplies: [
        'Hey @{{username}}, check your direct messages! Sent it over 🚀',
        'Just shot you the download link in your DMs @{{username}}! Enjoy 📥',
        '@{{username}} DM sent! Let me know what you think 💡',
        'All set @{{username}}! Look out for my DM with the VIP guide ✨'
      ],
      dmMessage: "Hey {{username}}! 👋 Here is your free copy of 'The 10x Instagram Growth Roadmap 2026':\n\n🔗 https://instaflow.example.com/growth-guide-2026.pdf\n\nLet me know if you have any questions!",
      buttons: [
        { label: 'Download PDF 📥', url: 'https://instaflow.example.com/growth-guide-2026.pdf' },
        { label: 'Book 1-on-1 Call 📞', url: 'https://calendly.com' }
      ],
      leadTag: 'E-Book Lead',
      actionCount: 312,
      createdAt: '2026-11-10T10:00:00Z'
    },
    {
      id: 'rule_2',
      accountId: 'acc_1',
      name: 'Pricing & Demo Request ("PRICE")',
      triggerType: 'comment_keyword',
      keywords: ['PRICE', 'COST', 'HOW MUCH', 'RATES'],
      matchType: 'contains',
      isActive: true,
      targetPosts: 'all',
      publicReplies: [
        'Hey @{{username}}! Dropped our pricing breakdown & exclusive coupon in your DMs 📩',
        'Sent you our tier list and current promo in your DM @{{username}}! 🙌',
        'Check your inbox @{{username}}, just sent full pricing details! ⚡'
      ],
      dmMessage: "Hi {{username}}! Thanks for asking about our pricing. Here is our exclusive discount code for 25% off your first month: 'GROWTH25'.\n\nSee full packages and claim your spot here:",
      buttons: [
        { label: 'View Pricing & Plans 🏷️', url: 'https://instaflow.example.com/pricing' }
      ],
      leadTag: 'High-Intent Buyer',
      actionCount: 145,
      createdAt: '2026-11-12T14:30:00Z'
    },
    {
      id: 'rule_3',
      accountId: 'acc_1',
      name: 'New Follower Welcome Drip',
      triggerType: 'welcome_new_follower',
      keywords: [],
      matchType: 'any',
      isActive: true,
      delayMinutes: 5,
      publicReplies: [],
      dmMessage: "Hey {{username}}! Welcome to the Tech Growth community! 🎉\n\nWe share daily insights on AI automations, viral content architecture, and audience monetization.\n\nQuick question: Are you growing an agency, e-commerce, or personal brand?",
      buttons: [
        { label: 'Agency / B2B', url: 'https://instaflow.example.com/agency' },
        { label: 'Creator / Brand', url: 'https://instaflow.example.com/creators' }
      ],
      leadTag: 'New Follower',
      actionCount: 520,
      createdAt: '2026-11-01T08:00:00Z'
    },
    {
      id: 'rule_4',
      accountId: 'acc_1',
      name: 'Story Mention Auto-Thank You',
      triggerType: 'story_mention',
      keywords: [],
      matchType: 'any',
      isActive: true,
      publicReplies: [],
      dmMessage: "Thank you so much for the story mention, @{{username}}! ❤️ Truly appreciate your support! Here is a special 15% VIP perk on our store for sharing our work.",
      buttons: [
        { label: 'Claim VIP Perk 🎁', url: 'https://instaflow.example.com/vip' }
      ],
      leadTag: 'Brand Advocate',
      actionCount: 89,
      createdAt: '2026-11-05T12:00:00Z'
    }
  ],
  scheduledPosts: [
    {
      id: 'post_1',
      accountId: 'acc_1',
      type: 'reel', // feed, reel, carousel, story
      caption: "Stop manually replying to Instagram comments in 2026! 🛑 Here is how high-growth creators automate their comment-to-DM funnels without getting shadowbanned.\n\nDrop 'SCALE' below and our automated assistant will shoot you the exact workflow blueprints! ⚡\n\n#socialmediamarketing #instagramgrowth #automation #contentcreation #creatoreconomy",
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      hashtags: ['#socialmediamarketing', '#instagramgrowth', '#automation', '#contentcreation', '#creatoreconomy'],
      scheduledTime: new Date(Date.now() + 3600 * 1000 * 4).toISOString(), // 4 hours later
      status: 'scheduled', // scheduled, published, draft, failed
      likesEstimate: 1420,
      commentsEstimate: 95,
      createdAt: '2026-11-18T18:00:00Z'
    },
    {
      id: 'post_2',
      accountId: 'acc_1',
      type: 'feed',
      caption: "5 AI Tools that will replace a 10-person social media agency this year:\n\n1. Autonomous Video Repurposing\n2. Real-Time Sentiment DM Bot\n3. Dynamic Carousel Stacker\n4. Hook Retention Analyzer\n5. Viral Trend Scraper\n\nWhich one are you already testing? Comment below 👇",
      mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      hashtags: ['#aitools', '#marketingtips', '#growthhacks', '#agencybusiness'],
      scheduledTime: new Date(Date.now() + 3600 * 1000 * 24).toISOString(), // Tomorrow
      status: 'scheduled',
      likesEstimate: 2100,
      commentsEstimate: 160,
      createdAt: '2026-11-18T19:00:00Z'
    },
    {
      id: 'post_3',
      accountId: 'acc_1',
      type: 'carousel',
      caption: "Swipe to learn the exact step-by-step architecture behind 10,000+ targeted Instagram leads generated with zero ad spend in 30 days! ➡️➡️\n\nSave this post for your next campaign. 📌",
      mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      hashtags: ['#leads', '#digitalmarketing', '#carouselpost', '#growthmindset'],
      scheduledTime: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
      status: 'published',
      publishedAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
      likesEstimate: 3410,
      commentsEstimate: 284,
      createdAt: '2026-11-17T12:00:00Z'
    }
  ],
  leads: [
    {
      id: 'lead_1',
      accountId: 'acc_1',
      username: 'sarah_marketing',
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      sourceTrigger: 'Comment "BOOK"',
      ruleId: 'rule_1',
      tag: 'E-Book Lead',
      email: 'sarah.j@growthdigital.co',
      status: 'delivered',
      interactionTime: '2026-11-18T22:45:10Z'
    },
    {
      id: 'lead_2',
      accountId: 'acc_1',
      username: 'alex_ecommerce',
      name: 'Alex Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      sourceTrigger: 'Comment "PRICE"',
      ruleId: 'rule_2',
      tag: 'High-Intent Buyer',
      email: 'alex@vancestore.com',
      status: 'engaged',
      interactionTime: '2026-11-19T01:12:35Z'
    },
    {
      id: 'lead_3',
      accountId: 'acc_1',
      username: 'elena_wellness',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      sourceTrigger: 'New Follower Welcome',
      ruleId: 'rule_3',
      tag: 'New Follower',
      email: '',
      status: 'delivered',
      interactionTime: '2026-11-19T02:05:00Z'
    }
  ],
  logs: [
    {
      id: 'log_1',
      accountId: 'acc_1',
      type: 'comment_reply',
      timestamp: '2026-11-19T02:30:15Z',
      user: 'sarah_marketing',
      message: "Matched keyword 'BOOK' on post #post_3. Replied publicly and delivered DM link.",
      status: 'success'
    },
    {
      id: 'log_2',
      accountId: 'acc_1',
      type: 'dm_sent',
      timestamp: '2026-11-19T02:30:19Z',
      user: 'sarah_marketing',
      message: "Direct message delivered with 2 interactive buttons via anti-ban safe jitter (4.2s delay).",
      status: 'success'
    },
    {
      id: 'log_3',
      accountId: 'acc_1',
      type: 'safety_check',
      timestamp: '2026-11-19T02:40:00Z',
      user: 'system',
      message: 'Rate limit audit completed: Current velocity is 42% within Instagram Safe Mode guardrails.',
      status: 'success'
    }
  ]
};

// Database wrapper
class Database {
  constructor() {
    this.data = null;
    this.ensureDir();
    this.load();
  }

  ensureDir() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = JSON.parse(JSON.stringify(initialData));
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, resetting to initial:', err);
      this.data = JSON.parse(JSON.stringify(initialData));
      this.save();
    }
  }

  save() {
    try {
      const tempPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempPath, DB_PATH);
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  get() {
    if (!this.data) this.load();
    return this.data;
  }

  update(mutator) {
    if (!this.data) this.load();
    mutator(this.data);
    this.save();
    return this.data;
  }
}

module.exports = new Database();
