const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const db = require('./src/database');
const automationEngine = require('./src/automationEngine');
const scheduler = require('./src/scheduler');
const instagramService = require('./src/instagramService');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

// Ensure uploads dir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `media_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------------
// Server-Sent Events (SSE) for Real-Time Live Activity
// ----------------------------------------------------
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('data: {"type":"connected"}\n\n');

  automationEngine.addSseClient(res);

  req.on('close', () => {
    automationEngine.removeSseClient(res);
  });
});

// ----------------------------------------------------
// State & Overview
// ----------------------------------------------------
app.get('/api/state', (req, res) => {
  res.json(db.get());
});

app.post('/api/account/switch', (req, res) => {
  const { accountId } = req.body;
  const state = db.update(data => {
    if (data.accounts.some(a => a.id === accountId)) {
      data.selectedAccountId = accountId;
    }
  });
  res.json({ success: true, selectedAccountId: state.selectedAccountId });
});

app.put('/api/account/settings', (req, res) => {
  const { accountId, limits, safeMode, apiConfig, status } = req.body;
  let updatedAccount = null;

  db.update(data => {
    const acc = data.accounts.find(a => a.id === accountId);
    if (acc) {
      if (limits) acc.limits = { ...acc.limits, ...limits };
      if (safeMode !== undefined) acc.safeMode = safeMode;
      if (status) acc.status = status;
      if (apiConfig) acc.apiConfig = { ...acc.apiConfig, ...apiConfig };
      updatedAccount = acc;
    }
  });

  if (!updatedAccount) return res.status(404).json({ error: 'Account not found' });
  res.json({ success: true, account: updatedAccount });
});

// ----------------------------------------------------
// Automation Rules (ManyChat / Comment-to-DM Engine)
// ----------------------------------------------------
app.post('/api/rules', (req, res) => {
  const {
    accountId,
    name,
    triggerType,
    keywords,
    matchType,
    publicReplies,
    dmMessage,
    buttons,
    leadTag,
    targetPosts
  } = req.body;

  if (!name || !triggerType) {
    return res.status(400).json({ error: 'Name and triggerType are required.' });
  }

  const newRule = {
    id: `rule_${Date.now()}`,
    accountId: accountId || db.get().selectedAccountId,
    name,
    triggerType,
    keywords: Array.isArray(keywords) ? keywords : (keywords || '').split(',').map(s => s.trim()).filter(Boolean),
    matchType: matchType || 'contains',
    isActive: true,
    targetPosts: targetPosts || 'all',
    publicReplies: Array.isArray(publicReplies) ? publicReplies : [publicReplies || 'Hey @{{username}}, check your DMs! 🚀'],
    dmMessage: dmMessage || 'Hey {{username}}! Thanks for reaching out.',
    buttons: buttons || [],
    leadTag: leadTag || 'Instagram Lead',
    actionCount: 0,
    createdAt: new Date().toISOString()
  };

  db.update(data => {
    data.automationRules.unshift(newRule);
    data.logs.unshift({
      id: `log_${Date.now()}`,
      accountId: newRule.accountId,
      type: 'rule_created',
      timestamp: new Date().toISOString(),
      user: 'admin',
      message: `Created new automation flow: "${newRule.name}"`,
      status: 'success'
    });
  });

  automationEngine.broadcast('rule_created', newRule);
  res.status(201).json({ success: true, rule: newRule });
});

app.put('/api/rules/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedRule = null;

  db.update(data => {
    const rule = data.automationRules.find(r => r.id === id);
    if (rule) {
      Object.assign(rule, updates);
      if (typeof updates.keywords === 'string') {
        rule.keywords = updates.keywords.split(',').map(s => s.trim()).filter(Boolean);
      }
      updatedRule = rule;
    }
  });

  if (!updatedRule) return res.status(404).json({ error: 'Rule not found' });
  automationEngine.broadcast('rule_updated', updatedRule);
  res.json({ success: true, rule: updatedRule });
});

app.post('/api/rules/:id/toggle', (req, res) => {
  const { id } = req.params;
  let targetRule = null;

  db.update(data => {
    const rule = data.automationRules.find(r => r.id === id);
    if (rule) {
      rule.isActive = !rule.isActive;
      targetRule = rule;
    }
  });

  if (!targetRule) return res.status(404).json({ error: 'Rule not found' });
  res.json({ success: true, isActive: targetRule.isActive });
});

app.delete('/api/rules/:id', (req, res) => {
  const { id } = req.params;
  db.update(data => {
    data.automationRules = data.automationRules.filter(r => r.id !== id);
  });
  res.json({ success: true });
});

