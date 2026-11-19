const db = require('./database');
const instagramService = require('./instagramService');

class AutomationEngine {
  constructor() {
    this.sseClients = new Set();
  }

  // Register an SSE client for real-time live events
  addSseClient(res) {
    this.sseClients.add(res);
  }

  removeSseClient(res) {
    this.sseClients.delete(res);
  }

  // Broadcast event to connected frontend clients
  broadcast(eventType, payload) {
    const data = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
    for (const client of this.sseClients) {
      try {
        client.write(`event: ${eventType}\ndata: ${data}\n\n`);
      } catch (err) {
        this.sseClients.delete(client);
      }
    }
  }

  /**
   * Spintax parser: resolves {Hello|Hey|Hi} syntax into random selection
   */
  resolveSpintax(text) {
    if (!text) return '';
    const spintaxRegex = /\{([^{}]+)\}/g;
    return text.replace(spintaxRegex, (match, choices) => {
      const parts = choices.split('|');
      const chosen = parts[Math.floor(Math.random() * parts.length)];
      return chosen ? chosen.trim() : '';
    });
  }

  /**
   * Replace template variables like {{username}}, {{name}}
   */
  interpolate(text, vars = {}) {
    if (!text) return '';
    let result = text;
    for (const [key, val] of Object.entries(vars)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      result = result.replace(regex, val || '');
    }
    return this.resolveSpintax(result);
  }

  /**
   * Calculate random jitter delay between min and max seconds to emulate human behavior
   */
  getRandomJitter(minSec = 5, maxSec = 18) {
    return Math.floor(Math.random() * (maxSec - minSec + 1) + minSec);
  }

  /**
   * Check rate-limits and safety guardrails
   */
  canExecuteAction(account, actionType) {
    const limits = account.limits || { maxDmsPerHour: 30, maxCommentsPerHour: 35 };
    const stats = account.stats || {};

    if (actionType === 'dm' && stats.dmsSentToday >= limits.maxDmsPerHour * 10) {
      return { allowed: false, reason: 'Hourly/Daily Safe Mode DM threshold reached.' };
    }
    if (actionType === 'comment' && stats.commentsRepliedToday >= limits.maxCommentsPerHour * 10) {
      return { allowed: false, reason: 'Hourly/Daily Safe Mode Comment threshold reached.' };
    }
    return { allowed: true };
  }

