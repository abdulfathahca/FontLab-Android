// InstaFlow Pro - Client-side Application Controller
let state = {
  accounts: [],
  selectedAccountId: null,
  automationRules: [],
  scheduledPosts: [],
  leads: [],
  logs: []
};

// ==========================================
// Initialization & Data Loading
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  setupEventListeners();
  await fetchState();
  initEventStream();
});

async function fetchState() {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('Failed to load state');
    state = await res.json();
    renderAll();
  } catch (err) {
    console.error('Error fetching state:', err);
    showToast('Failed to connect to backend server', 'error');
  }
}

// ==========================================
// Server-Sent Events (SSE) Live Stream
// ==========================================
function initEventStream() {
  const evtSource = new EventSource('/api/events');
  const statusEl = document.getElementById('sse-status');

  evtSource.onopen = () => {
    if (statusEl) statusEl.innerText = 'Live Engine Active';
  };

  evtSource.onerror = () => {
    if (statusEl) statusEl.innerText = 'Reconnecting...';
  };

  evtSource.addEventListener('automation_trigger', (e) => {
    const payload = JSON.parse(e.data);
    showToast(`⚡ Automation triggered: ${payload.data.ruleName} for @${payload.data.username}`);
    fetchState();
  });

  evtSource.addEventListener('post_published', (e) => {
    const payload = JSON.parse(e.data);
    showToast(`🚀 New post published automatically!`);
    fetchState();
  });

  evtSource.addEventListener('log_event', (e) => {
    fetchState();
  });
}

// ==========================================
// Tab Switching
// ==========================================
function setupTabs() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-tab');
      switchTab(targetId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.style.display = 'block';

  const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (activeNav) activeNav.classList.add('active');

  // Re-run icons
  if (window.lucide) window.lucide.createIcons();
}

// ==========================================
// Render Controllers
// ==========================================
function renderAll() {
  renderAccountInfo();
  renderOverview();
  renderRules();
  renderScheduler();
  renderLeads();
  renderSettings();
  populateSimulatorOptions();
  if (window.lucide) window.lucide.createIcons();
}

function getSelectedAccount() {
  return state.accounts.find(a => a.id === state.selectedAccountId) || state.accounts[0] || {};
}

function renderAccountInfo() {
  const acc = getSelectedAccount();
  if (!acc) return;

  const userEl = document.getElementById('nav-account-username');
  const avatarEl = document.getElementById('nav-account-avatar');
  const statusEl = document.getElementById('nav-account-status');
  const selectEl = document.getElementById('account-select');

  if (userEl) userEl.innerText = `@${acc.username}`;
  if (avatarEl) avatarEl.src = acc.avatar || '';
  if (statusEl) {
    statusEl.innerHTML = acc.status === 'active' 
      ? '● Safe Mode On' 
      : acc.status === 'warming_up' 
        ? '<span style="color: #f59e0b;">● Warming Up</span>' 
        : '● Paused';
  }

  // Populate account select dropdown
  if (selectEl) {
    selectEl.innerHTML = state.accounts.map(a => 
      `<option value="${a.id}" ${a.id === state.selectedAccountId ? 'selected' : ''}>@${a.username} (${a.name})</option>`
    ).join('');
  }
}

