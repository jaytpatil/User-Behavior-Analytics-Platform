/**
 * CausalFunnel User Behavior Analytics Tracking SDK
 * Lightweight, zero-dependency client-side tracking script
 */
(function (window, document) {
  'use strict';

  // Prevent multiple initializations
  if (window.__CausalFunnelInitialized__) return;
  window.__CausalFunnelInitialized__ = true;

  // Session configuration
  const SESSION_STORAGE_KEY = 'cf_analytics_session';
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout
  const MAX_RETRIES = 3;
  const RETRY_DELAY_BASE_MS = 1000;

  // Locate the script tag to extract configuration data attributes
  const currentScript =
    document.currentScript ||
    document.querySelector('script[data-api-url]') ||
    document.querySelector('script[src*="tracker.js"]');

  let defaultApiUrl = 'http://localhost:5000/api/events';
  if (currentScript && currentScript.src) {
    try {
      const scriptUrl = new URL(currentScript.src);
      defaultApiUrl = `${scriptUrl.origin}/api/events`;
    } catch (e) {}
  }

  const apiUrl =
    (currentScript && currentScript.getAttribute('data-api-url')) ||
    window.CAUSALFUNNEL_API_URL ||
    defaultApiUrl;

  /**
   * Cryptographically secure UUID generator
   */
  function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const buffer = new Uint8Array(16);
      crypto.getRandomValues(buffer);
      buffer[6] = (buffer[6] & 0x0f) | 0x40; // Version 4
      buffer[8] = (buffer[8] & 0x3f) | 0x80; // Variant 10
      const hex = Array.from(buffer, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    // Fallback pseudo-random identifier
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Session Management:
   * Reuses active session or creates new session if inactive > 30 minutes.
   */
  class SessionManager {
    static getSession() {
      const now = Date.now();
      let sessionData = null;

      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          sessionData = JSON.parse(raw);
        }
      } catch (e) {
        // Fallback for cookie or restricted environments
      }

      // Check if session exists and is still valid (within 30 mins)
      if (sessionData && sessionData.sessionId && sessionData.lastActivity) {
        const elapsed = now - sessionData.lastActivity;
        if (elapsed < SESSION_TIMEOUT_MS) {
          // Update lastActivity and persist
          sessionData.lastActivity = now;
          this.persistSession(sessionData);
          return sessionData.sessionId;
        }
      }

      // Session expired or does not exist: create a brand new session ID
      const newSessionId = 'sess_' + generateUUID();
      const newSession = {
        sessionId: newSessionId,
        createdAt: now,
        lastActivity: now,
      };

      this.persistSession(newSession);
      return newSessionId;
    }

    static updateActivity() {
      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          const session = JSON.parse(raw);
          session.lastActivity = Date.now();
          this.persistSession(session);
        }
      } catch (e) {}
    }

    static persistSession(session) {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        // Also set a first-party cookie for cross-subdomain compatibility
        document.cookie = `cf_session_id=${session.sessionId}; path=/; max-age=1800; SameSite=Lax`;
      } catch (e) {}
    }

    static resetSession() {
      const newSessionId = 'sess_' + generateUUID();
      const newSession = {
        sessionId: newSessionId,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };
      this.persistSession(newSession);
      return newSessionId;
    }
  }

  /**
   * Event Dispatcher with Retry Queue & Exponential Backoff
   */
  class EventDispatcher {
    constructor(endpoint) {
      this.endpoint = endpoint;
      this.queue = [];
      this.isProcessing = false;
    }

    enqueue(payload) {
      this.queue.push({
        payload,
        attempts: 0,
        nextRetry: Date.now(),
      });
      this.processQueue();
    }

    async processQueue() {
      if (this.isProcessing || this.queue.length === 0) return;
      this.isProcessing = true;

      while (this.queue.length > 0) {
        const item = this.queue[0];
        const now = Date.now();

        if (item.nextRetry > now) {
          await new Promise((resolve) => setTimeout(resolve, item.nextRetry - now));
        }

        try {
          const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item.payload),
            keepalive: true,
          });

          if (response.ok || response.status === 409) {
            this.queue.shift(); // Success, remove from queue
          } else if (response.status >= 400 && response.status < 500) {
            console.warn('[CausalFunnel Tracker] Request rejected with status', response.status);
            this.queue.shift();
          } else {
            this.handleRetry(item);
          }
        } catch (networkError) {
          this.handleRetry(item);
        }
      }

      this.isProcessing = false;
    }

    handleRetry(item) {
      item.attempts += 1;
      if (item.attempts >= MAX_RETRIES) {
        console.warn('[CausalFunnel Tracker] Max retries exceeded for event:', item.payload.event_id);
        this.queue.shift();
      } else {
        const delay = RETRY_DELAY_BASE_MS * Math.pow(2, item.attempts - 1);
        item.nextRetry = Date.now() + delay;
        return;
      }
    }
  }

  const dispatcher = new EventDispatcher(apiUrl);

  /**
   * Main Tracker Engine
   */
  const Tracker = {
    sessionId: SessionManager.getSession(),
    lastTrackedUrl: '',

    init() {
      this.trackPageView();
      this.setupClickTracking();
      this.setupSpaTracking();

      window.addEventListener('mousemove', () => SessionManager.updateActivity(), { passive: true });
      window.addEventListener('scroll', () => SessionManager.updateActivity(), { passive: true });
    },

    trackPageView(customUrl, customTitle) {
      this.sessionId = SessionManager.getSession();
      const currentUrl = customUrl || window.location.href;

      if (this.lastTrackedUrl === currentUrl && !customUrl) {
        return;
      }
      this.lastTrackedUrl = currentUrl;

      const payload = {
        event_id: 'evt_' + generateUUID(),
        session_id: this.sessionId,
        event_type: 'page_view',
        page_url: currentUrl,
        timestamp: new Date().toISOString(),
        page_title: customTitle || document.title || '',
        referrer: document.referrer || '',
      };

      dispatcher.enqueue(payload);
      this.notifyListeners('page_view', payload);
    },

    trackClick(event) {
      this.sessionId = SessionManager.getSession();

      const target = event.target || event.srcElement;
      if (!target) return;

      if (target.type === 'password' || target.getAttribute('data-cf-ignore') !== null) {
        return;
      }

      const elementTag = (target.tagName || '').toUpperCase();
      const elementId = target.id ? target.id.slice(0, 100) : null;

      const clickX = Math.round(event.clientX);
      const clickY = Math.round(event.clientY);
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

      const payload = {
        event_id: 'evt_' + generateUUID(),
        session_id: this.sessionId,
        event_type: 'click',
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
        click_x: clickX,
        click_y: clickY,
        viewport_width: viewportWidth,
        viewport_height: viewportHeight,
        element_tag: elementTag,
        element_id: elementId,
      };

      dispatcher.enqueue(payload);
      this.notifyListeners('click', payload);
    },

    setupClickTracking() {
      window.addEventListener(
        'click',
        (e) => {
          this.trackClick(e);
        },
        true
      );
    },

    setupSpaTracking() {
      const self = this;

      const originalPushState = history.pushState;
      if (originalPushState) {
        history.pushState = function () {
          originalPushState.apply(this, arguments);
          setTimeout(() => self.trackPageView(), 50);
        };
      }

      const originalReplaceState = history.replaceState;
      if (originalReplaceState) {
        history.replaceState = function () {
          originalReplaceState.apply(this, arguments);
          setTimeout(() => self.trackPageView(), 50);
        };
      }

      window.addEventListener('popstate', () => {
        setTimeout(() => self.trackPageView(), 50);
      });

      window.addEventListener('hashchange', () => {
        setTimeout(() => self.trackPageView(), 50);
      });
    },

    listeners: [],
    addListener(fn) {
      if (typeof fn === 'function') this.listeners.push(fn);
    },
    removeListener(fn) {
      this.listeners = this.listeners.filter((l) => l !== fn);
    },
    notifyListeners(type, data) {
      this.listeners.forEach((fn) => {
        try {
          fn(type, data);
        } catch (e) {}
      });
    },

    getSessionId() {
      return SessionManager.getSession();
    },
    resetSession() {
      this.sessionId = SessionManager.resetSession();
      return this.sessionId;
    },
  };

  window.CausalFunnel = Tracker;
  window.cfTracker = Tracker;

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    Tracker.init();
  } else {
    window.addEventListener('DOMContentLoaded', () => Tracker.init());
  }
})(window, document);