  /**
   * Process a Comment event (live webhook or simulation)
   */
  async processCommentEvent({ accountId, postId, commentId, username, text, postTitle }) {
    const state = db.get();
    const account = state.accounts.find(a => a.id === accountId) || state.accounts[0];

    // Find matching rules for this account
    const rules = state.automationRules.filter(r => 
      r.accountId === account.id && 
      r.isActive && 
      r.triggerType === 'comment_keyword'
    );

    const normalizedText = (text || '').trim().toUpperCase();
    let matchedRule = null;

    for (const rule of rules) {
      // Check target post condition
      if (rule.targetPosts !== 'all' && rule.targetPosts !== postId) {
        continue;
      }

      // Check keyword condition
      const matched = (rule.keywords || []).some(kw => {
        const normalizedKw = kw.trim().toUpperCase();
        if (rule.matchType === 'exact') {
          return normalizedText === normalizedKw;
        } else {
          return normalizedText.includes(normalizedKw);
        }
      });

      if (matched) {
        matchedRule = rule;
        break;
      }
    }

    if (!matchedRule) {
      return {
        triggered: false,
        message: `No active rule matched comment: "${text}"`
      };
    }

    // Safety check
    const dmCheck = this.canExecuteAction(account, 'dm');
    if (!dmCheck.allowed) {
      this.logEvent(account.id, 'safety_warning', 'system', `Automation paused for @${username}: ${dmCheck.reason}`);
      return { triggered: false, reason: dmCheck.reason };
    }

    const jitterSec = this.getRandomJitter(account.limits?.delayMinSec || 4, account.limits?.delayMaxSec || 12);
    
    // Choose random public reply from pool
    const publicReplies = matchedRule.publicReplies || [];
    const chosenTemplate = publicReplies.length > 0 
      ? publicReplies[Math.floor(Math.random() * publicReplies.length)]
      : 'Hey @{{username}}, check your DMs! 🚀';
    
    const formattedReply = this.interpolate(chosenTemplate, { username });
    const formattedDm = this.interpolate(matchedRule.dmMessage, { username });

    // Execute Public Comment Reply
    const commentRes = await instagramService.replyToComment(account, commentId || `sim_c_${Date.now()}`, formattedReply);

    // Execute DM
    const dmRes = await instagramService.sendDirectMessage(
      account, 
      username, 
      formattedDm, 
      matchedRule.buttons || []
    );

    // Update database & stats
    db.update(data => {
      const acc = data.accounts.find(a => a.id === account.id);
      if (acc) {
        acc.stats.dmsSentToday = (acc.stats.dmsSentToday || 0) + 1;
        acc.stats.commentsRepliedToday = (acc.stats.commentsRepliedToday || 0) + 1;
        acc.stats.leadsCapturedToday = (acc.stats.leadsCapturedToday || 0) + 1;
      }

      const rule = data.automationRules.find(r => r.id === matchedRule.id);
      if (rule) {
        rule.actionCount = (rule.actionCount || 0) + 1;
      }

      // Record lead in CRM
      const existingLeadIndex = data.leads.findIndex(l => l.username.toLowerCase() === username.toLowerCase());
      if (existingLeadIndex >= 0) {
        data.leads[existingLeadIndex].status = 're-engaged';
        data.leads[existingLeadIndex].interactionTime = new Date().toISOString();
        data.leads[existingLeadIndex].sourceTrigger = `Comment "${text.substring(0, 20)}"`;
      } else {
        data.leads.unshift({
          id: `lead_${Date.now()}`,
          accountId: account.id,
          username,
          name: `@${username}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          sourceTrigger: `Comment "${text.substring(0, 20)}"`,
          ruleId: matchedRule.id,
          tag: matchedRule.leadTag || 'Instagram Lead',
          email: '',
          status: 'delivered',
          interactionTime: new Date().toISOString()
        });
      }

      // Add to event logs
      data.logs.unshift({
        id: `log_${Date.now()}`,
        accountId: account.id,
        type: 'comment_to_dm',
        timestamp: new Date().toISOString(),
        user: username,
        message: `Keyword matched in comment: "${text}". Public reply: "${formattedReply}". DM delivered with ${matchedRule.buttons?.length || 0} button(s) [Jitter: ${jitterSec}s].`,
        status: 'success'
      });

      // Keep recent 100 logs
      if (data.logs.length > 100) data.logs.length = 100;
    });

    const executionResult = {
      triggered: true,
      ruleName: matchedRule.name,
      username,
      commentReply: formattedReply,
      dmMessage: formattedDm,
      buttons: matchedRule.buttons || [],
      jitterSec,
      live: account.apiConfig?.isLiveMode || false
    };

    // Broadcast to UI
    this.broadcast('automation_trigger', executionResult);
    return executionResult;
  }

  /**
   * Process a New Follower event
   */
  async processNewFollowerEvent({ accountId, username }) {
    const state = db.get();
    const account = state.accounts.find(a => a.id === accountId) || state.accounts[0];

    const rule = state.automationRules.find(r => 
      r.accountId === account.id && 
      r.isActive && 
      r.triggerType === 'welcome_new_follower'
    );

    if (!rule) {
      return { triggered: false, message: 'No active welcome follower rule found.' };
    }

    const formattedDm = this.interpolate(rule.dmMessage, { username });
    await instagramService.sendDirectMessage(account, username, formattedDm, rule.buttons || []);

    db.update(data => {
      const acc = data.accounts.find(a => a.id === account.id);
      if (acc) acc.stats.dmsSentToday = (acc.stats.dmsSentToday || 0) + 1;
      
      const r = data.automationRules.find(x => x.id === rule.id);
      if (r) r.actionCount = (r.actionCount || 0) + 1;

      data.logs.unshift({
        id: `log_${Date.now()}`,
        accountId: account.id,
        type: 'welcome_follower',
        timestamp: new Date().toISOString(),
        user: username,
        message: `Sent automatic welcome DM to new follower @${username}.`,
        status: 'success'
      });
    });

    const result = {
      triggered: true,
      ruleName: rule.name,
      username,
      dmMessage: formattedDm,
      buttons: rule.buttons || []
    };

    this.broadcast('automation_trigger', result);
    return result;
  }

  logEvent(accountId, type, user, message, status = 'info') {
    db.update(data => {
      data.logs.unshift({
        id: `log_${Date.now()}`,
        accountId,
        type,
        timestamp: new Date().toISOString(),
        user,
        message,
        status
      });
      if (data.logs.length > 100) data.logs.length = 100;
    });
    this.broadcast('log_event', { accountId, type, user, message, status });
  }
}

module.exports = new AutomationEngine();