// Render Overview Tab
function renderOverview() {
  const acc = getSelectedAccount();
  const stats = acc.stats || {};

  document.getElementById('stat-dms').innerText = stats.dmsSentToday || 0;
  document.getElementById('stat-comments').innerText = stats.commentsRepliedToday || 0;
  document.getElementById('stat-leads').innerText = stats.leadsCapturedToday || 0;
  document.getElementById('stat-safety').innerHTML = `${stats.safetyScore || 98}<span style="font-size: 1rem; color: var(--text-dim);">/100</span>`;

  // Render quick rules list
  const rulesList = document.getElementById('overview-rules-list');
  const accRules = state.automationRules.filter(r => r.accountId === acc.id);

  if (rulesList) {
    if (accRules.length === 0) {
      rulesList.innerHTML = `<div style="color: var(--text-dim); font-size: 0.85rem; padding: 12px;">No active automations yet. Create one above!</div>`;
    } else {
      rulesList.innerHTML = accRules.slice(0, 4).map(rule => `
        <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; gap: 8px;">
              <span>${rule.name}</span>
              <span class="badge ${rule.isActive ? 'badge-purple' : 'badge-amber'}">${rule.isActive ? 'Active' : 'Paused'}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
              Keywords: <span style="color: #38bdf8;">${(rule.keywords || []).join(', ') || 'Any Follower'}</span> • Triggered ${rule.actionCount || 0} times
            </div>
          </div>
          <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 4px 10px;" onclick="testRuleInSimulator('${rule.id}')">
            Test Flow
          </button>
        </div>
      `).join('');
    }
  }

  // Render Activity Feed
  const feedEl = document.getElementById('overview-activity-feed');
  const logs = state.logs || [];
  if (feedEl) {
    document.getElementById('feed-count-label').innerText = `${logs.length} logged events`;
    if (logs.length === 0) {
      feedEl.innerHTML = `<div style="color: var(--text-dim); font-size: 0.85rem;">Waiting for events...</div>`;
    } else {
      feedEl.innerHTML = logs.slice(0, 15).map(log => {
        const timeFormatted = new Date(log.timestamp).toLocaleTimeString();
        let badgeColor = '#3b82f6';
        let badgeText = log.type;

        if (log.type === 'comment_to_dm') {
          badgeColor = '#ec4899';
          badgeText = 'DM Trigger';
        } else if (log.type === 'post_published') {
          badgeColor = '#10b981';
          badgeText = 'Post Pub';
        } else if (log.type === 'safety_check') {
          badgeColor = '#f59e0b';
          badgeText = 'Safe Mode';
        }

        return `
          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 10px 14px; font-size: 0.82rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 0.72rem; font-weight: 700; color: ${badgeColor}; text-transform: uppercase;">● ${badgeText}</span>
              <span style="font-size: 0.72rem; color: var(--text-dim);">${timeFormatted}</span>
            </div>
            <div style="color: var(--text-main); line-height: 1.35;">${log.message}</div>
          </div>
        `;
      }).join('');
    }
  }
}