// ----------------------------------------------------
// Post & Reel Scheduler
// ----------------------------------------------------
app.post('/api/upload', upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

app.post('/api/posts', (req, res) => {
  const { accountId, type, caption, mediaUrl, hashtags, scheduledTime } = req.body;

  if (!caption || !mediaUrl) {
    return res.status(400).json({ error: 'Caption and media are required.' });
  }

  const newPost = {
    id: `post_${Date.now()}`,
    accountId: accountId || db.get().selectedAccountId,
    type: type || 'feed',
    caption,
    mediaUrl,
    hashtags: Array.isArray(hashtags) ? hashtags : (hashtags || '').split(/\s+/).filter(h => h.startsWith('#')),
    scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : new Date().toISOString(),
    status: scheduledTime && new Date(scheduledTime) > new Date() ? 'scheduled' : 'published',
    likesEstimate: Math.floor(Math.random() * 2000) + 300,
    commentsEstimate: Math.floor(Math.random() * 150) + 20,
    createdAt: new Date().toISOString(),
    publishedAt: scheduledTime && new Date(scheduledTime) > new Date() ? null : new Date().toISOString()
  };

  db.update(data => {
    data.scheduledPosts.unshift(newPost);
    if (newPost.status === 'published') {
      const acc = data.accounts.find(a => a.id === newPost.accountId);
      if (acc) {
        acc.stats.postsPublishedToday = (acc.stats.postsPublishedToday || 0) + 1;
        acc.postsCount = (acc.postsCount || 0) + 1;
      }
      data.logs.unshift({
        id: `log_${Date.now()}`,
        accountId: newPost.accountId,
        type: 'post_published',
        timestamp: new Date().toISOString(),
        user: 'user',
        message: `Directly published new ${newPost.type.toUpperCase()}: "${newPost.caption.substring(0, 35)}..."`,
        status: 'success'
      });
    }
  });

  automationEngine.broadcast('post_created', newPost);
  res.status(201).json({ success: true, post: newPost });
});

app.post('/api/posts/:id/publish-now', async (req, res) => {
  const { id } = req.params;
  const state = db.get();
  const post = state.scheduledPosts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const account = state.accounts.find(a => a.id === post.accountId) || state.accounts[0];
  const pubResult = await instagramService.publishPost(account, post);

  db.update(data => {
    const p = data.scheduledPosts.find(x => x.id === id);
    if (p) {
      p.status = 'published';
      p.publishedAt = new Date().toISOString();
    }
    const acc = data.accounts.find(a => a.id === account.id);
    if (acc) {
      acc.stats.postsPublishedToday = (acc.stats.postsPublishedToday || 0) + 1;
      acc.postsCount = (acc.postsCount || 0) + 1;
    }
    data.logs.unshift({
      id: `log_${Date.now()}`,
      accountId: account.id,
      type: 'post_published',
      timestamp: new Date().toISOString(),
      user: 'user',
      message: `Manual instant publish for ${post.type.toUpperCase()} [${pubResult.live ? 'Live' : 'Simulator'}]`,
      status: 'success'
    });
  });

  res.json({ success: true, post });
});

app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  db.update(data => {
    data.scheduledPosts = data.scheduledPosts.filter(p => p.id !== id);
  });
  res.json({ success: true });
});

