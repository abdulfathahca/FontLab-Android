const db = require('./database');
const instagramService = require('./instagramService');
const automationEngine = require('./automationEngine');

class PostScheduler {
  constructor() {
    this.timer = null;
    this.intervalMs = 25000; // Check every 25 seconds
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.checkScheduledJobs();
    }, this.intervalMs);
    console.log('[Scheduler] Background publisher & task runner started.');
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async checkScheduledJobs() {
    try {
      const state = db.get();
      const now = new Date();

      // Find posts scheduled at or before now that are still 'scheduled'
      const pendingPosts = (state.scheduledPosts || []).filter(p => 
        p.status === 'scheduled' && new Date(p.scheduledTime) <= now
      );

      for (const post of pendingPosts) {
        const account = (state.accounts || []).find(a => a.id === post.accountId) || state.accounts[0];
        console.log(`[Scheduler] Publishing post ${post.id} (${post.type}) for account @${account.username}...`);

        const pubResult = await instagramService.publishPost(account, post);

        db.update(data => {
          const targetPost = data.scheduledPosts.find(p => p.id === post.id);
          if (targetPost) {
            targetPost.status = pubResult.success ? 'published' : 'failed';
            targetPost.publishedAt = new Date().toISOString();
            if (pubResult.error) targetPost.error = pubResult.error;
          }

          const targetAcc = data.accounts.find(a => a.id === account.id);
          if (targetAcc && pubResult.success) {
            targetAcc.stats.postsPublishedToday = (targetAcc.stats.postsPublishedToday || 0) + 1;
            targetAcc.postsCount = (targetAcc.postsCount || 0) + 1;
          }

          data.logs.unshift({
            id: `log_${Date.now()}`,
            accountId: account.id,
            type: 'post_published',
            timestamp: new Date().toISOString(),
            user: 'scheduler',
            message: `Scheduled ${post.type.toUpperCase()} published: "${post.caption.substring(0, 40)}..." [${pubResult.live ? 'Live Graph API' : 'Simulated'}]`,
            status: pubResult.success ? 'success' : 'error'
          });
        });

        automationEngine.broadcast('post_published', {
          postId: post.id,
          success: pubResult.success,
          caption: post.caption,
          mediaUrl: post.mediaUrl
        });
      }
    } catch (err) {
      console.error('[Scheduler] Error checking scheduled jobs:', err);
    }
  }
}

module.exports = new PostScheduler();