// Render Automation Rules Tab
function renderRules() {
  const grid = document.getElementById('rules-grid');
  const acc = getSelectedAccount();
  const rules = state.automationRules.filter(r => r.accountId === acc.id);

  if (!grid) return;
  if (rules.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No rules found for @${acc.username}. Click 'Create New Flow' to build your first automation.</div>`;
    return;
  }

  grid.innerHTML = rules.map(rule => {
    const keywordsBadges = (rule.keywords || []).map(k => 
      `<span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">${k}</span>`
    ).join(' ');

    const buttonsPreview = (rule.buttons || []).map(b =>
      `<span style="background: #27272a; border: 1px solid #3f3f46; color: #a1a1aa; padding: 4px 8px; border-radius: 6px; font-size: 0.72rem;">🔗 ${b.label}</span>`
    ).join(' ');

    return `
      <div class="glass-panel" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 4px;">${rule.name}</h3>
              <span class="badge ${rule.triggerType === 'comment_keyword' ? 'badge-purple' : 'badge-blue'}">
                ${rule.triggerType === 'comment_keyword' ? 'Comment-to-DM' : rule.triggerType === 'welcome_new_follower' ? 'Follower Drip' : 'Story Mention'}
              </span>
            </div>

            <label class="switch">
              <input type="checkbox" ${rule.isActive ? 'checked' : ''} onchange="toggleRuleActive('${rule.id}')">
              <span class="slider"></span>
            </label>
          </div>

          <!-- Keywords -->
          ${rule.keywords && rule.keywords.length > 0 ? `
            <div style="margin-bottom: 12px;">
              <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Trigger Keywords</div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">${keywordsBadges}</div>
            </div>
          ` : ''}

          <!-- Direct Message Preview -->
          <div style="margin-bottom: 14px;">
            <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">DM Message Delivered</div>
            <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 12px; font-size: 0.8rem; line-height: 1.4; color: #e2e8f0; max-height: 85px; overflow-y: auto;">
              ${rule.dmMessage.replace(/\n/g, '<br>')}
            </div>
          </div>

          <!-- Action Buttons Preview -->
          ${rule.buttons && rule.buttons.length > 0 ? `
            <div style="margin-bottom: 14px;">
              <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Buttons Included</div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">${buttonsPreview}</div>
            </div>
          ` : ''}
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: 12px; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 0.75rem; color: var(--text-dim);">
            Triggered <strong style="color: var(--text-main);">${rule.actionCount || 0}</strong> times
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 5px 10px;" onclick="testRuleInSimulator('${rule.id}')">
              <i data-lucide="play" style="width: 13px; height: 13px;"></i>
              <span>Test</span>
            </button>
            <button class="btn btn-outline-danger" style="font-size: 0.75rem; padding: 5px 10px;" onclick="deleteRule('${rule.id}')">
              <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Scheduler Tab & Mockup
function renderScheduler() {
  const listEl = document.getElementById('scheduler-posts-list');
  const acc = getSelectedAccount();
  const posts = state.scheduledPosts.filter(p => p.accountId === acc.id);

  if (!listEl) return;
  if (posts.length === 0) {
    listEl.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px;">No scheduled posts yet. Click 'Schedule New Post' to queue your next Reel or Carousel!</div>`;
    return;
  }

  listEl.innerHTML = posts.map(post => {
    const isScheduled = post.status === 'scheduled';
    const postDate = new Date(post.scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return `
      <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; display: flex; gap: 16px; align-items: center; cursor: pointer;" onclick="previewPostInMockup('${post.id}')">
        <img src="${post.mediaUrl}" alt="Media" style="width: 72px; height: 72px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #000;">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="badge ${isScheduled ? 'badge-amber' : 'badge-purple'}">${post.status.toUpperCase()}</span>
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">${post.type}</span>
            <span style="font-size: 0.75rem; color: var(--text-dim); margin-left: auto;">${isScheduled ? `Scheduled: ${postDate}` : 'Published'}</span>
          </div>
          <div style="font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-main); margin-bottom: 4px;">
            ${post.caption}
          </div>
          <div style="font-size: 0.75rem; color: #38bdf8;">
            ${(post.hashtags || []).slice(0, 3).join(' ')}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;">
          ${isScheduled ? `
            <button class="btn btn-primary" style="font-size: 0.72rem; padding: 5px 10px;" onclick="event.stopPropagation(); publishPostNow('${post.id}')">
              Publish Now
            </button>
          ` : `
            <span style="font-size: 0.72rem; color: #10b981; font-weight: 600; text-align: center;">Live on IG</span>
          `}
          <button class="btn btn-outline-danger" style="font-size: 0.72rem; padding: 4px 8px;" onclick="event.stopPropagation(); deletePost('${post.id}')">
            Delete
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Default preview first post
  if (posts[0]) {
    previewPostInMockup(posts[0].id);
  }
}

function previewPostInMockup(postId) {
  const post = state.scheduledPosts.find(p => p.id === postId);
  const acc = getSelectedAccount();
  if (!post) return;

  const userEl = document.getElementById('mockup-username');
  const avatarEl = document.getElementById('mockup-avatar');
  const imgEl = document.getElementById('mockup-image');
  const captionUserEl = document.getElementById('mockup-caption-user');
  const captionTextEl = document.getElementById('mockup-caption-text');
  const hashtagsEl = document.getElementById('mockup-hashtags');
  const likesEl = document.getElementById('mockup-likes');

  if (userEl) userEl.innerText = acc.username;
  if (avatarEl) avatarEl.src = acc.avatar;
  if (imgEl) imgEl.src = post.mediaUrl;
  if (captionUserEl) captionUserEl.innerText = acc.username;
  if (captionTextEl) captionTextEl.innerText = post.caption;
  if (hashtagsEl) hashtagsEl.innerText = (post.hashtags || []).join(' ');
  if (likesEl) likesEl.innerText = `${(post.likesEstimate || 1200).toLocaleString()} likes`;
}

// Render Leads CRM
function renderLeads() {
  const tableBody = document.getElementById('leads-table-body');
  const leads = state.leads || [];

  if (!tableBody) return;
  if (leads.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No captured leads yet. Interacting with automated DM flows will populate contacts here.</td></tr>`;
    return;
  }

  tableBody.innerHTML = leads.map(l => {
    const timeFormatted = new Date(l.interactionTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${l.avatar}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%; background: #27272a;">
            <div>
              <div style="font-weight: 700;">@${l.username}</div>
              <div style="font-size: 0.72rem; color: var(--text-dim);">${l.email || 'Email not linked'}</div>
            </div>
          </div>
        </td>
        <td><span style="font-size: 0.82rem; color: #38bdf8;">${l.sourceTrigger}</span></td>
        <td><span class="badge badge-purple">${l.tag}</span></td>
        <td><span class="badge ${l.status === 'delivered' ? 'badge-blue' : 'badge-amber'}">${l.status}</span></td>
        <td style="font-size: 0.8rem; color: var(--text-dim);">${timeFormatted}</td>
      </tr>
    `;
  }).join('');
}

// Render Settings
function renderSettings() {
  const acc = getSelectedAccount();
  if (!acc) return;

  const safeModeCheck = document.getElementById('setting-safemode');
  const maxDmsInput = document.getElementById('setting-max-dms');
  const maxCommentsInput = document.getElementById('setting-max-comments');
  const liveModeCheck = document.getElementById('setting-livemode');
  const tokenInput = document.getElementById('setting-token');
  const igidInput = document.getElementById('setting-igid');

  if (safeModeCheck) safeModeCheck.checked = acc.safeMode !== false;
  if (maxDmsInput) {
    maxDmsInput.value = acc.limits?.maxDmsPerHour || 35;
    document.getElementById('label-max-dms').innerText = maxDmsInput.value;
  }
  if (maxCommentsInput) {
    maxCommentsInput.value = acc.limits?.maxCommentsPerHour || 40;
    document.getElementById('label-max-comments').innerText = maxCommentsInput.value;
  }
  if (liveModeCheck) {
    liveModeCheck.checked = acc.apiConfig?.isLiveMode || false;
    document.getElementById('api-mode-label').innerText = liveModeCheck.checked 
      ? 'Live Meta Instagram Graph API Mode' 
      : 'High-Fidelity Simulator (No Meta App Required)';
  }
  if (tokenInput) tokenInput.value = acc.apiConfig?.pageAccessToken || '';
  if (igidInput) igidInput.value = acc.apiConfig?.instagramAccountId || '';
}

function populateSimulatorOptions() {
  const select = document.getElementById('sim-post-select');
  const acc = getSelectedAccount();
  const posts = state.scheduledPosts.filter(p => p.accountId === acc.id);

  if (!select) return;
  select.innerHTML = `
    <option value="all">Any Active Post / Reel (Global Keywords)</option>
    ${posts.map(p => `<option value="${p.id}">${p.type.toUpperCase()}: ${p.caption.substring(0, 45)}...</option>`).join('')}
  `;
}

// ==========================================
// Actions & Handlers
// ==========================================
function setupEventListeners() {
  // Account select change
  const selectEl = document.getElementById('account-select');
  if (selectEl) {
    selectEl.addEventListener('change', async (e) => {
      const accountId = e.target.value;
      try {
        await fetch('/api/account/switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId })
        });
        state.selectedAccountId = accountId;
        renderAll();
        showToast(`Switched account to @${getSelectedAccount().username}`);
      } catch (err) {
        showToast('Failed to switch account', 'error');
      }
    });
  }

  // Trigger type change in modal
  const triggerSelect = document.getElementById('rule-trigger');
  if (triggerSelect) {
    triggerSelect.addEventListener('change', (e) => {
      const isComment = e.target.value === 'comment_keyword';
      document.getElementById('group-keywords').style.display = isComment ? 'block' : 'none';
      document.getElementById('group-public-replies').style.display = isComment ? 'block' : 'none';
    });
  }

  // Live mode switch toggle in settings
  const liveModeCheck = document.getElementById('setting-livemode');
  if (liveModeCheck) {
    liveModeCheck.addEventListener('change', (e) => {
      document.getElementById('api-mode-label').innerText = e.target.checked 
        ? 'Live Meta Instagram Graph API Mode' 
        : 'High-Fidelity Simulator (No Meta App Required)';
    });
  }
}

// Modal Helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

function openCreateRuleModal() {
  document.getElementById('form-rule').reset();
  document.getElementById('rule-edit-id').value = '';
  document.getElementById('modal-rule-title').innerText = 'Create Automation Flow';
  document.getElementById('group-keywords').style.display = 'block';
  document.getElementById('group-public-replies').style.display = 'block';
  openModal('modal-rule');
}

function openCreatePostModal() {
  document.getElementById('form-post').reset();
  openModal('modal-post');
}

// Submit Rule
async function handleRuleSubmit(e) {
  e.preventDefault();
  const acc = getSelectedAccount();
  const editId = document.getElementById('rule-edit-id').value;
  
  const payload = {
    accountId: acc.id,
    name: document.getElementById('rule-name').value,
    triggerType: document.getElementById('rule-trigger').value,
    keywords: document.getElementById('rule-keywords').value,
    publicReplies: document.getElementById('rule-public-replies').value.split('\n').filter(Boolean),
    dmMessage: document.getElementById('rule-dm-message').value,
    leadTag: document.getElementById('rule-lead-tag').value,
    buttons: []
  };

  const btnLabel = document.getElementById('rule-button-label').value;
  const btnUrl = document.getElementById('rule-button-url').value;
  if (btnLabel && btnUrl) {
    payload.buttons.push({ label: btnLabel, url: btnUrl });
  }

  try {
    let res;
    if (editId) {
      res = await fetch(`/api/rules/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) throw new Error('Failed to save flow');
    closeModal('modal-rule');
    showToast(editId ? 'Automation flow updated!' : 'New automation flow created!');
    await fetchState();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleRuleActive(id) {
  try {
    const res = await fetch(`/api/rules/${id}/toggle`, { method: 'POST' });
    const json = await res.json();
    showToast(json.isActive ? 'Flow Activated' : 'Flow Paused');
    await fetchState();
  } catch (err) {
    showToast('Failed to toggle flow', 'error');
  }
}

async function deleteRule(id) {
  if (!confirm('Are you sure you want to delete this automation flow?')) return;
  try {
    await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    showToast('Flow deleted');
    await fetchState();
  } catch (err) {
    showToast('Failed to delete flow', 'error');
  }
}

// Submit Post
async function handlePostSubmit(e) {
  e.preventDefault();
  const acc = getSelectedAccount();

  const payload = {
    accountId: acc.id,
    type: document.getElementById('post-type').value,
    scheduledTime: document.getElementById('post-time').value,
    mediaUrl: document.getElementById('post-media-url').value,
    caption: document.getElementById('post-caption').value,
    hashtags: document.getElementById('post-hashtags').value
  };

  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to schedule post');
    closeModal('modal-post');
    showToast('Post queued successfully!');
    await fetchState();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function publishPostNow(id) {
  try {
    const res = await fetch(`/api/posts/${id}/publish-now`, { method: 'POST' });
    if (!res.ok) throw new Error('Publish failed');
    showToast('🚀 Post published instantly!');
    await fetchState();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deletePost(id) {
  if (!confirm('Delete this post from schedule?')) return;
  try {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    showToast('Post removed from queue');
    await fetchState();
  } catch (err) {
    showToast('Failed to delete post', 'error');
  }
}

// AI Content Generator
async function generateAiContent() {
  const topic = document.getElementById('ai-topic').value || '10x Instagram growth strategies';
  const niche = document.getElementById('ai-niche').value;

  try {
    const res = await fetch('/api/ai/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, niche })
    });
    const data = await res.json();
    document.getElementById('post-caption').value = data.caption;
    document.getElementById('post-hashtags').value = (data.hashtags || []).join(' ');
    showToast('AI Caption & Hashtags generated! ✨');
  } catch (err) {
    showToast('AI generation failed', 'error');
  }
}

// ==========================================
// Simulator Engine Handlers
// ==========================================
function setSimComment(text) {
  document.getElementById('sim-comment').value = text;
}

function testRuleInSimulator(ruleId) {
  const rule = state.automationRules.find(r => r.id === ruleId);
  if (!rule) return;

  switchTab('tab-simulator');
  const kw = (rule.keywords && rule.keywords[0]) || 'INFO';
  document.getElementById('sim-comment').value = `Hey, can you send me the ${kw}?`;
  showToast(`Loaded rule "${rule.name}" into test bench`);
}

async function executeSimulatedComment() {
  const acc = getSelectedAccount();
  const postId = document.getElementById('sim-post-select').value;
  const username = document.getElementById('sim-username').value;
  const text = document.getElementById('sim-comment').value;

  const chatContainer = document.getElementById('sim-chat-messages');
  const replyBox = document.getElementById('sim-public-reply-box');
  const replyText = document.getElementById('sim-public-reply-text');

  // Add animated typing indicator
  chatContainer.innerHTML = `
    <div style="text-align: center; color: #ec4899; font-size: 0.8rem; margin: 10px auto;">
      <span class="pulse-dot" style="display: inline-block; margin-right: 6px;"></span>
      Detecting keyword and calculating human anti-ban jitter...
    </div>
  `;

  try {
    const res = await fetch('/api/simulate/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: acc.id,
        postId,
        username,
        text
      })
    });
    const data = await res.json();

    if (!data.triggered) {
      chatContainer.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; border-radius: 10px; padding: 14px; font-size: 0.82rem; margin: auto; text-align: center;">
          ⚠️ ${data.message || data.reason || 'No rule triggered for this comment.'}
        </div>
      `;
      replyBox.style.display = 'none';
      return;
    }

    // Render Public comment notification
    replyBox.style.display = 'block';
    replyText.innerText = data.commentReply;

    // Render simulated direct messages
    const buttonLinksHtml = (data.buttons || []).map(b => 
      `<a href="${b.url}" target="_blank" class="dm-button-link">${b.label}</a>`
    ).join('');

    chatContainer.innerHTML = `
      <!-- User's simulated intent -->
      <div class="dm-bubble-sent">
        <div style="font-size: 0.7rem; opacity: 0.75; margin-bottom: 2px;">User Comment Detected:</div>
        "${text}"
      </div>

      <!-- Automation Delivered DM -->
      <div class="dm-bubble-received">
        <div style="font-size: 0.7rem; color: #a1a1aa; margin-bottom: 3px;">
          ⚡ InstaFlow Bot (${data.jitterSec}s anti-ban jitter applied):
        </div>
        <div>${data.dmMessage.replace(/\n/g, '<br>')}</div>
        ${buttonLinksHtml}
      </div>
    `;

    showToast(`Flow triggered: "${data.ruleName}"! DM delivered.`);
    fetchState();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Save Settings
async function saveSettings() {
  const acc = getSelectedAccount();
  const safeMode = document.getElementById('setting-safemode').checked;
  const maxDmsPerHour = parseInt(document.getElementById('setting-max-dms').value, 10);
  const maxCommentsPerHour = parseInt(document.getElementById('setting-max-comments').value, 10);
  const isLiveMode = document.getElementById('setting-livemode').checked;
  const pageAccessToken = document.getElementById('setting-token').value;
  const instagramAccountId = document.getElementById('setting-igid').value;

  try {
    const res = await fetch('/api/account/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: acc.id,
        safeMode,
        limits: { maxDmsPerHour, maxCommentsPerHour },
        apiConfig: { isLiveMode, pageAccessToken, instagramAccountId }
      })
    });
    if (!res.ok) throw new Error('Settings update failed');
    showToast('Settings saved successfully!');
    await fetchState();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Toast helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') {
    toast.style.borderLeftColor = '#ef4444';
  }
  toast.innerHTML = `
    <i data-lucide="${type === 'error' ? 'alert-triangle' : 'check-circle'}" style="width: 18px; height: 18px; color: ${type === 'error' ? '#ef4444' : '#10b981'};"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