// ----------------------------------------------------
// AI Caption & Hashtag Assistant Engine
// ----------------------------------------------------
app.post('/api/ai/generate-content', (req, res) => {
  const { topic, tone, goal, niche } = req.body;

  const templates = {
    viral_hook: [
      `Nobody is talking about this Instagram growth secret in 2026...\n\nIf you want to scale your ${topic || 'account'} on autopilot, here are the 3 non-negotiables you must implement today:\n\n1. Stop hard selling in your feed—use keyword-triggered DMs instead.\n2. Structure reels with a 1.8s hook and high loop velocity.\n3. Turn every commenter into an email lead within 60 seconds.\n\nDrop "${niche === 'fitness' ? 'FIT' : 'SCALE'}" in the comments and I'll send you the free step-by-step masterclass! 👇`,
      `Here is why 95% of creators fail with ${topic || 'social media'} (and the 5% that generate 6-figures work 1 hour a day):\n\nThey don't work harder—they build automated conversational funnels.\n\nSave this post so you don't forget these key frameworks: 📌\n\nComment "BLUEPRINT" below for the VIP swipe file! 🚀`,
      `The exact strategy I used to generate 10,000+ targeted leads for ${topic || 'my business'} with 0 ad spend:\n\nSwipe through the carousel to see the breakdown ➡️\n\nWhich slide surprised you the most? Let me know below!`
    ],
    hashtags: {
      tech: ['#ai', '#techtrends', '#automation', '#softwaredeveloper', '#startuplife', '#growthhacks', '#futuretech', '#nocode', '#saas', '#techinnovation'],
      marketing: ['#socialmediamarketing', '#digitalmarketingtips', '#contentcreator', '#marketingstrategy', '#leadgeneration', '#instagramgrowth', '#marketingagency', '#businessgrowth'],
      fitness: ['#fitnessgoals', '#workoutmotivation', '#nutritiontips', '#gymlife', '#onlinecoach', '#fitfam', '#healthylifestyle', '#bodytransformation'],
      creator: ['#creatoreconomy', '#contentcreator', '#reelsviral', '#influencermarketing', '#personalbrand', '#videocreator', '#monetize', '#audiencegrowth']
    }
  };

  const selectedHooks = templates.viral_hook;
  const generatedCaption = selectedHooks[Math.floor(Math.random() * selectedHooks.length)];
  const nicheTags = templates.hashtags[niche] || templates.hashtags.marketing;

  res.json({
    caption: generatedCaption,
    hashtags: nicheTags,
    suggestedHook: `Stop doing this with ${topic || 'your business'}...`,
    callToAction: `Comment "READY" below to receive the automated guide.`
  });
});

// ----------------------------------------------------
// Live Interactive Simulator Bench
// ----------------------------------------------------
app.post('/api/simulate/comment', async (req, res) => {
  const { accountId, postId, username, text } = req.body;
  if (!username || !text) {
    return res.status(400).json({ error: 'Username and comment text are required.' });
  }

  const result = await automationEngine.processCommentEvent({
    accountId: accountId || db.get().selectedAccountId,
    postId: postId || 'all',
    username: username.replace(/^@/, '').trim(),
    text: text.trim()
  });

  res.json(result);
});

app.post('/api/simulate/follow', async (req, res) => {
  const { accountId, username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const result = await automationEngine.processNewFollowerEvent({
    accountId: accountId || db.get().selectedAccountId,
    username: username.replace(/^@/, '').trim()
  });

  res.json(result);
});

// ----------------------------------------------------
// Leads Management & Export
// ----------------------------------------------------
app.get('/api/leads/export', (req, res) => {
  const state = db.get();
  const leads = state.leads || [];
  const format = req.query.format || 'json';

  if (format === 'csv') {
    const headers = ['ID', 'Username', 'Name', 'Email', 'Tag', 'SourceTrigger', 'Status', 'InteractionTime'];
    const rows = leads.map(l => [
      `"${l.id}"`,
      `"${l.username}"`,
      `"${l.name || ''}"`,
      `"${l.email || ''}"`,
      `"${l.tag || ''}"`,
      `"${(l.sourceTrigger || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.interactionTime}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="instaflow_leads.csv"');
    return res.send(csvContent);
  }

  res.json(leads);
});

// ----------------------------------------------------
// Meta Webhook Endpoints (Live Production Graph API)
// ----------------------------------------------------
app.get('/api/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const state = db.get();
  const account = state.accounts.find(a => a.id === state.selectedAccountId) || state.accounts[0];
  const expectedToken = account.apiConfig?.webhookVerifyToken || 'instaflow_secret_token_123';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Webhook] Meta webhook handshake verified successfully.');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/api/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'instagram') {
    for (const entry of body.entry || []) {
      // Process comments
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === 'comments') {
            const commentValue = change.value;
            await automationEngine.processCommentEvent({
              accountId: db.get().selectedAccountId,
              postId: commentValue.media?.id,
              commentId: commentValue.id,
              username: commentValue.from?.username,
              text: commentValue.text
            });
          }
        }
      }

      // Process direct messages
      if (entry.messaging) {
        for (const event of entry.messaging) {
          if (event.message && !event.message.is_echo) {
            console.log(`[Webhook] Incoming DM from ${event.sender?.id}: ${event.message.text}`);
          }
        }
      }
    }
    return res.status(200).send('EVENT_RECEIVED');
  }
  res.sendStatus(404);
});

// Start scheduler and listen
scheduler.start();

const server = app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`🚀 InstaFlow Pro - Instagram Automation Server Running`);
  console.log(`👉 Local Dashboard: http://${HOST}:${PORT}`);
  console.log(`⚡ Mode: Full Simulation & Meta Graph API Ready`);
  console.log(`====================================================`);
});

module.exports = { app, server };
