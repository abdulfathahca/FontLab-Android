import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { AutomationsPage } from './pages/AutomationsPage';
import { SchedulerPage } from './pages/SchedulerPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { LeadsPage } from './pages/LeadsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CreateRuleModal } from './components/CreateRuleModal';
import { CreatePostModal } from './components/CreatePostModal';

import {
  initialAccounts,
  initialRules,
  initialPosts,
  initialLeads,
  initialLogs,
} from './data/mockData';
import { Account, AutomationRule, ScheduledPost, Lead, ActivityLog } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc_1');
  const [rules, setRules] = useState<AutomationRule[]>(initialRules);
  const [posts, setPosts] = useState<ScheduledPost[]>(initialPosts);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);

  // Modals state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [simPresetComment, setSimPresetComment] = useState('Hey, can you send me the free BOOK?');

  const currentAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // Try fetching live state if backend server is available
  useEffect(() => {
    fetch('/api/state')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.accounts) setAccounts(data.accounts);
          if (data.selectedAccountId) setSelectedAccountId(data.selectedAccountId);
          if (data.automationRules) setRules(data.automationRules);
          if (data.scheduledPosts) setPosts(data.scheduledPosts);
          if (data.leads) setLeads(data.leads);
          if (data.logs) setLogs(data.logs);
        }
      })
      .catch(() => {
        // Standalone Lovable preview mode
      });
  }, []);

  // Handlers
  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Delete this automation flow?')) {
      setRules((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleTestRule = (rule: AutomationRule) => {
    const kw = (rule.keywords && rule.keywords[0]) || 'INFO';
    setSimPresetComment(`Hey, can you send me the ${kw}?`);
    setCurrentTab('simulator');
  };

  const handleSaveRule = (ruleData: Partial<AutomationRule>) => {
    const newRule: AutomationRule = {
      id: `rule_${Date.now()}`,
      accountId: selectedAccountId,
      name: ruleData.name || 'New Flow',
      triggerType: ruleData.triggerType || 'comment_keyword',
      keywords: ruleData.keywords || [],
      matchType: 'contains',
      isActive: true,
      targetPosts: 'all',
      publicReplies: ruleData.publicReplies || ['Hey @{{username}}, check your DMs! 🚀'],
      dmMessage: ruleData.dmMessage || 'Hello! Thanks for reaching out.',
      buttons: ruleData.buttons || [],
      leadTag: ruleData.leadTag || 'Instagram Lead',
      actionCount: 0,
      createdAt: new Date().toISOString(),
    };
    setRules((prev) => [newRule, ...prev]);
  };

  const handleSavePost = (postData: Partial<ScheduledPost>) => {
    const newPost: ScheduledPost = {
      id: `post_${Date.now()}`,
      accountId: selectedAccountId,
      type: postData.type || 'reel',
      caption: postData.caption || '',
      mediaUrl: postData.mediaUrl || '',
      hashtags: postData.hashtags || [],
      scheduledTime: postData.scheduledTime || new Date().toISOString(),
      status: postData.status || 'scheduled',
      likesEstimate: postData.likesEstimate || 1200,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePublishNow = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'published', publishedAt: new Date().toISOString() } : p))
    );
    alert('Post published live!');
  };

  const handleDeletePost = (id: string) => {
    if (confirm('Remove post from schedule?')) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleNewLeadTriggered = (username: string, ruleName: string) => {
    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      accountId: selectedAccountId,
      username,
      name: `@${username}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      sourceTrigger: `Triggered "${ruleName}"`,
      ruleId: 'sim_rule',
      tag: 'Simulator Lead',
      email: '',
      status: 'delivered',
      interactionTime: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);

    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        accountId: selectedAccountId,
        type: 'comment_to_dm',
        timestamp: new Date().toISOString(),
        user: username,
        message: `Simulation: Triggered "${ruleName}". Public reply posted and DM delivered.`,
        status: 'success',
      },
      ...prev,
    ]);
  };

  const handleUpdateAccount = (updatedData: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === selectedAccountId ? { ...acc, ...updatedData } : acc))
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f9fafb] flex flex-col">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'overview' && (
          <OverviewPage
            account={currentAccount}
            rules={rules.filter((r) => r.accountId === selectedAccountId)}
            logs={logs.filter((l) => l.accountId === selectedAccountId)}
            onOpenCreateRule={() => setIsRuleModalOpen(true)}
            onNavigateTab={setCurrentTab}
            onTestRule={handleTestRule}
          />
        )}

        {currentTab === 'automations' && (
          <AutomationsPage
            rules={rules.filter((r) => r.accountId === selectedAccountId)}
            onToggleActive={handleToggleRule}
            onDelete={handleDeleteRule}
            onTest={handleTestRule}
            onOpenCreateRule={() => setIsRuleModalOpen(true)}
          />
        )}

        {currentTab === 'scheduler' && (
          <SchedulerPage
            account={currentAccount}
            posts={posts.filter((p) => p.accountId === selectedAccountId)}
            onOpenCreatePost={() => setIsPostModalOpen(true)}
            onPublishNow={handlePublishNow}
            onDeletePost={handleDeletePost}
          />
        )}

        {currentTab === 'simulator' && (
          <SimulatorPage
            account={currentAccount}
            rules={rules.filter((r) => r.accountId === selectedAccountId)}
            posts={posts.filter((p) => p.accountId === selectedAccountId)}
            initialComment={simPresetComment}
            onNewLeadTriggered={handleNewLeadTriggered}
          />
        )}

        {currentTab === 'leads' && (
          <LeadsPage leads={leads.filter((l) => l.accountId === selectedAccountId)} />
        )}

        {currentTab === 'settings' && (
          <SettingsPage account={currentAccount} onUpdateAccount={handleUpdateAccount} />
        )}
      </main>

      {/* Modals */}
      <CreateRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        onSave={handleSaveRule}
      />

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleSavePost}
      />
    </div>
  );
};

export default App;
