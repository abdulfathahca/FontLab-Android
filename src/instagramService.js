/**
 * Instagram Service
 * Supports both Meta Instagram Graph API (production)
 * and High-Fidelity Simulation Engine (for testing & development without live tokens)
 */

class InstagramService {
  constructor() {
    this.graphApiBase = 'https://graph.facebook.com/v21.0';
  }

  /**
   * Post a public comment reply
   */
  async replyToComment(account, commentId, text) {
    if (account.apiConfig?.isLiveMode && account.apiConfig?.pageAccessToken) {
      try {
        const url = `${this.graphApiBase}/${commentId}/replies`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            access_token: account.apiConfig.pageAccessToken
          })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Meta API Comment Reply Failed');
        return { success: true, id: json.id, live: true };
      } catch (err) {
        console.error('Meta Graph API reply error:', err.message);
        return { success: false, error: err.message, live: true };
      }
    }

    // Simulator mode
    return {
      success: true,
      id: `sim_reply_${Date.now()}`,
      live: false,
      text
    };
  }

  /**
   * Send Direct Message to an Instagram user
   */
  async sendDirectMessage(account, recipientIdOrUsername, message, buttons = []) {
    if (account.apiConfig?.isLiveMode && account.apiConfig?.pageAccessToken) {
      try {
        const url = `${this.graphApiBase}/me/messages`;
        
        // Build payload according to Instagram Send API specification
        let payload;
        if (buttons && buttons.length > 0) {
          payload = {
            recipient: { id: recipientIdOrUsername },
            message: {
              attachment: {
                type: 'template',
                payload: {
                  template_type: 'generic',
                  elements: [
                    {
                      title: message.substring(0, 80),
                      subtitle: message.length > 80 ? message.substring(80, 160) : 'Tap below to continue:',
                      buttons: buttons.map(b => ({
                        type: 'web_url',
                        url: b.url,
                        title: b.label.substring(0, 20)
                      }))
                    }
                  ]
                }
              }
            },
            access_token: account.apiConfig.pageAccessToken
          };
        } else {
          payload = {
            recipient: { id: recipientIdOrUsername },
            message: { text: message },
            access_token: account.apiConfig.pageAccessToken
          };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Meta API DM Send Failed');
        return { success: true, messageId: json.message_id, live: true };
      } catch (err) {
        console.error('Meta Graph API DM error:', err.message);
        return { success: false, error: err.message, live: true };
      }
    }

    // Simulator mode
    return {
      success: true,
      messageId: `sim_msg_${Date.now()}`,
      live: false,
      deliveredTo: recipientIdOrUsername,
      buttonsCount: buttons.length
    };
  }

  /**
   * Publish a scheduled post to Instagram Feed / Reels / Carousel
   */
  async publishPost(account, post) {
    if (account.apiConfig?.isLiveMode && account.apiConfig?.instagramAccountId && account.apiConfig?.pageAccessToken) {
      try {
        const igUserId = account.apiConfig.instagramAccountId;
        const token = account.apiConfig.pageAccessToken;

        // Step 1: Create media container
        let containerUrl = `${this.graphApiBase}/${igUserId}/media`;
        const params = {
          caption: `${post.caption}\n\n${(post.hashtags || []).join(' ')}`,
          access_token: token
        };

        if (post.type === 'reel') {
          params.media_type = 'REELS';
          params.video_url = post.mediaUrl;
        } else {
          params.image_url = post.mediaUrl;
        }

        const createRes = await fetch(containerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        const createJson = await createRes.json();
        if (!createRes.ok) throw new Error(createJson.error?.message || 'Failed creating IG container');

        // Step 2: Publish media container
        const publishUrl = `${this.graphApiBase}/${igUserId}/media_publish`;
        const publishRes = await fetch(publishUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: createJson.id,
            access_token: token
          })
        });
        const pubJson = await publishRes.json();
        if (!publishRes.ok) throw new Error(pubJson.error?.message || 'Failed publishing IG post');

        return { success: true, live: true, mediaId: pubJson.id };
      } catch (err) {
        console.error('Meta Graph API Publish error:', err.message);
        return { success: false, live: true, error: err.message };
      }
    }

    // Simulator mode
    return {
      success: true,
      live: false,
      mediaId: `sim_post_${Date.now()}`
    };
  }

  /**
   * Verify Webhook challenge for Meta App Setup
   */
  verifyWebhook(queryToken, expectedToken, challenge) {
    if (queryToken && queryToken === expectedToken) {
      return challenge;
    }
    return null;
  }
}

module.exports = new InstagramService();
