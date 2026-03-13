import React, { useState, useEffect, useRef } from 'react';
import { items as wixDataItems } from '@wix/data';
import { createClient, OAuthStrategy } from '@wix/sdk';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import {
  TrendingUp, Users, Star, Globe, Search, MousePointer,
  CheckCircle, Eye, BarChart3, Map, FileText, Share2, Activity,
  PlayCircle, Layout, Clock, MessageSquare, ThumbsUp, Mail,
  Target, Award, Bell, TrendingDown, Sun, Moon, Printer,
  Calendar, DollarSign, Plug, Trophy, Heart, WifiOff,
  RefreshCw, Pencil, Send, Zap, BadgeCheck, ShieldCheck, Megaphone,
  ChevronLeft, ChevronDown, Upload, Plus, Download, ExternalLink, Bot, X,
  Newspaper, Rss, Link2, Youtube, Building2,
} from 'lucide-react';

// ─── Shared style helpers ───────────────────────────────────────────────────
// Color system – maps Tailwind color prop strings to actual hex/RGB values
const colorMap = {
  'bg-amber-500':   { hex: '#f59e0b', r: 245, g: 158, b: 11  },
  'bg-amber-600':   { hex: '#d97706', r: 217, g: 119, b: 6   },
  'bg-teal-600':    { hex: '#0d9488', r: 13,  g: 148, b: 136 },
  'bg-emerald-500': { hex: '#10b981', r: 16,  g: 185, b: 129 },
  'bg-emerald-600': { hex: '#059669', r: 5,   g: 150, b: 105 },
  'bg-purple-600':  { hex: '#9333ea', r: 147, g: 51,  b: 234 },
  'bg-rose-500':    { hex: '#f43f5e', r: 244, g: 63,  b: 94  },
  'bg-indigo-600':  { hex: '#4f46e5', r: 79,  g: 70,  b: 229 },
  'bg-blue-600':    { hex: '#2563eb', r: 37,  g: 99,  b: 235 },
  'bg-pink-500':    { hex: '#ec4899', r: 236, g: 72,  b: 153 },
  'bg-orange-500':  { hex: '#f97316', r: 249, g: 115, b: 22  },
};
const sectionColorMap = {
  'text-teal-500':    { hex: '#14b8a6', r: 20,  g: 184, b: 166 },
  'text-teal-400':    { hex: '#2dd4bf', r: 45,  g: 212, b: 191 },
  'text-blue-500':    { hex: '#3b82f6', r: 59,  g: 130, b: 246 },
  'text-amber-500':   { hex: '#f59e0b', r: 245, g: 158, b: 11  },
  'text-purple-500':  { hex: '#a855f7', r: 168, g: 85,  b: 247 },
  'text-rose-500':    { hex: '#f43f5e', r: 244, g: 63,  b: 94  },
  'text-emerald-500': { hex: '#10b981', r: 16,  g: 185, b: 129 },
  'text-indigo-500':  { hex: '#6366f1', r: 99,  g: 102, b: 241 },
  'text-pink-500':    { hex: '#ec4899', r: 236, g: 72,  b: 153 },
  'text-orange-500':  { hex: '#f97316', r: 249, g: 115, b: 22  },
  'text-slate-500':   { hex: '#64748b', r: 100, g: 116, b: 139 },
  'text-green-500':   { hex: '#22c55e', r: 34,  g: 197, b: 94  },
};
const cc = (c, a) => `rgba(${c.r},${c.g},${c.b},${a})`;

const card  = 'glass-card';
const txt   = 'text-slate-900 dark:text-slate-100';
const txt2  = 'text-slate-600 dark:text-slate-300';
const muted = 'text-slate-500 dark:text-slate-400';
const subtl = 'text-slate-400 dark:text-slate-500';
const rowCls= 'row-hover transition-colors';
const divdr = 'divide-slate-100 dark:divide-white/[0.05]';
const brd   = 'border-slate-200 dark:border-white/[0.06]';

const App = () => {
  const [activeTab, setActiveTab]               = useState('overview');
  const [darkMode, setDarkMode]                 = useState(true);
  const [calFilter, setCalFilter]               = useState('All');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddPost, setShowAddPost]           = useState(false);
  const [importMode, setImportMode]             = useState('upload');
  const [importDataType, setImportDataType]     = useState('Social Metrics');
  const [newPost, setNewPost]                   = useState({ title: '', platform: 'Facebook', date: '', type: 'Social', status: 'scheduled', notes: '' });
  const [connections, setConnections]           = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_connections') || '{}'); } catch { return {}; } });
  const [connectModal, setConnectModal]         = useState(null);
  const [connectFormData, setConnectFormData]   = useState({});
  const [connectTesting, setConnectTesting]     = useState(false);
  const [connectError, setConnectError]         = useState(null);
  const [syncStatus, setSyncStatus]             = useState({});
  const [liveData, setLiveData]                 = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_livedata') || '{}'); } catch { return {}; } });
  const [manualData, setManualData]             = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_manual') || '{}'); } catch { return {}; } });
  const [manualForm, setManualForm]             = useState({});
  const [showQuickAdd, setShowQuickAdd]         = useState(false);
  const fileInputRef                             = useRef(null);
  const [pasteCSV, setPasteCSV]                 = useState('');
  const [pasteDataType, setPasteDataType]       = useState('Social Metrics');
  const [aiContentType, setAiContentType]       = useState('Social Post');
  const [aiPlatform, setAiPlatform]             = useState('Facebook');
  const [aiTone, setAiTone]                     = useState('Empathetic');
  const [aiTopic, setAiTopic]                   = useState('');
  const [aiOutput, setAiOutput]                 = useState('');
  const [aiGenerating, setAiGenerating]         = useState(false);
  const [importNotice, setImportNotice]         = useState('');
  const [reviewOverrides, setReviewOverrides]     = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_review_overrides') || '{}'); } catch { return {}; } });
  const [reviewOverrideForm, setReviewOverrideForm] = useState({ rating: '', totalReviews: '' });
  // ── Intel tab state ──────────────────────────────────────────────────────────
  const [intelSubTab, setIntelSubTab]           = useState('news');
  const [newsQuery, setNewsQuery]               = useState('mental health Arizona');
  const [newsItems, setNewsItems]               = useState([]);
  const [newsLoading, setNewsLoading]           = useState(false);
  const [newsError, setNewsError]               = useState('');
  const [scraperUrl, setScraperUrl]             = useState('');
  const [scraperResult, setScraperResult]       = useState(null);
  const [scraperLoading, setScraperLoading]     = useState(false);
  const [scraperError, setScraperError]         = useState('');
  const [savedUrls, setSavedUrls]               = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_saved_urls') || '[]'); } catch { return []; } });
  const [rssFeedUrl, setRssFeedUrl]             = useState('');
  const [rssItems, setRssItems]                 = useState([]);
  const [rssLoading, setRssLoading]             = useState(false);
  const [rssError, setRssError]                 = useState('');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else          document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Persist liveData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dmd_livedata', JSON.stringify(liveData));
  }, [liveData]);

  useEffect(() => { setShowQuickAdd(false); setManualForm({}); }, [activeTab]); // eslint-disable-line

  // Handle TikTok OAuth redirect — parse ?tiktok_data= on first load
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const rawData  = params.get('tiktok_data');
    const rawError = params.get('tiktok_error');
    if (rawData) {
      try {
        const b64      = rawData.replace(/-/g, '+').replace(/_/g, '/');
        const data     = JSON.parse(atob(b64));
        const syncTime = new Date().toLocaleString();
        setConnections(c => {
          const updated = { ...c, 'TikTok for Business': { ...data, connected: true, lastSync: syncTime } };
          localStorage.setItem('dmd_connections', JSON.stringify(updated));
          return updated;
        });
        setLiveData(d => ({ ...d, 'TikTok for Business': data }));
        setSyncStatus(s => ({ ...s, 'TikTok for Business': 'ok' }));
        setActiveTab('integrations');
      } catch {}
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (rawError) {
      setActiveTab('integrations');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Google / Mailchimp / Meta OAuth redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platforms = [
      { key: 'google_data',    names: ['Google Analytics', 'Google Business']     },
      { key: 'mailchimp_data', names: ['Mailchimp']                               },
      { key: 'meta_data',      names: ['Meta Business Suite', 'Meta Ads Manager'] },
    ];
    let handled = false;
    platforms.forEach(({ key, names }) => {
      const raw = params.get(key);
      if (raw) {
        try {
          const b64      = raw.replace(/-/g, '+').replace(/_/g, '/');
          const data     = JSON.parse(atob(b64));
          const syncTime = new Date().toLocaleString();
          names.forEach(name => {
            setConnections(c => {
              const updated = { ...c, [name]: { ...data, connected: true, lastSync: syncTime } };
              localStorage.setItem('dmd_connections', JSON.stringify(updated));
              return updated;
            });
            setLiveData(d => ({ ...d, [name]: data }));
            setSyncStatus(s => ({ ...s, [name]: 'ok' }));
          });
          setActiveTab('integrations');
        } catch {}
        handled = true;
      }
      const errKey = key.replace('_data', '_error');
      if (params.get(errKey)) { setActiveTab('integrations'); handled = true; }
    });
    if (handled) window.history.replaceState({}, '', window.location.pathname);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Integration fields config (per-service credential forms) ─────────────────
  const integrationFields = {
    'Google Analytics':    [
      { key: 'propertyId', label: 'GA4 Property ID',             placeholder: 'G-XXXXXXXXXX or numeric ID',   hint: 'GA Admin → Property Settings → Property ID'                                        },
      { key: 'apiSecret',  label: 'Measurement Protocol Secret', placeholder: 'Your API secret', type: 'password', hint: 'GA Admin → Data Streams → Measurement Protocol → API Secrets'              },
    ],
    'Google Business': [
      { key: 'placeId', label: 'Google Place ID', placeholder: 'ChIJxxxxxxxxxxxxxxxx',  hint: 'Google Maps → Share → place ID in embed URL'                           },
      { key: 'apiKey',  label: 'Places API Key',  placeholder: 'AIzaSyxxxxxxxxxx', type: 'password', hint: 'console.cloud.google.com → APIs → Credentials' },
    ],
    'Meta Business Suite': [
      { key: 'accessToken', label: 'Page Access Token', placeholder: 'EAAxxxxxxxx…', type: 'password', hint: 'developers.facebook.com → Graph API Explorer → Generate Token' },
      { key: 'pageId',      label: 'Facebook Page ID',  placeholder: '123456789012345',                hint: 'Facebook Page → About → Page ID'                                },
    ],
    'Wix Analytics': [
      { key: 'clientId',   label: 'OAuth Client ID',  placeholder: '7ed57615-xxxx-xxxx-xxxx-xxxxxxxxxxxx', type: 'password', hint: 'Wix Headless Settings → OAuth Apps → Client ID'                                               },
      { key: 'collection', label: 'Data Collection (optional)', placeholder: 'e.g. BlogPosts or Stores/Products',    hint: 'Leave blank to just verify connection. Find names in Wix Dashboard → Content Manager.' },
    ],
    'Mailchimp': [
      { key: 'apiKey',  label: 'API Key',     placeholder: 'xxxxxxxxxxxxxxxx-us1', type: 'password', hint: 'Mailchimp → Account → Extras → API Keys' },
      { key: 'listId',  label: 'Audience ID', placeholder: 'xxxxxxxxxx',                             hint: 'Audience → Settings → Audience ID'        },
    ],
    'Google Ads': [
      { key: 'customerId', label: 'Customer ID',     placeholder: 'xxx-xxx-xxxx',   hint: 'Top-right corner of Google Ads dashboard'                           },
      { key: 'devToken',   label: 'Developer Token', placeholder: 'Your dev token', hint: 'Tools → API Center → Developer Token', type: 'password'            },
    ],
    'Meta Ads Manager': [
      { key: 'accessToken', label: 'Access Token',  placeholder: 'EAAxxxxxxxx…',  type: 'password', hint: 'developers.facebook.com → Access Token Tool'                },
      { key: 'adAccountId', label: 'Ad Account ID', placeholder: 'act_123456789',                   hint: 'Ads Manager → Account Settings → prepend "act_" to your ID' },
    ],
    'TikTok for Business': [], // OAuth flow — no manual fields
    'Sintra AI': [
      { key: 'apiKey',      label: 'API Key',       placeholder: 'Your Sintra API key',  type: 'password', hint: 'Sintra Dashboard → Settings → API Keys'    },
      { key: 'workspaceId', label: 'Workspace ID',  placeholder: 'ws_xxxxxxxxxx',                          hint: 'Sintra → Workspace → Settings → ID'         },
    ],
    'MarkyAI': [
      { key: 'apiKey',  label: 'API Key',  placeholder: 'Your MarkyAI API key',  type: 'password', hint: 'MarkyAI → Account → API Access'         },
      { key: 'brandId', label: 'Brand ID', placeholder: 'Your brand ID',                           hint: 'MarkyAI → Brand → Settings → Brand ID'  },
    ],
    'YouTube Analytics': [
      { key: 'channelId', label: 'Channel ID',              placeholder: 'UCxxxxxxxxxxxxxxxxxxxxxxxx',    hint: 'YouTube Studio → Customization → Basic info → scroll to bottom for Channel ID' },
      { key: 'apiKey',    label: 'YouTube Data API v3 Key', placeholder: 'AIzaSyxxxxxxxxxx', type: 'password', hint: 'console.cloud.google.com → Enable YouTube Data API v3 → Credentials → API Key' },
    ],
    'Yelp Reviews': [
      { key: 'businessId', label: 'Yelp Business ID',  placeholder: 'destiny-springs-healthcare-scottsdale', hint: 'From the Yelp business URL: yelp.com/biz/YOUR-BUSINESS-ID' },
      { key: 'apiKey',     label: 'Yelp API Key',      placeholder: 'your-yelp-api-key', type: 'password',   hint: 'Register at api.yelp.com → Create App → API Key (500 free calls/day)' },
    ],
    'News API': [
      { key: 'apiKey',       label: 'API Key',             placeholder: 'your-newsapi.org-key', type: 'password', hint: 'Register free at newsapi.org → Account → API Key (100 req/day free)' },
      { key: 'defaultQuery', label: 'Default Search Query (optional)', placeholder: 'mental health Arizona',         hint: 'Keywords auto-loaded on the Intel tab. Leave blank for default.' },
    ],
  };

  // ── Live data fetch helpers ───────────────────────────────────────────────────
  const fetchWixData = async (creds) => {
    const { clientId, collection } = creds;
    if (!clientId) return { success: false, error: 'Missing OAuth Client ID' };
    try {
      const wixClient = createClient({
        modules: { items: wixDataItems },
        auth: OAuthStrategy({ clientId }),
      });
      // If no collection specified, just verify the client initializes
      if (!collection) {
        return { success: true, data: { connected: true }, warning: 'No collection specified — client ID accepted. Add a collection name to sync data.' };
      }
      const result = await wixClient.items.query(collection).find();
      return {
        success: true,
        data: {
          totalItems: result.items.length,
          collection,
          itemIds: result.items.slice(0, 5).map(i => i.data?._id).filter(Boolean),
        },
      };
    } catch (e) {
      // WDE0025 = collection not found — connection is valid, collection name is wrong
      if (e.message?.includes('WDE0025') || e.message?.toLowerCase().includes('does not exist')) {
        return {
          success: true,
          data: { connected: true },
          warning: `Collection "${collection}" not found. Connection saved — check your collection name in Wix Content Manager.`,
        };
      }
      return { success: false, error: e.message };
    }
  };

  const fetchTikTokData = async (creds) => {
    if (!creds?.accessToken) return { success: false, error: 'Not connected — use the OAuth login button' };
    try {
      const res  = await fetch(`/api/tiktok?action=refresh&token=${encodeURIComponent(creds.accessToken)}`);
      const data = await res.json();
      if (!data.ok) return { success: false, error: data.error || 'Refresh failed' };
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const fetchMetaPageData = async (creds) => {
    const { accessToken, pageId } = creds;
    if (!accessToken || !pageId) return { success: false, error: 'Missing access token or page ID' };
    try {
      const res  = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=fan_count,followers_count,name&access_token=${encodeURIComponent(accessToken)}`);
      const data = await res.json();
      if (data.error) return { success: false, error: data.error.message };
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  };

  const fetchMetaAdsData = async (creds) => {
    const { accessToken, adAccountId } = creds;
    if (!accessToken || !adAccountId) return { success: false, error: 'Missing credentials' };
    try {
      const res  = await fetch(`https://graph.facebook.com/v18.0/${adAccountId}?fields=name,currency,account_status&access_token=${encodeURIComponent(accessToken)}`);
      const data = await res.json();
      if (data.error) return { success: false, error: data.error.message };
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  };

  const fetchYouTubeData = async (creds) => {
    const { channelId, apiKey } = creds;
    if (!channelId || !apiKey) return { success: false, error: 'Missing Channel ID or API Key' };
    try {
      const res  = await fetch(`/api/youtube?action=data&channelId=${encodeURIComponent(channelId)}&apiKey=${encodeURIComponent(apiKey)}`);
      const data = await res.json();
      if (!data.ok) return { success: false, error: data.error || 'YouTube fetch failed' };
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  };

  const fetchYelpData = async (creds) => {
    const { businessId, apiKey } = creds;
    if (!businessId || !apiKey) return { success: false, error: 'Missing Business ID or API Key' };
    try {
      const res  = await fetch(`/api/yelp?action=data&businessId=${encodeURIComponent(businessId)}&apiKey=${encodeURIComponent(apiKey)}`);
      const data = await res.json();
      if (!data.ok) return { success: false, error: data.error || 'Yelp fetch failed' };
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  };

  const fetchNewsItems = async (query, apiKey) => {
    setNewsLoading(true); setNewsError('');
    try {
      const q      = encodeURIComponent(query || 'mental health Arizona');
      const keyPart = apiKey ? `&apiKey=${encodeURIComponent(apiKey)}` : '';
      const res    = await fetch(`/api/news?action=news&q=${q}&pageSize=15${keyPart}`);
      const data   = await res.json();
      if (!data.ok) { setNewsError(data.error || 'News fetch failed'); setNewsLoading(false); return; }
      setNewsItems(data.articles || []);
    } catch (e) { setNewsError(e.message); }
    setNewsLoading(false);
  };

  const fetchScrapeUrl = async (url) => {
    if (!url) return;
    setScraperLoading(true); setScraperError(''); setScraperResult(null);
    try {
      const res  = await fetch(`/api/news?action=scrape&url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!data.ok) { setScraperError(data.error || 'Scrape failed'); setScraperLoading(false); return; }
      setScraperResult(data);
    } catch (e) { setScraperError(e.message); }
    setScraperLoading(false);
  };

  const fetchRssFeed = async (url) => {
    if (!url) return;
    setRssLoading(true); setRssError(''); setRssItems([]);
    try {
      const res  = await fetch(`/api/news?action=rss&url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!data.ok) { setRssError(data.error || 'RSS fetch failed'); setRssLoading(false); return; }
      setRssItems(data.items || []);
    } catch (e) { setRssError(e.message); }
    setRssLoading(false);
  };

  const saveTrackedUrl = (url, label) => {
    if (!url) return;
    const entry   = { url, label: label || url, savedAt: new Date().toLocaleString() };
    const updated = [entry, ...savedUrls.filter(u => u.url !== url)].slice(0, 20);
    setSavedUrls(updated);
    localStorage.setItem('dmd_saved_urls', JSON.stringify(updated));
  };

  const removeTrackedUrl = (url) => {
    const updated = savedUrls.filter(u => u.url !== url);
    setSavedUrls(updated);
    localStorage.setItem('dmd_saved_urls', JSON.stringify(updated));
  };

  const syncIntegrationWithCreds = async (name, creds) => {
    if (!creds?.connected) return;
    setSyncStatus(s => ({ ...s, [name]: 'syncing' }));
    let result = { success: true, data: {} };
    try {
      if (name === 'Meta Business Suite') result = await fetchMetaPageData(creds);
      else if (name === 'Meta Ads Manager') result = await fetchMetaAdsData(creds);
      else if (name === 'Wix Analytics') result = await fetchWixData(creds);
      else if (name === 'TikTok for Business') result = await fetchTikTokData(creds);
      else if (name === 'YouTube Analytics') result = await fetchYouTubeData(creds);
      else if (name === 'Yelp Reviews') result = await fetchYelpData(creds);
      // Other platforms require a server-side proxy — mark synced but no live payload
      if (result.success) {
        if (result.data && Object.keys(result.data).length > 0) setLiveData(d => ({ ...d, [name]: result.data }));
        const syncTime = new Date().toLocaleString();
        setSyncStatus(s => ({ ...s, [name]: 'ok' }));
        setConnections(c => {
          const updated = { ...c, [name]: { ...c[name], lastSync: syncTime } };
          localStorage.setItem('dmd_connections', JSON.stringify(updated));
          return updated;
        });
      } else {
        setSyncStatus(s => ({ ...s, [name]: 'error' }));
      }
    } catch { setSyncStatus(s => ({ ...s, [name]: 'error' })); }
  };

  const saveConnection = async (name, formData) => {
    const fields  = integrationFields[name] || [];
    // Only require non-optional fields
    const missing = fields.filter(f => !formData[f.key] && !f.label.includes('optional'));
    if (missing.length > 0) { setConnectError(`Please fill in: ${missing.map(f => f.label).join(', ')}`); return; }
    setConnectTesting(true);
    setConnectError(null);
    let testResult = { success: true, data: {} };
    if (name === 'Meta Business Suite') testResult = await fetchMetaPageData(formData);
    else if (name === 'Meta Ads Manager') testResult = await fetchMetaAdsData(formData);
    else if (name === 'Wix Analytics') testResult = await fetchWixData(formData);
    else if (name === 'TikTok for Business') testResult = await fetchTikTokData(formData);
    else if (name === 'YouTube Analytics') testResult = await fetchYouTubeData(formData);
    else if (name === 'Yelp Reviews') testResult = await fetchYelpData(formData);
    setConnectTesting(false);
    if (!testResult.success) { setConnectError(`Connection failed: ${testResult.error}`); return; }
    if (testResult.warning) { setConnectError(`⚠️ ${testResult.warning}`); }
    const syncTime = new Date().toLocaleString();
    const updated  = { ...connections, [name]: { ...formData, connected: true, lastSync: syncTime } };
    setConnections(updated);
    localStorage.setItem('dmd_connections', JSON.stringify(updated));
    if (testResult.data && Object.keys(testResult.data).length > 0) setLiveData(d => ({ ...d, [name]: testResult.data }));
    setSyncStatus(s => ({ ...s, [name]: 'ok' }));
    setConnectModal(null);
    setConnectFormData({});
    setConnectError(null);
  };

  const saveManualEntry = (type) => {
    const key  = type.replace(/\s+/g, '_').toLowerCase();
    const entry = { ...manualForm, _savedAt: new Date().toLocaleString() };
    const updated = { ...manualData, [key]: [...(manualData[key] || []), entry] };
    setManualData(updated);
    localStorage.setItem('dmd_manual', JSON.stringify(updated));
    // Feed TikTok post entries into liveData so Social tab updates
    if (type === 'TikTok Posts') {
      const all = updated[key];
      const agg = {
        recentPosts:    all.length,
        recentViews:    all.reduce((s, e) => s + (Number(e.views)    || 0), 0),
        recentLikes:    all.reduce((s, e) => s + (Number(e.likes)    || 0), 0),
        recentComments: all.reduce((s, e) => s + (Number(e.comments) || 0), 0),
        recentShares:   all.reduce((s, e) => s + (Number(e.shares)   || 0), 0),
        followers:      Number(manualForm.followers) || liveData['TikTok for Business']?.followers || 0,
        manuallyEntered: true,
      };
      setLiveData(d => ({ ...d, 'TikTok for Business': agg }));
    }
    setManualForm({});
  };

  // ── Import helpers ──────────────────────────────────────────────────────
  const detectTypeFromHeaders = (headers) => {
    const h = headers.map(x => x.toLowerCase().trim());
    if (h.some(x => x.includes('keyword') || x.includes('rank'))) return 'SEO Rankings';
    if (h.some(x => x.includes('spend') || x.includes('cpc') || x.includes('cpl'))) return 'Ad Spend';
    if (h.some(x => x.includes('sent') || x.includes('open') || x.includes('click') && h.some(y => y.includes('email') || y.includes('campaign')))) return 'Email Stats';
    if (h.some(x => x.includes('rating') || x.includes('review'))) return 'Reviews';
    return 'Social Metrics';
  };

  const batchSaveToManualData = (type, rows) => {
    const key = type.replace(/\s+/g, '_').toLowerCase();
    const timestamped = rows.map(r => ({ ...r, _savedAt: new Date().toLocaleString() }));
    setManualData(prev => {
      const updated = { ...prev, [key]: [...(prev[key] || []), ...timestamped] };
      localStorage.setItem('dmd_manual', JSON.stringify(updated));
      return updated;
    });
    return rows.length;
  };

  const parseCSVText = (text, type) => {
    if (!text.trim()) { setImportNotice('No data to import.'); return; }
    try {
      // Try JSON first
      const parsed = JSON.parse(text.trim());
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      const count = batchSaveToManualData(type, rows);
      setImportNotice(`Imported ${count} record${count !== 1 ? 's' : ''} into ${type}`);
      setPasteCSV('');
      return;
    } catch (_) {
      // Fall through to CSV
    }
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { setImportNotice('Need at least a header row and one data row.'); return; }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const detectedType = type || detectTypeFromHeaders(headers);
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
      return obj;
    }).filter(r => Object.values(r).some(v => v !== ''));
    if (rows.length === 0) { setImportNotice('No valid rows found.'); return; }
    const count = batchSaveToManualData(detectedType, rows);
    setImportNotice(`Imported ${count} record${count !== 1 ? 's' : ''} into ${detectedType}`);
    setPasteCSV('');
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'json') {
        try {
          const parsed = JSON.parse(text);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
          const type = detectTypeFromHeaders(headers);
          const count = batchSaveToManualData(type, rows);
          setImportNotice(`Imported ${count} record${count !== 1 ? 's' : ''} from ${file.name} into ${type}`);
        } catch (_) {
          setImportNotice('Invalid JSON file.');
        }
      } else {
        // CSV / plain text
        const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { setImportNotice('File needs at least a header row and one data row.'); return; }
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const type = detectTypeFromHeaders(headers);
        const rows = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const obj = {};
          headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
          return obj;
        }).filter(r => Object.values(r).some(v => v !== ''));
        if (rows.length === 0) { setImportNotice('No valid rows found in file.'); return; }
        const count = batchSaveToManualData(type, rows);
        setImportNotice(`Imported ${count} record${count !== 1 ? 's' : ''} from ${file.name} into ${type}`);
      }
    };
    reader.onerror = () => setImportNotice('Error reading file.');
    reader.readAsText(file);
  };

  // ── AI Content Generator ────────────────────────────────────────────────────
  const generateAIContent = () => {
    if (!aiTopic.trim()) { setAiOutput('Please enter a topic or brief before generating.'); return; }
    setAiGenerating(true);

    const platform = aiPlatform;
    const tone = aiTone;
    const type = aiContentType;
    const topic = aiTopic.trim();

    const toneMap = {
      'Professional':    ['We are committed to', 'Our team of dedicated specialists ensures', 'Destiny Springs Healthcare delivers'],
      'Empathetic':      ['We understand how difficult it can be', 'Your mental health matters deeply to us', 'Healing begins with compassionate care'],
      'Informational':   ['Did you know that', 'Research shows that', 'Understanding your mental health is the first step'],
      'Motivational':    ['You have the strength to heal', 'Every step toward wellness counts', "Recovery is a journey, and you're not alone"],
      'Conversational':  ["Let's talk about", "Here's something we think you should know", 'We get it — life gets hard'],
      'Urgent':          ["Don't wait to get the help you deserve", 'Appointments are filling fast — act now', 'Today is the day to prioritize your mental health'],
    };
    const opens = toneMap[tone] || toneMap['Empathetic'];
    const opener = opens[Math.floor(Math.random() * opens.length)];

    const platformHints = {
      'Facebook':      '👇 Share this with someone who needs to hear it. #MentalHealth #DestinySprings',
      'Instagram':     '✨ Save this post & tag a friend who needs support 💙\n#MentalHealthAwareness #HealingJourney #ArizonaHealthcare',
      'LinkedIn':      'At Destiny Springs Healthcare, we believe mental wellness drives personal and professional success.',
      'TikTok':        '🎵 Drop a ❤️ if this resonates! Follow for more mental health tips from our team. #MentalHealthTok #DestinySpringsDMD',
      'Email':         'As a valued member of the Destiny Springs community, we want to share something important with you.',
      'Website Blog':  'At Destiny Springs Healthcare, our multidisciplinary team is dedicated to providing evidence-based mental health treatment in Arizona.',
    };
    const platformLine = platformHints[platform] || '';

    let output = '';
    if (type === 'Social Post') {
      output = `${opener} ${topic}.\n\nAt Destiny Springs Healthcare, our compassionate team provides personalized mental health care for individuals and families across Arizona.\n\n📍 Scottsdale, AZ | 🌐 destinyspringshealthcare.com | 📞 Call to schedule\n\n${platformLine}`;
    } else if (type === 'Blog Brief') {
      output = `BLOG TITLE: "${topic}: What You Need to Know"\n\nINTRO: ${opener} ${topic}. This post explores key insights for patients and families seeking mental health support.\n\nH2 SECTIONS:\n1. Understanding ${topic}\n2. How Destiny Springs Healthcare approaches ${topic}\n3. Treatment options and what to expect\n4. Resources and next steps\n\nCTA: Schedule a consultation at destinyspringshealthcare.com\nWORD COUNT TARGET: 800–1,200 words\nSEO TAGS: mental health Arizona, ${topic.toLowerCase()}, Scottsdale psychiatry`;
    } else if (type === 'Email Subject Line') {
      output = `Subject Line Options for "${topic}":\n\n1. "${opener.replace(/,$/,'')}: ${topic}"\n2. "Your guide to ${topic} — from Destiny Springs Healthcare"\n3. "Ready to take the next step? Let's talk about ${topic}"\n4. "New resources available: ${topic} support at Destiny Springs"\n5. "You deserve this — ${topic} care tailored for you"\n\nPreheader: Compassionate, evidence-based mental health care in Arizona.`;
    } else if (type === 'Ad Copy') {
      output = `HEADLINE: ${topic} — Expert Care in Scottsdale, AZ\n\nBODY: ${opener} ${topic}. Destiny Springs Healthcare offers personalized, evidence-based treatment from a team that truly cares. New patients welcome. Most insurance accepted.\n\nCTA: Book Your Free Consultation\nURLslug: destinyspringshealthcare.com/appointments\n\nCHARACTER COUNT (approx): Headline 60 | Body 145\nPLATFORM: ${platform}`;
    } else if (type === 'TikTok Script') {
      output = `🎬 TIKTOK SCRIPT — "${topic}"\nDURATION: 30–60 seconds | TONE: ${tone}\n\n[HOOK - 0-3s]\n"${toneMap['Urgent'][0]} — especially when it comes to ${topic}."\n\n[CONTENT - 3-25s]\n"${opener} ${topic}. At Destiny Springs Healthcare in Scottsdale, AZ, our team specializes in helping people [benefit related to ${topic}]. Here are 3 things to know: [Point 1], [Point 2], [Point 3]."\n\n[CTA - 25-30s]\n"Follow us for more mental health tips, and drop a ❤️ if this helped. Book at the link in bio."\n\n#MentalHealth #DestinySprings #${topic.replace(/\s+/g,'')} #AZHealthcare`;
    } else if (type === 'Caption + Hashtags') {
      output = `CAPTION:\n${opener} ${topic}.\n\nDestiny Springs Healthcare is here to support your mental health journey every step of the way. Whether you're seeking help for the first time or continuing your wellness path — you belong here. 💙\n\n📍 Scottsdale, AZ | Link in bio to schedule\n\nHASHTAGS:\n#DestinySprings #MentalHealthAwareness #${topic.replace(/\s+/g,'')} #ArizonaMentalHealth #HealingJourney #PsychiatryScottsdale #MindfulRecovery #MentalWellness #BreakTheStigma #YouAreNotAlone`;
    }

    setTimeout(() => {
      setAiOutput(output);
      setAiGenerating(false);
    }, 600);
  };

  const disconnectIntegration = (name) => {
    const updated = { ...connections };
    delete updated[name];
    setConnections(updated);
    localStorage.setItem('dmd_connections', JSON.stringify(updated));
    setLiveData(d  => { const n = { ...d }; delete n[name]; return n; });
    setSyncStatus(s => { const n = { ...s }; delete n[name]; return n; });
  };

  // Auto-sync all connected integrations on load, then every 5 min
  useEffect(() => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem('dmd_connections') || '{}'); } catch { return {}; } })();
    Object.entries(saved).filter(([, v]) => v?.connected).forEach(([n, creds]) => syncIntegrationWithCreds(n, creds));
    const interval = setInterval(() => {
      const cur = (() => { try { return JSON.parse(localStorage.getItem('dmd_connections') || '{}'); } catch { return {}; } })();
      Object.entries(cur).filter(([, v]) => v?.connected).forEach(([n, creds]) => syncIntegrationWithCreds(n, creds));
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Chart theme ─────────────────────────────────────────────────────────────
  const grid     = darkMode ? '#1e293b' : '#f1f5f9';
  const tick     = darkMode ? '#94a3b8' : '#64748b';
  const tipStyle = {
    borderRadius: '16px', border: 'none',
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    color: darkMode ? '#f1f5f9' : '#0f172a',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
  };

  // ── Core KPI Metrics ────────────────────────────────────────────────────────
  const metrics = {
    googleScore: '—',
    googleTrend: null,
    nps: '—',
    promoters: '—',
    socialPostsMonthly: '—',
    blogVelocity: '—',
    tiktokVelocity: '—',
    videoViews: '—',
    seoStatewideGrowth: '—',
    avgReadTime: '—',
    siteConversion: '—',
    wixSessions: '—',
    wixBounceRate: '—',
    emailOpenRate: '—',
    costPerLead: '—',
    totalLeads: '—',
    leadsGrowth: null,
  };

  // ── Derived data from manual entries & live integrations ─────────────────────
  const _reviews    = manualData.reviews       || [];
  const _socialMet  = manualData.social_metrics || [];
  const _adSpend    = manualData.ad_spend       || [];
  const _emailStats = manualData.email_stats    || [];
  const _seoData    = manualData.seo_rankings   || [];
  const _tiktokPosts= manualData.tiktok_posts   || [];
  const _metaLive   = liveData['Meta Business Suite'] || {};
  const _wixLive    = liveData['Wix Analytics']      || {};
  const _tikLive    = liveData['TikTok for Business'] || {};
  const _avgRating  = reviewOverrides.rating ? reviewOverrides.rating : (_reviews.length ? (_reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / _reviews.length).toFixed(1) : null);
  const _totalReviewCount = reviewOverrides.totalReviews ? Number(reviewOverrides.totalReviews) : _reviews.length;
  const _totalLeads = _adSpend.reduce((s, e) => s + (Number(e.leads) || 0), 0);
  const _totalSpend = _adSpend.reduce((s, e) => s + (Number(e.spend) || 0), 0);
  const _latestSocial = {};
  _socialMet.forEach(e => { if (!_latestSocial[e.platform] || (e.month || '') > (_latestSocial[e.platform].month || '')) _latestSocial[e.platform] = e; });
  // Patch placeholder metrics with computed values
  Object.assign(metrics, {
    googleScore:        _avgRating ? _avgRating + ' ★' : '—',
    videoViews:         _tikLive.recentViews  ? Number(_tikLive.recentViews).toLocaleString()  : '—',
    tiktokVelocity:     (_tiktokPosts.length  || _tikLive.recentPosts) ? String(_tiktokPosts.length || _tikLive.recentPosts) : '—',
    socialPostsMonthly: _socialMet.reduce((s, e) => s + (Number(e.posts) || 0), 0) || '—',
    wixSessions:        _wixLive.sessions   ? Number(_wixLive.sessions).toLocaleString()  : '—',
    wixBounceRate:      _wixLive.bounceRate  ? _wixLive.bounceRate + '%'                   : '—',
    emailOpenRate:      _emailStats.length   ? (_emailStats.reduce((s, e) => s + (e.sent ? Number(e.opened || 0) / Number(e.sent) : 0), 0) / _emailStats.length * 100).toFixed(1) + '%' : '—',
    costPerLead:        (_totalSpend && _totalLeads) ? '$' + (_totalSpend / _totalLeads).toFixed(0) : '—',
    totalLeads:         _totalLeads || '—',
  });

  // ── Monthly Trend (from ad spend + social manual entries) ────────────────────
  const _trendMap = {};
  _socialMet.forEach(e => { if (!e.month) return; if (!_trendMap[e.month]) _trendMap[e.month] = { month: e.month, sessions: 0, reach: 0, leads: 0 }; _trendMap[e.month].reach += Number(e.reach || 0); });
  _adSpend.forEach(e  => { if (!e.month) return; if (!_trendMap[e.month]) _trendMap[e.month] = { month: e.month, sessions: 0, reach: 0, leads: 0 }; _trendMap[e.month].leads += Number(e.leads || 0); });
  const monthlyTrend = Object.values(_trendMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);

  // ── Social Analytics ─────────────────────────────────────────────────────────
  const socialAnalytics = [
    { platform: 'Facebook',  color: '#1877F2', reach: Number(_latestSocial['Facebook']?.reach  || _metaLive.reach   || 0), engagement: Number(_latestSocial['Facebook']?.engagement  || 0), clicks: Number(_latestSocial['Facebook']?.clicks  || 0), followers: Number(_latestSocial['Facebook']?.followers  || _metaLive.fanCount || 0) },
    { platform: 'Instagram', color: '#E4405F', reach: Number(_latestSocial['Instagram']?.reach || 0),                      engagement: Number(_latestSocial['Instagram']?.engagement || 0), clicks: Number(_latestSocial['Instagram']?.clicks || 0), followers: Number(_latestSocial['Instagram']?.followers || 0) },
    { platform: 'LinkedIn',  color: '#0A66C2', reach: Number(_latestSocial['LinkedIn']?.reach  || 0),                      engagement: Number(_latestSocial['LinkedIn']?.engagement  || 0), clicks: Number(_latestSocial['LinkedIn']?.clicks  || 0), followers: Number(_latestSocial['LinkedIn']?.followers  || 0) },
    { platform: 'TikTok',    color: '#00f2ea', reach: Number(_latestSocial['TikTok']?.reach    || _tikLive.recentViews || 0), engagement: 0, clicks: 0, followers: Number(_latestSocial['TikTok']?.followers || _tikLive.followers || 0) },
  ];

  // ── Weekly Engagement Trend ──────────────────────────────────────────────────
  const weeklyEngagement = [];

  // ── Wix Traffic Sources ──────────────────────────────────────────────────────
  const wixSources = [
    { name: 'Organic Search', value: 0, color: '#0d9488' },
    { name: 'Social Media',   value: 0, color: '#8b5cf6' },
    { name: 'Direct',         value: 0, color: '#10b981' },
    { name: 'Referral',       value: 0, color: '#f59e0b' },
  ];

  // ── AZ Regional Traffic ──────────────────────────────────────────────────────
  const regionalTraffic = [
    { city: 'Phoenix',        traffic: 0 },
    { city: 'Tucson',         traffic: 0 },
    { city: 'Mesa / Gilbert', traffic: 0 },
    { city: 'Scottsdale',     traffic: 0 },
    { city: 'Rest of AZ',     traffic: 0 },
  ];

  // ── Website Video Tracing / UX Depth ─────────────────────────────────────────
  const pathData = [];

  // ── SEO Keyword Rankings ─────────────────────────────────────────────────────
  const seoKeywords = _seoData.map(e => ({
    keyword: e.keyword  || '—',
    pos:     Number(e.rank      || 0),
    change:  Number(e.prevRank  || 0) - Number(e.rank || 0),
    volume:  Number(e.searchVol || 0),
    clicks:  Number(e.clicks    || 0),
  }));

  // ── Blog Performance ─────────────────────────────────────────────────────────
  const blogPosts = [];

  // ── Email Campaign Metrics ────────────────────────────────────────────────────
  const emailCampaigns = _emailStats.map(e => ({
    campaign:  e.campaign || 'Campaign',
    sent:      Number(e.sent     || 0),
    opened:    Number(e.opened   || 0),
    clicked:   Number(e.clicked  || 0),
    openRate:  e.sent ? (Number(e.opened  || 0) / Number(e.sent) * 100).toFixed(1) + '%' : '0%',
    clickRate: e.sent ? (Number(e.clicked || 0) / Number(e.sent) * 100).toFixed(1) + '%' : '0%',
    date:      e.date || '',
  }));

  // ── Ad Performance ───────────────────────────────────────────────────────────
  const adPerformance = _adSpend.map(e => ({
    platform:    e.platform || 'Platform',
    spend:       Number(e.spend  || 0),
    leads:       Number(e.leads  || 0),
    clicks:      Number(e.clicks || 0),
    impressions: Number(e.impressions || 0),
    cpl:         e.cpl ? '$' + Number(e.cpl).toFixed(0) : (e.spend && e.leads ? '$' + (Number(e.spend) / Number(e.leads)).toFixed(0) : '---'),
    roas:        e.roas ? Number(e.roas).toFixed(1) + 'x' : '---',
    month:       e.month || '',
  }));
  const _totalImpressions = _adSpend.reduce((s,e)=>s+Number(e.impressions||0),0);

  // ── NPS Breakdown ─────────────────────────────────────────────────────────────
  const npsData = [
    { name: 'Promoters',  value: 0, color: '#10b981' },
    { name: 'Passives',   value: 0, color: '#f59e0b' },
    { name: 'Detractors', value: 0, color: '#ef4444' },
  ];

  // ── Upcoming Tasks ────────────────────────────────────────────────────────────
  const pipeline = [];

  // ── My Achievements data ────────────────────────────────────────────────────
  const myStats = [
    { label: 'Blogs Written',    value: 0, icon: FileText,  color: 'text-purple-500', target: 0 },
    { label: 'TikToks Produced', value: 0, icon: PlayCircle,color: 'text-pink-500',   target: 0 },
    { label: 'Social Posts',     value: 0, icon: Share2,    color: 'text-blue-500',   target: 0 },
    { label: 'Email Campaigns',  value: 0, icon: Mail,      color: 'text-teal-500',   target: 0 },
    { label: 'Website Updates',  value: 0, icon: Globe,     color: 'text-emerald-500',target: 0 },
    { label: 'Reviews Managed',  value: 0, icon: Star,      color: 'text-amber-500',  target: 0 },
  ];

  const milestones = [
    { title: 'Content Machine',    desc: 'Publish milestone blogs',         icon: FileText,  earned: false, date: 'Upcoming' },
    { title: 'TikTok Trailblazer', desc: 'Reach video view milestone',      icon: PlayCircle,earned: false, date: 'Upcoming' },
    { title: 'SEO Climber',        desc: 'Rank top 5 on target keywords',   icon: Search,    earned: false, date: 'Upcoming' },
    { title: 'Lead Magnet',        desc: 'Hit monthly lead goal',           icon: Target,    earned: false, date: 'Upcoming' },
    { title: 'Review Reviver',     desc: 'Improve Google rating',           icon: Star,      earned: false, date: 'Upcoming' },
    { title: '5-Star Elite',       desc: 'Maintain 4.5+ avg 60 days',      icon: Award,     earned: false, date: 'Upcoming' },
    { title: 'Viral Moment',       desc: '50k+ video views / month',       icon: Zap,       earned: false, date: 'Upcoming' },
    { title: 'Growth Architect',   desc: '500+ monthly leads',             icon: TrendingUp,earned: false, date: 'Upcoming' },
  ];

  const skillRadar = [
    { skill: 'SEO',          score: 0 },
    { skill: 'Social Media', score: 0 },
    { skill: 'Content',      score: 0 },
    { skill: 'Email Mktg',   score: 0 },
    { skill: 'Paid Ads',     score: 0 },
    { skill: 'Web Design',   score: 0 },
    { skill: 'Analytics',    score: 0 },
    { skill: 'Video',        score: 0 },
  ];

  // ── Client ROI data ─────────────────────────────────────────────────────────
  const roiSpend = [];

  const roiChannels = [
    { channel: 'Organic SEO',  leads: _seoData.reduce((s,e)=>s+Number(e.clicks||0),0),                                                           cpl: '—', roi: '—', color: '#0d9488' },
    { channel: 'Social Media', leads: _socialMet.reduce((s,e)=>s+Number(e.clicks||0),0),                                                         cpl: '—', roi: '—', color: '#8b5cf6' },
    { channel: 'Google Ads',   leads: _adSpend.filter(e=>e.platform==='Google Ads').reduce((s,e)=>s+Number(e.leads||0),0),                        cpl: '—', roi: '—', color: '#3b82f6' },
    { channel: 'Email',        leads: _emailStats.reduce((s,e)=>s+Number(e.conversions||0),0),                                                    cpl: '—', roi: '—', color: '#10b981' },
  ];

  // ── Content Calendar data ────────────────────────────────────────────────────
  const [contentItems, setContentItems] = useState([
    { title: 'Mental Health Awareness Post',       platform: 'Facebook, Instagram', date: 'Mon 3',  type: 'Social', status: 'scheduled', notes: 'Focus on stigma reduction'          },
    { title: '5 Signs You Need Support (TikTok)',  platform: 'TikTok',              date: 'Tue 4',  type: 'TikTok', status: 'filming',   notes: 'Short-form, 60s max'                },
    { title: 'Blog: Anxiety Support in Arizona',   platform: 'Website',             date: 'Wed 5',  type: 'Blog',   status: 'draft',     notes: '1,200 words – SEO optimized'        },
    { title: 'Weekly Email Newsletter',            platform: 'Mailchimp',           date: 'Thu 6',  type: 'Email',  status: 'scheduled', notes: 'All subscribers – 3pm send time'    },
    { title: 'Success Story Spotlight',            platform: 'LinkedIn',            date: 'Fri 7',  type: 'Social', status: 'idea',      notes: 'Patient testimonial (anonymized)'   },
    { title: 'Weekend Wellness Tip',               platform: 'Instagram',           date: 'Sat 8',  type: 'Social', status: 'scheduled', notes: '5 breathing exercises for calm'     },
    { title: 'Staff Introduction Video',           platform: 'TikTok, Instagram',   date: 'Mon 10', type: 'TikTok', status: 'filming',   notes: 'Behind the scenes series'           },
    { title: 'SEO Blog: Finding a Therapist AZ',   platform: 'Website',             date: 'Thu 13', type: 'Blog',   status: 'idea',      notes: 'Target: therapist near me Arizona'  },
    { title: 'Monthly Patient Outreach Email',     platform: 'Mailchimp',           date: 'Fri 14', type: 'Email',  status: 'scheduled', notes: 'Re-engagement campaign'             },
    { title: 'Recovery Awareness Post',            platform: 'Facebook, LinkedIn',  date: 'Mon 17', type: 'Social', status: 'scheduled', notes: 'Link to latest blog article'        },
    { title: 'TikTok Q&A: Common Questions',       platform: 'TikTok',              date: 'Wed 19', type: 'TikTok', status: 'idea',      notes: '3-part Q&A series'                 },
    { title: 'Ad Creative: New Patient Special',   platform: 'Meta Ads',            date: 'Thu 20', type: 'Social', status: 'draft',     notes: 'A/B test 2 creative variants'      },
  ]);

  const calendarTypes = ['All', 'Blog', 'Social', 'TikTok', 'Email'];
  const filteredContent = calFilter === 'All' ? contentItems : contentItems.filter(c => c.type === calFilter);

  const typeColor = {
    Blog:   'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    Social: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    TikTok: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
    Email:  'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  };

  const statusColor = {
    published: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    scheduled: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
    draft:     'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    filming:   'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
    idea:      'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  };

  // ── Review Management data ──────────────────────────────────────────────────
  const recentReviews = _reviews.slice().reverse().slice(0, 8).map(r => ({
    author:    r.name || 'Anonymous',
    rating:    Number(r.rating) || 5,
    date:      r.date || '',
    text:      r.text || 'No review text provided.',
    responded: Number(r.rating) >= 4,
    platform:  r.platform || 'Google',
  }));
  const _revTrendMap = {};
  _reviews.forEach(r => {
    const mon = r.date ? r.date.slice(0, 7) : null;
    if (!mon) return;
    if (!_revTrendMap[mon]) _revTrendMap[mon] = { month: mon, reviews: 0, total: 0 };
    _revTrendMap[mon].reviews++;
    _revTrendMap[mon].total += Number(r.rating) || 0;
  });
  const reviewTrend = Object.values(_revTrendMap)
    .sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
    .map(m => ({ ...m, rating: m.reviews ? +(m.total / m.reviews).toFixed(1) : 0 }));
  const promoters = _reviews.filter(r => Number(r.rating) >= 4).slice(0, 8).map(r => ({
    name:   r.name || 'Anonymous Client',
    nps:    Number(r.rating) || 5,
    status: 'pending',
  }));

  // ── Integrations data ───────────────────────────────────────────────────────
  const integrationsBase = [
    { name: 'Google Analytics',    sub: 'GA4 + Search Console',    icon: BarChart3,  color: 'text-orange-500', metrics: ['Sessions', 'Bounce Rate', 'Conversions', 'Keywords']       },
    { name: 'Google Business',     sub: 'Reviews & Rating Feed',   icon: Star,       color: 'text-amber-500',  metrics: ['Rating', 'Reviews', 'Searches', 'Direction Requests']     },
    { name: 'Meta Business Suite', sub: 'Facebook & Instagram',    icon: Share2,     color: 'text-blue-500',   metrics: ['Page Fans', 'Reach', 'Engagement', 'Impressions']         },
    { name: 'Wix Analytics',       sub: 'Website Traffic & CVR',   icon: Globe,      color: 'text-teal-500',   metrics: ['Sessions', 'Bounce Rate', 'Top Pages', 'Conversions']     },
    { name: 'Mailchimp',           sub: 'Email Campaigns',         icon: Mail,       color: 'text-yellow-500', metrics: ['Subscribers', 'Open Rate', 'Click Rate', 'Campaigns']     },
    { name: 'Google Ads',          sub: 'Paid Search Campaigns',   icon: Target,     color: 'text-indigo-500', metrics: ['Impressions', 'Clicks', 'CPC', 'Conversions']             },
    { name: 'Meta Ads Manager',    sub: 'FB & IG Paid Campaigns',  icon: Megaphone,  color: 'text-blue-400',   metrics: ['Ad Spend', 'Reach', 'CPM', 'ROAS']                        },
    { name: 'TikTok for Business', sub: 'Organic Posts & Content',  icon: PlayCircle, color: 'text-pink-400',   metrics: ['Video Views', 'Followers', 'Likes', 'Comments']           },
    { name: 'Sintra AI',           sub: 'AI Marketing Automation', icon: Bot,        color: 'text-purple-500', metrics: ['Campaigns', 'Reports', 'Insights', 'Automations']         },
    { name: 'MarkyAI',             sub: 'AI Content & Scheduling', icon: Zap,        color: 'text-pink-500',   metrics: ['Content Posts', 'Scheduling', 'Analytics', 'AI Writes']  },
    { name: 'YouTube Analytics',   sub: 'Channel Stats & Videos',  icon: Youtube,    color: 'text-rose-500',   metrics: ['Subscribers', 'Total Views', 'Video Count', 'Recent Videos'] },
    { name: 'Yelp Reviews',        sub: 'Business Ratings & Reviews', icon: Building2,color: 'text-red-500',    metrics: ['Rating', 'Review Count', 'Categories', 'Hours']              },
    { name: 'News API',            sub: 'Industry News Intelligence', icon: Newspaper, color: 'text-sky-500',    metrics: ['Headlines', 'Brand Mentions', 'Industry News', 'RSS Feeds']  },
  ];
  const integrations = integrationsBase.map(i => ({
    ...i,
    connected: !!connections[i.name]?.connected,
    lastSync:  connections[i.name]?.lastSync || 'Not connected',
  }));

  const handleAddPost = () => {
    if (!newPost.title || !newPost.date) return;
    setContentItems(prev => [...prev, { ...newPost }]);
    setNewPost({ title: '', platform: 'Facebook', date: '', type: 'Social', status: 'scheduled', notes: '' });
    setShowAddPost(false);
  };

  // ── Helper Components ─────────────────────────────────────────────────────────
  const StatCard = ({ title, value, trend, icon: Icon, color, sub, trendPositive, onClick }) => {
    const isPositive = trend && (trendPositive !== undefined ? trendPositive : trend.startsWith('+'));
    const isNeutral  = trend && trend === '0%';
    const col = colorMap[color] || colorMap['bg-teal-600'];
    return (
      <div
        className="kpi-card"
        style={{ '--r': col.r, '--g': col.g, '--b': col.b }}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      >
        <div className="kpi-watermark"><Icon size={70} color={col.hex} /></div>
        <div className="kpi-top">
          <div className="kpi-icon-box"><Icon size={26} color={col.hex} /></div>
          {trend && (
            <span className={`kpi-badge ${isNeutral ? 'kpi-badge-neutral' : isPositive ? 'kpi-badge-up' : 'kpi-badge-down'}`}>{trend}</span>
          )}
        </div>
        <div className="kpi-label">{title}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    );
  };

  const SectionHeader = ({ icon: Icon, color, title, subtitle }) => {
    const col = sectionColorMap[color] || sectionColorMap['text-teal-500'];
    return (
      <div className="section-header" style={{ '--sr': col.r, '--sg': col.g, '--sb': col.b }}>
        <div className="section-icon"><Icon size={22} color={col.hex} /></div>
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      </div>
    );
  };

  const EmptyChart = ({ height = 'h-64', message = 'Connect integrations to populate this chart' }) => (
    <div className={`${height} empty-chart`}>
      <div className="empty-chart-icon">
        <BarChart3 size={26} color={darkMode ? '#334155' : '#cbd5e1'} />
      </div>
      <p className="empty-chart-msg">{message}</p>
      <span className="empty-chart-badge">Awaiting Integration Data</span>
    </div>
  );

  const StarRow = ({ n }) => (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} className={i <= n ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
      ))}
    </span>
  );

  const tabs = [
    { id: 'overview',     label: 'Overview',      icon: BarChart3   },
    { id: 'social',       label: 'Social',        icon: Share2      },
    { id: 'seo',          label: 'SEO',           icon: Search      },
    { id: 'ads',          label: 'Paid Ads',      icon: Megaphone   },
    { id: 'email',        label: 'Email',         icon: Mail        },
    { id: 'pipeline',     label: 'Pipeline',      icon: Users       },
    { id: 'achievements', label: 'Achievements',  icon: Trophy      },
    { id: 'roi',          label: 'ROI',           icon: DollarSign  },
    { id: 'calendar',     label: 'Calendar',      icon: Calendar    },
    { id: 'reviews',      label: 'Reviews',       icon: Star        },
    { id: 'intel',        label: 'Intel',         icon: Newspaper   },
    { id: 'integrations', label: 'Integrations',  icon: Plug        },
    { id: 'import',       label: 'Data Import',   icon: Upload      },
    { id: 'ai-tools',     label: 'AI Tools',      icon: Bot         },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-shell font-sans">

      {/* SIDEBAR */}
      <aside className={`sidebar no-print ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Heart size={20} color="#2dd4bf" fill="#2dd4bf" />
          </div>
          {!sidebarCollapsed && (
            <div className="sidebar-brand-text">
              <div className="gradient-title sidebar-title">Destiny Springs</div>
              <div className="sidebar-subtitle">Healthcare – DMD</div>
            </div>
          )}
        </div>

        {/* Nav label */}
        {!sidebarCollapsed && <div className="sidebar-section-label">Navigation</div>}

        {/* Nav items */}
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sidebar-item ${activeTab === tab.id ? 'sidebar-item-active' : ''}`}
              title={sidebarCollapsed ? tab.label : undefined}
            >
              <tab.icon size={16} className="sidebar-icon" />
              {!sidebarCollapsed && <span className="sidebar-label">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="sidebar-footer">
          <button
            onClick={() => setDarkMode(d => !d)}
            className="sidebar-item"
            title={sidebarCollapsed ? (darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined}
          >
            {darkMode
              ? <Sun  size={16} className="sidebar-icon" />
              : <Moon size={16} className="sidebar-icon" />}
            {!sidebarCollapsed && (
              <span className="sidebar-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            )}
          </button>
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className="sidebar-item"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={16}
              className="sidebar-icon"
              style={{
                transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.25s',
              }}
            />
            {!sidebarCollapsed && <span className="sidebar-label">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="main-area">

        {/* Top bar */}
        <header className="topbar no-print">
          <div className="topbar-left">
            <div className="topbar-page-title">
              {tabs.find(t => t.id === activeTab)?.label ?? 'Dashboard'}
            </div>
            <div className="topbar-breadcrumb">
              Destiny Springs Healthcare &middot; Digital Marketing &amp; Business Development Portal
            </div>
          </div>
          <div className="topbar-right">
            <button onClick={() => setActiveTab('calendar')} className="topbar-date hover:opacity-80 transition-opacity cursor-pointer" title="Go to Content Calendar">
              <Calendar size={11} />
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </button>
            <div className="topbar-live">
              <div className="live-dot" />
              <span>Live</span>
            </div>
            <button onClick={() => setDarkMode(d => !d)} className="topbar-btn topbar-btn-ghost">
              {darkMode ? <Sun size={13} /> : <Moon size={13} />}
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button onClick={() => window.print()} className="topbar-btn topbar-btn-ghost">
              <Printer size={13} />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="content-area">

{activeTab === 'overview' && (
          <>
            {/* Top KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              <StatCard title="Google Rating"     value={metrics.googleScore}    trend={metrics.googleTrend} icon={Star}        color="bg-amber-500"   sub="Review Cleanup Performance" onClick={() => setActiveTab('reviews')} />
              <StatCard title="Monthly Sessions"  value={metrics.wixSessions}    trend={null}                icon={Layout}      color="bg-teal-600"    sub="Wix Website Traffic"        onClick={() => setActiveTab('seo')} />
              <StatCard title="Avg Read Time"     value={metrics.avgReadTime}    trend={null}                icon={Clock}       color="bg-emerald-600" sub="Blog & Education Retention"  onClick={() => setActiveTab('seo')} />
              <StatCard title="Omnichannel Reach" value={_socialMet.reduce((s,e)=>s+Number(e.reach||0),0)>0 ? _socialMet.reduce((s,e)=>s+Number(e.reach||0),0).toLocaleString() : '---'}                      trend={null}                icon={Activity}    color="bg-purple-600"  sub="Combined Ad / Social"        onClick={() => setActiveTab('social')} />
              </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              <StatCard title="Total Leads"       value={metrics.totalLeads}     trend={metrics.leadsGrowth} icon={Target}      color="bg-rose-500"    sub="Monthly Lead Volume"         onClick={() => setActiveTab('pipeline')} />
              <StatCard title="Cost Per Lead"     value={metrics.costPerLead}    trend={null}                icon={TrendingDown} color="bg-indigo-600" sub="Blended Paid Acquisition"    onClick={() => setActiveTab('ads')} />
              <StatCard title="Site Conversion"   value={metrics.siteConversion} trend={null}                icon={MousePointer} color="bg-teal-600"   sub="Visitor to Lead Rate"         onClick={() => setActiveTab('seo')} />
              <StatCard title="NPS Score"         value={metrics.nps}            trend={null}                icon={ThumbsUp}    color="bg-amber-600"   sub="Net Promoter Score"          onClick={() => setActiveTab('reviews')} />
            </div>

            {/* 6-Month Trend */}
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={TrendingUp} color="text-teal-500" title="6-Month Growth Trend" subtitle="Sessions, Reach & Lead Volume" />
              <div className="h-72">
                {monthlyTrend.length === 0 ? (
                  <EmptyChart height="h-72" message="No trend data yet – connect Google Analytics &amp; Meta to populate" />
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 11, fontWeight: 700 }} />
                    <YAxis yAxisId="left"  axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10 }} />
                    <Tooltip contentStyle={tipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: tick }} />
                    <Area yAxisId="left"  type="monotone" dataKey="sessions" fill={darkMode ? '#0d948820' : '#ccfbf1'} stroke="#0d9488" strokeWidth={3} name="Sessions" />
                    <Area yAxisId="left"  type="monotone" dataKey="reach"    fill={darkMode ? '#8b5cf620' : '#f5f3ff'} stroke="#8b5cf6" strokeWidth={3} name="Reach"    />
                    <Bar  yAxisId="right" dataKey="leads" fill="#10b981" radius={[6,6,0,0]} barSize={24} name="Leads" />
                  </ComposedChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* NPS / Wix / Regional */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              <div className={`lg:col-span-4 ${card} p-8 rounded-[2.5rem] flex flex-col`}>
                <SectionHeader icon={ThumbsUp} color="text-amber-500" title="NPS Breakdown" subtitle="Promoters / Passives / Detractors" />
                <div className="flex-1 min-h-[180px]">
                  {npsData.every(d => d.value === 0) ? (
                    <EmptyChart height="min-h-[180px] h-full" message="NPS data unavailable" />
                  ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={npsData} innerRadius={55} outerRadius={75} paddingAngle={6} dataKey="value">
                        {npsData.map((e,i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  )}
                </div>
                <div className="space-y-2 mt-4">
                  {npsData.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className={`text-[13px] font-bold ${txt2}`}>{s.name}</span>
                      </div>
                      <span className={`text-[13px] font-black ${txt}`}>{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`lg:col-span-4 ${card} p-8 rounded-[2.5rem] flex flex-col`}>
                <SectionHeader icon={Layout} color="text-teal-500" title="Wix Analytics" subtitle="Traffic Acquisition Sources" />
                <div className="flex-1 min-h-[180px]">
                  {wixSources.every(s => s.value === 0) ? (
                    <EmptyChart height="min-h-[180px] h-full" message="Connect Wix Analytics to see traffic sources" />
                  ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={wixSources} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value">
                        {wixSources.map((e,i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  )}
                </div>
                <div className="space-y-2 mt-4">
                  {wixSources.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className={`text-[13px] font-bold ${txt2}`}>{s.name}</span>
                      </div>
                      <span className={`text-[13px] font-black ${txt}`}>{s.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <span className={`text-[13px] font-black uppercase ${subtl} tracking-wider`}>Bounce Rate</span>
                    <span className="text-sm font-black text-teal-500">{metrics.wixBounceRate}</span>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-4 ${card} p-8 rounded-[2.5rem]`}>
                <SectionHeader icon={Map} color="text-rose-500" title="AZ Market Share" subtitle="Statewide Regional Breakdown" />
                <div className="space-y-4">
                  {regionalTraffic.map(item => (
                    <div key={item.city}>
                      <div className={`flex justify-between text-[13px] font-black ${subtl} uppercase mb-1`}>
                        <span>{item.city}</span><span>{item.traffic}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full" style={{ width: `${item.traffic}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* UX Path & Content Velocity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className={`${card} p-7 rounded-[2.5rem]`}>
                <SectionHeader icon={MousePointer} color="text-teal-500" title="Video Tracing Analysis" subtitle="UX Depth & Page Retention" />
                <div className="space-y-5">
                  {pathData.map(p => (
                    <div key={p.name}>
                      <div className={`flex justify-between text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>
                        <span>{p.name}</span><span>{p.stay}% Retention</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500" style={{ width: `${p.stay}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} p-7 rounded-[2.5rem]`}>
                <SectionHeader icon={FileText} color="text-purple-500" title="Content Velocity" subtitle="Monthly Production Output" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { val: metrics.blogVelocity,   label: 'Blogs / Mo',  bg: 'bg-purple-50 dark:bg-purple-900/30', tx: 'text-purple-900 dark:text-purple-200', sm: 'text-purple-500' },
                    { val: metrics.tiktokVelocity, label: 'TikToks / Mo',bg: 'bg-pink-50 dark:bg-pink-900/30',     tx: 'text-pink-900 dark:text-pink-200',     sm: 'text-pink-500'   },
                    { val: _socialMet.reduce((s,e)=>s+Number(e.posts||0),0) || metrics.socialPostsMonthly || '---', label: 'Social Posts', bg: 'bg-teal-50 dark:bg-teal-900/30',   tx: 'text-teal-900 dark:text-teal-200',     sm: 'text-teal-500'   },
                    { val: metrics.videoViews,      label: 'Video Views',  bg: 'bg-amber-50 dark:bg-amber-900/30', tx: 'text-amber-900 dark:text-amber-200',   sm: 'text-amber-500'  },
                  ].map(s => (
                    <div key={s.label} className={`p-4 ${s.bg} rounded-3xl text-center`}>
                      <div className={`text-3xl font-black ${s.tx}`}>{s.val}</div>
                      <div className={`text-[13px] ${s.sm} font-black uppercase mt-1`}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className={`flex justify-between items-center text-[13px] font-bold`}>
                    <span className={`${muted} uppercase`}>Statewide SEO Lift</span>
                    <span className="text-teal-500">{metrics.seoStatewideGrowth} Organic</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 w-[74%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><CheckCircle className="text-teal-400" size={32} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Google Review Pipeline</h3>
                  <p className="text-slate-400 text-sm">Promoters identified via NPS will appear here for 5-star outreach.</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[13px] font-black">User</div>
                ))}
                <div className="h-10 w-10 rounded-full bg-teal-600 border-2 border-slate-800 flex items-center justify-center text-[13px] font-black">0</div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ SOCIAL ══════════════════ */}
        {activeTab === 'social' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              {socialAnalytics.map(s => (
                <div key={s.platform} className={`${card} p-5 rounded-2xl`}>
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.color + '25' }}>
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: s.color }}></div>
                  </div>
                  <p className={`text-[13px] font-black uppercase ${subtl} tracking-widest mb-1`}>{s.platform}</p>
                  <h3 className={`text-2xl font-black ${txt}`}>{s.reach.toLocaleString()}</h3>
                  <p className={`text-[13px] ${subtl} italic mt-1`}>Monthly Reach</p>
                  <div className={`mt-3 pt-3 border-t ${brd} flex justify-between text-[13px] font-bold`}>
                    <span className={muted}>{s.followers.toLocaleString()} Followers</span>
                    <span className="text-teal-500">{s.clicks} Clicks</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Share2} color="text-blue-500" title="Social Intelligence" subtitle="Platform Reach vs. Engagement Depth" />
              <div className="h-80">
                {socialAnalytics.every(s => s.reach === 0) ? (
                  <EmptyChart height="h-80" message="Connect Meta Business Suite to see social intelligence data" />
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={socialAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                    <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 11, fontWeight: 900 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10 }} />
                    <Tooltip contentStyle={tipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: tick }} />
                    <Bar dataKey="reach"      fill="#0d9488" radius={[10,10,0,0]} barSize={50} name="Reach"      />
                    <Bar dataKey="engagement" fill="#8b5cf6" radius={[10,10,0,0]} barSize={20} name="Engagement" />
                  </ComposedChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Activity} color="text-purple-500" title="Weekly Engagement by Platform" subtitle="Last 4 Weeks" />
              <div className="h-72">
                {weeklyEngagement.length === 0 ? (
                  <EmptyChart height="h-72" message="No weekly engagement data yet" />
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyEngagement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10 }} />
                    <Tooltip contentStyle={tipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: tick }} />
                    <Bar dataKey="facebook"  fill="#1877F2" radius={[6,6,0,0]} name="Facebook"  />
                    <Bar dataKey="instagram" fill="#E4405F" radius={[6,6,0,0]} name="Instagram" />
                    <Bar dataKey="linkedin"  fill="#0A66C2" radius={[6,6,0,0]} name="LinkedIn"  />
                    <Bar dataKey="tiktok"    fill="#00f2ea" radius={[6,6,0,0]} name="TikTok"    />
                  </BarChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>
            {/* Quick-Add: Social Metrics */}
            <div className="mt-4 bg-teal-50 dark:bg-teal-950/30 border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-2xl p-5">
              <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowQuickAdd(p => !p)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-xl"><Plus size={14} className="text-teal-600 dark:text-teal-400" /></div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">Add Social Metrics Entry</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Log data here — charts update instantly</p>
                  </div>
                </div>
                <ChevronDown size={16} className={`transition-transform text-slate-400 ${showQuickAdd ? 'rotate-180' : ''}`} />
              </div>
              {showQuickAdd && (
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select value={manualForm.platform||''} onChange={e=>setManualForm(p=>({...p,platform:e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm w-full">
                      <option value="">Platform</option>
                      {['Facebook','Instagram','LinkedIn','TikTok','Twitter','YouTube'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                    {[['month','Month','month'],['followers','Followers','number'],['reach','Reach','number'],['impressions','Impressions','number'],['engagement','Engagement %','number'],['clicks','Clicks','number'],['posts','Posts','number']].map(([k,lbl,t])=>(
                      <input key={k} type={t} placeholder={lbl} value={manualForm[k]||''} onChange={e=>setManualForm(p=>({...p,[k]:e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm w-full" />
                    ))}
                  </div>
                  <button onClick={()=>{saveManualEntry('Social Metrics');setShowQuickAdd(false);}} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl">Save Social Entry</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════ SEO & CONTENT ══════════════════ */}
        {activeTab === 'seo' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              <StatCard title="Organic Growth"  value="+24%"              trend="+24%" icon={TrendingUp} color="bg-teal-600"   sub="Statewide SEO Lift"   />
              <StatCard title="Avg Position"    value="4.5"               trend="+2.1" icon={Search}     color="bg-blue-600"   sub="Google SERP Average"  />
              <StatCard title="Blog Posts / Mo" value={metrics.blogVelocity} trend="+4" icon={FileText}  color="bg-purple-600" sub="Monthly Production"   />
              <StatCard title="Avg Read Time"   value={metrics.avgReadTime} trend="+12s" icon={Clock}    color="bg-amber-600"  sub="Content Engagement"   />
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Search} color="text-blue-500" title="Keyword Rankings" subtitle="Top AZ Healthcare Keywords" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-[13px] font-black ${subtl} uppercase tracking-widest border-b ${brd}`}>
                      <th className="text-left pb-3 pr-4">Keyword</th>
                      <th className="text-center pb-3 px-4">Rank</th>
                      <th className="text-center pb-3 px-4">Change</th>
                      <th className="text-right pb-3 pl-4">Volume / Mo</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divdr}`}>
                    {seoKeywords.map(kw => (
                      <tr key={kw.keyword}>
                        <td className={`py-3 pr-4 text-sm font-bold ${txt}`}>{kw.keyword}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-black px-3 py-1 rounded-full">#{kw.rank}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs font-black px-2 py-1 rounded-full ${kw.change > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                            {kw.change > 0 ? `? ${kw.change}` : `? ${Math.abs(kw.change)}`}
                          </span>
                        </td>
                        <td className={`py-3 pl-4 text-right text-sm font-bold ${txt2}`}>{kw.volume.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={FileText} color="text-purple-500" title="Top Blog Performance" subtitle="Views, Read Time & Social Shares" />
              <div className="space-y-4">
                {blogPosts.map((post, i) => (
                  <div key={post.title} className={`flex items-center gap-4 p-4 ${rowCls} rounded-2xl`}>
                    <div className="h-8 w-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-sm font-black text-purple-700 dark:text-purple-300 shrink-0">{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${txt} truncate`}>{post.title}</p>
                      <div className="flex gap-4 mt-1">
                        <span className={`text-[13px] font-bold ${subtl}`}><Eye size={10} className="inline mr-1" />{post.views.toLocaleString()} views</span>
                        <span className={`text-[13px] font-bold ${subtl}`}><Clock size={10} className="inline mr-1" />{post.readTime}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-black ${txt}`}>{post.shares}</div>
                      <div className={`text-[12px] font-bold ${subtl} uppercase`}>Shares</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${card} p-7 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={PlayCircle} color="text-pink-500" title="TikTok Velocity" subtitle="Short-Form Video Production" />
              <div className="grid grid-cols-3 gap-4">
                {[
                  { val: metrics.tiktokVelocity, label: 'Videos / Mo',  bg: 'bg-pink-50 dark:bg-pink-900/30',   tx: 'text-pink-900 dark:text-pink-200',   sm: 'text-pink-500'   },
                  { val: metrics.videoViews,      label: 'Total Views',  bg: 'bg-rose-50 dark:bg-rose-900/30',   tx: 'text-rose-900 dark:text-rose-200',   sm: 'text-rose-500'   },
                  { val: '3.2k',                  label: 'Engagements',  bg: 'bg-orange-50 dark:bg-orange-900/30',tx: 'text-orange-900 dark:text-orange-200',sm: 'text-orange-500' },
                ].map(s => (
                  <div key={s.label} className={`p-4 ${s.bg} rounded-3xl text-center`}>
                    <div className={`text-3xl font-black ${s.tx}`}>{s.val}</div>
                    <div className={`text-[13px] ${s.sm} font-black uppercase mt-1`}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Quick-Add: SEO Rankings */}
            <div className="mt-4 bg-teal-50 dark:bg-teal-950/30 border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-2xl p-5">
              <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowQuickAdd(p => !p)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-xl"><Plus size={14} className="text-teal-600 dark:text-teal-400" /></div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">Add SEO Rankings Entry</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Log keyword data — charts update instantly</p>
                  </div>
                </div>
                <ChevronDown size={16} className={`transition-transform text-slate-400 ${showQuickAdd ? 'rotate-180' : ''}`} />
              </div>
              {showQuickAdd && (
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[['keyword','Keyword','text'],['rank','Current Rank','number'],['prevRank','Previous Rank','number'],['searchVol','Search Volume','number'],['clicks','Organic Clicks','number'],['month','Month','month']].map(([k,lbl,t])=>(
                      <input key={k} type={t} placeholder={lbl} value={manualForm[k]||''} onChange={e=>setManualForm(p=>({...p,[k]:e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm w-full" />
                    ))}
                  </div>
                  <button onClick={()=>{saveManualEntry('SEO Rankings');setShowQuickAdd(false);}} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl">Save SEO Entry</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════ PAID ADS ══════════════════ */}
        {activeTab === 'ads' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              <StatCard title="Total Ad Spend"    value={_totalSpend > 0 ? '$'+_totalSpend.toLocaleString() : '---'}  trend={null} icon={Target}      color="bg-indigo-600" sub="Monthly Budget"      onClick={() => setActiveTab('import')} />
              <StatCard title="Total Leads"       value={_totalLeads > 0 ? _totalLeads.toLocaleString() : '---'}        trend={null} icon={Users}       color="bg-teal-600"  sub="From Paid Channels" onClick={() => setActiveTab('import')} />
              <StatCard title="Avg CPL"           value={metrics.costPerLead}                                             trend={null} icon={TrendingDown} color="bg-blue-600" sub="Cost Per Lead" />
              <StatCard title="Total Impressions" value={_totalImpressions > 0 ? _totalImpressions.toLocaleString() : '---'} trend={null} icon={Eye}  color="bg-amber-600" sub="Paid Visibility" />
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={BarChart3} color="text-indigo-500" title="Paid Channel Performance" subtitle="Google, Meta & LinkedIn Ads" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-[13px] font-black ${subtl} uppercase tracking-widest border-b ${brd}`}>
                      {['Channel','Spend','Impressions','Clicks','Leads','CPL'].map(h => (
                        <th key={h} className={`${h==='Channel'?'text-left':'text-right'} pb-3 px-4`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divdr}`}>
                    {adPerformance.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-400">No ad data yet — add an entry below</td></tr>
                    ) : adPerformance.map(ad => (
                      <tr key={ad.platform}>
                        <td className={`py-3 pr-4 text-sm font-bold ${txt}`}>{ad.platform}</td>
                        <td className={`py-3 px-4 text-right text-sm font-bold ${txt2}`}>${ad.spend.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-right text-sm font-bold ${txt2}`}>{ad.impressions.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-right text-sm font-bold ${txt2}`}>{ad.clicks.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-black px-3 py-1 rounded-full">{ad.leads}</span>
                        </td>
                        <td className={`py-3 pl-4 text-right text-sm font-black ${txt}`}>{ad.cpl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={TrendingUp} color="text-teal-500" title="Lead Volume Trend" subtitle="6-Month Monthly Lead Growth" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10 }} />
                    <Tooltip contentStyle={tipStyle} />
                    <Area type="monotone" dataKey="leads" fill={darkMode ? '#0d948825' : '#ccfbf1'} stroke="#0d9488" strokeWidth={3} name="Leads" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Quick-Add: Ad Spend */}
            <div className="mt-4 bg-teal-50 dark:bg-teal-950/30 border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-2xl p-5">
              <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowQuickAdd(p => !p)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-xl"><Plus size={14} className="text-teal-600 dark:text-teal-400" /></div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">Add Ad Spend Entry</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Log campaign data — performance table updates instantly</p>
                  </div>
                </div>
                <ChevronDown size={16} className={`transition-transform text-slate-400 ${showQuickAdd ? 'rotate-180' : ''}`} />
              </div>
              {showQuickAdd && (
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select value={manualForm.platform||''} onChange={e=>setManualForm(p=>({...p,platform:e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm w-full">
                      <option value="">Platform</option>
                      {['Google Ads','Meta Ads','LinkedIn Ads','TikTok Ads','Display Ads'].map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                    {[['month','Month','month'],['spend','Spend ($)','number'],['impressions','Impressions','number'],['clicks','Clicks','number'],['leads','Leads','number'],['cpl','Cost Per Lead ($)','number'],['roas','ROAS (x)','number']].map(([k,lbl,t])=>(
                      <input key={k} type={t} placeholder={lbl} value={manualForm[k]||''} onChange={e=>setManualForm(p=>({...p,[k]:e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm w-full" />
                    ))}
                  </div>
                  <button onClick={()=>{saveManualEntry('Ad Spend');setShowQuickAdd(false);}} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl">Save Ad Entry</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════ EMAIL ══════════════════ */}
        {activeTab === 'email' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              <StatCard title="Avg Open Rate"     value={metrics.emailOpenRate} trend={null}  icon={Mail}        color="bg-teal-600"   sub="All Campaigns"      />
              <StatCard title="Total Sent"        value={emailCampaigns.reduce((s,c)=>s+c.sent,0)>0 ? emailCampaigns.reduce((s,c)=>s+c.sent,0).toLocaleString() : '---'} trend={null} icon={Users} color="bg-purple-600" sub="Total Emails Sent" />
              <StatCard title="Avg Click Rate"    value={emailCampaigns.length>0 ? (emailCampaigns.reduce((s,c)=>s+c.clicked,0)/Math.max(1,emailCampaigns.reduce((s,c)=>s+c.sent,0))*100).toFixed(1)+'%' : '---'} trend={null} icon={MousePointer} color="bg-emerald-600" sub="Avg CTR" />
              <StatCard title="Conversions"       value={emailCampaigns.reduce((s,c)=>s+(c.conversions||0),0)||'---'} trend={null} icon={CheckCircle} color="bg-amber-600" sub="Email-Attributed" />
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Mail} color="text-teal-500" title="Email Campaign Performance" subtitle="Sends, Opens, Clicks & Conversions" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-[13px] font-black ${subtl} uppercase tracking-widest border-b ${brd}`}>
                      {['Campaign','Sent','Opened','Clicked','Converted'].map(h => (
                        <th key={h} className={`${h==='Campaign'?'text-left':'text-right'} pb-3 px-4`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divdr}`}>
                    {emailCampaigns.map(c => (
                      <tr key={c.campaign}>
                        <td className={`py-3 pr-4 text-sm font-bold ${txt}`}>{c.campaign}</td>
                        <td className={`py-3 px-4 text-right text-sm font-bold ${txt2}`}>{c.sent.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right"><span className="text-sm font-bold text-blue-500">{c.opened} <span className={`${subtl} text-xs`}>({Math.round((c.opened/c.sent)*100)}%)</span></span></td>
                        <td className="py-3 px-4 text-right"><span className="text-sm font-bold text-purple-500">{c.clicked} <span className={`${subtl} text-xs`}>({Math.round((c.clicked/c.sent)*100)}%)</span></span></td>
                        <td className="py-3 pl-4 text-right"><span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-black px-3 py-1 rounded-full">{c.converted}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={BarChart3} color="text-purple-500" title="Opens vs. Clicks by Campaign" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emailCampaigns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                    <XAxis dataKey="campaign" axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10 }} />
                    <Tooltip contentStyle={tipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: tick }} />
                    <Bar dataKey="opened"    fill="#0d9488" radius={[6,6,0,0]} name="Opened"    />
                    <Bar dataKey="clicked"   fill="#8b5cf6" radius={[6,6,0,0]} name="Clicked"   />
                    <Bar dataKey="converted" fill="#10b981" radius={[6,6,0,0]} name="Converted" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Quick-Add: Email Campaign */}
            <div className="mt-4 bg-teal-50 dark:bg-teal-950/30 border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-2xl p-5">
              <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowQuickAdd(p => !p)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-xl"><Plus size={14} className="text-teal-600 dark:text-teal-400" /></div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">Add Email Campaign Entry</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Log campaign stats — metrics update instantly</p>
                  </div>
                </div>
                <ChevronDown size={16} className={`transition-transform text-slate-400 ${showQuickAdd ? 'rotate-180' : ''}`} />
              </div>
              {showQuickAdd && (
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[['campaign','Campaign Name','text'],['date','Date','date'],['sent','Emails Sent','number'],['opened','Opened','number'],['clicked','Clicked','number'],['conversions','Conversions','number'],['unsub','Unsubscribes','number'],['revenue','Revenue ($)','number']].map(([k,lbl,t])=>(
                      <input key={k} type={t} placeholder={lbl} value={manualForm[k]||''} onChange={e=>setManualForm(p=>({...p,[k]:e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm w-full" />
                    ))}
                  </div>
                  <button onClick={()=>{saveManualEntry('Email Stats');setShowQuickAdd(false);}} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl">Save Email Entry</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════ PIPELINE ══════════════════ */}
        {activeTab === 'pipeline' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'High Priority',   dot: 'bg-rose-500',  key: 'high',   desc: 'Urgent action items' },
                { label: 'Medium Priority', dot: 'bg-amber-500', key: 'medium', desc: 'Scheduled this week' },
                { label: 'Low Priority',    dot: 'bg-slate-400', key: 'low',    desc: 'Backlog items'       },
              ].map(p => (
                <div key={p.key} className={`${card} p-5 rounded-2xl`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-3 w-3 rounded-full ${p.dot}`}></div>
                    <span className={`text-[13px] font-black uppercase ${subtl} tracking-widest`}>{p.label}</span>
                  </div>
                  <p className={`text-2xl font-black ${txt}`}>{pipeline.filter(t => t.priority === p.key).length}</p>
                  <p className={`text-[13px] ${subtl} mt-1 italic`}>{p.desc}</p>
                </div>
              ))}
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={CheckCircle} color="text-teal-500" title="Action Pipeline" subtitle="Upcoming Tasks & Deliverables" />
              <div className="space-y-3">
                {pipeline.map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 ${rowCls} rounded-2xl`}>
                    <div className={`h-3 w-3 rounded-full shrink-0 ${item.priority==='high'?'bg-rose-500':item.priority==='medium'?'bg-amber-500':'bg-slate-400'}`}></div>
                    <div className="flex-1"><p className={`text-sm font-bold ${txt}`}>{item.task}</p></div>
                    <span className={`shrink-0 text-[13px] font-black ${subtl} uppercase`}>{item.due}</span>
                    <span className={`shrink-0 text-[12px] font-black px-2 py-1 rounded-full uppercase ${item.priority==='high'?'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400':item.priority==='medium'?'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400':'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><CheckCircle className="text-teal-400" size={32} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Google Review Pipeline</h3>
                  <p className="text-slate-400 text-sm">Promoters identified via NPS will appear here for 5-star outreach.</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[13px] font-black">User</div>
                ))}
                <div className="h-10 w-10 rounded-full bg-teal-600 border-2 border-slate-800 flex items-center justify-center text-[13px] font-black">0</div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ MY ACHIEVEMENTS ══════════════════ */}
        {activeTab === 'achievements' && (
          <>
            <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-[2.5rem] p-8 text-white mb-8 flex flex-col md:flex-row items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Trophy size={40} className="text-amber-300" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">My Digital Marketing Achievements</h2>
                <p className="text-teal-100 mt-1 text-sm">Full-funnel Digital Marketing – Social Media – Website Management – Blog Writing – SEO – Paid Ads</p>
                <p className="text-teal-200 text-xs mt-2 italic">Ongoing – Destiny Springs Healthcare</p>
              </div>
              <div className="ml-auto shrink-0 text-right hidden md:block">
                <div className="text-4xl font-black text-amber-300">312</div>
                <div className="text-teal-200 text-xs font-black uppercase">Total Leads Generated</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {myStats.map(s => {
                const pct = Math.min(100, Math.round((s.value / s.target) * 100));
                return (
                  <div key={s.label} className={`${card} p-5 rounded-2xl`}>
                    <div className="flex items-center gap-3 mb-3">
                      <s.icon size={20} className={s.color} />
                      <span className={`text-[13px] font-black uppercase ${subtl} tracking-widest`}>{s.label}</span>
                    </div>
                    <div className={`text-3xl font-black ${txt} mb-1`}>{s.value}</div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className={`text-[12px] ${subtl} mt-1`}>{pct}% of target ({s.target})</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className={`${card} p-8 rounded-[2.5rem]`}>
                <SectionHeader icon={BarChart3} color="text-teal-500" title="Skill Proficiency" subtitle="Digital Marketing Stack" />
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillRadar} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                      <PolarGrid stroke={grid} />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: tick, fontSize: 11, fontWeight: 700 }} />
                      <Radar name="Proficiency" dataKey="score" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} strokeWidth={2} />
                      <Tooltip contentStyle={tipStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`${card} p-8 rounded-[2.5rem]`}>
                <SectionHeader icon={Award} color="text-amber-500" title="Milestone Badges" subtitle="Earned & In Progress" />
                <div className="grid grid-cols-2 gap-3">
                  {milestones.map(m => (
                    <div key={m.title} className={`p-3 rounded-2xl border ${m.earned ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-50'}`}>
                      <m.icon size={16} className={m.earned ? 'text-teal-600 dark:text-teal-400 mb-1.5' : `${subtl} mb-1.5`} />
                      <div className={`text-xs font-black leading-tight ${m.earned ? 'text-teal-900 dark:text-teal-100' : txt}`}>{m.title}</div>
                      <div className={`text-[13px] mt-0.5 ${m.earned ? 'text-teal-600 dark:text-teal-400' : subtl}`}>{m.desc}</div>
                      <div className={`text-[12px] ${subtl} mt-1 uppercase font-bold`}>{m.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={TrendingUp} color="text-teal-500" title="Growth I've Driven Month-Over-Month" subtitle="Sessions, Leads & Reach" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10 }} />
                    <Tooltip contentStyle={tipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: tick }} />
                    <Area type="monotone" dataKey="sessions" fill={darkMode ? '#0d948820' : '#ccfbf1'} stroke="#0d9488" strokeWidth={2} name="Sessions" />
                    <Bar dataKey="leads" fill="#6366f1" radius={[4,4,0,0]} barSize={16} name="Leads" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ CLIENT ROI ══════════════════ */}
        {activeTab === 'roi' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              <StatCard title="Est. Revenue Potential" value="—"      trend={null}         icon={DollarSign} color="bg-teal-600"   sub="Based on avg value / lead"     />
              <StatCard title="Total Mktg Spend"       value="—"      trend={null}          icon={Target}     color="bg-indigo-600" sub="Monthly All Channels"        />
              <StatCard title="Blended ROI"            value="—"      trend={null}          icon={TrendingUp} color="bg-emerald-600" sub="Revenue / Spend Ratio"       />
              <StatCard title="Agency Cost Savings"    value="—"      trend={null}          icon={ShieldCheck} color="bg-amber-600"  sub="vs. Full Agency Retainer"    />
            </div>

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={DollarSign} color="text-teal-500" title="Marketing Spend vs. Revenue Impact" subtitle="6-Month Monthly Comparison" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={roiSpend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10 }} />
                    <Tooltip contentStyle={tipStyle} formatter={(val) => `$${val.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: tick }} />
                    <Bar dataKey="spend"   fill="#6366f1" radius={[6,6,0,0]} barSize={20} name="Spend ($)" />
                    <Area type="monotone" dataKey="revenue" fill={darkMode ? '#0d948820' : '#ccfbf1'} stroke="#0d9488" strokeWidth={3} name="Revenue Potential ($)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={BarChart3} color="text-indigo-500" title="ROI by Channel" subtitle="Leads, Cost-Per-Lead & Return" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-[13px] font-black ${subtl} uppercase tracking-widest border-b ${brd}`}>
                      <th className="text-left pb-3 pr-4">Channel</th>
                      <th className="text-right pb-3 px-4">Leads</th>
                      <th className="text-right pb-3 px-4">Cost Per Lead</th>
                      <th className="text-right pb-3 pl-4">ROI</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divdr}`}>
                    {roiChannels.map(c => (
                      <tr key={c.channel}>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                            <span className={`text-sm font-bold ${txt}`}>{c.channel}</span>
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-right text-sm font-bold ${txt2}`}>{c.leads}</td>
                        <td className={`py-3 px-4 text-right text-sm font-bold ${txt2}`}>{c.cpl}</td>
                        <td className="py-3 pl-4 text-right">
                          <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-black px-3 py-1 rounded-full">{c.roi}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Total Leads x Avg Lead Value',        value: '—',    icon: DollarSign, color: 'text-teal-500',    sub: 'Estimated patient revenue potential' },
                { label: 'Total Marketing Investment',      value: '—',    icon: Target,     color: 'text-indigo-500',  sub: 'Blended spend across all channels'   },
                { label: 'Return on Investment',            value: '—',    icon: TrendingUp, color: 'text-emerald-500', sub: 'Revenue potential / marketing spend'  },
              ].map(s => (
                <div key={s.label} className={`${card} p-6 rounded-2xl text-center`}>
                  <s.icon size={28} className={`${s.color} mx-auto mb-3`} />
                  <div className={`text-3xl font-black ${txt} mb-1`}>{s.value}</div>
                  <div className={`text-[13px] font-black ${muted} uppercase tracking-wider mb-1`}>{s.label}</div>
                  <div className={`text-xs ${subtl} italic`}>{s.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════════════ CONTENT CALENDAR ══════════════════ */}
        {activeTab === 'calendar' && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex gap-2 flex-wrap">
                {calendarTypes.map(f => (
                  <button key={f} onClick={() => setCalFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${calFilter===f ? 'bg-teal-600 text-white shadow-md' : `${card} ${muted} hover:border-teal-400 hover:text-teal-500`}`}>
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddPost(s => !s)}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-black hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/30">
                <Plus size={14} /> Schedule Post
              </button>
            </div>
            {showAddPost && (
              <div className={`${card} p-6 rounded-[2rem] mb-6`} style={{ borderColor: 'rgba(13,148,136,0.35)' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className={`text-base font-black ${txt}`}>Schedule New Content</h3>
                  <button onClick={() => setShowAddPost(false)} className={`${muted} hover:text-rose-500 transition-colors`}><X size={18} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                  {[
                    { label: 'Title',    key: 'title',    type: 'text',   placeholder: 'e.g. Mental Health Awareness Post' },
                    { label: 'Platform', key: 'platform', type: 'select', opts: ['Facebook','Instagram','LinkedIn','TikTok','Mailchimp','Website','TikTok, Instagram','Facebook, LinkedIn','Meta Ads'] },
                    { label: 'Date',     key: 'date',     type: 'text',   placeholder: 'e.g. Mon 24' },
                    { label: 'Type',     key: 'type',     type: 'select', opts: ['Social','Blog','TikTok','Email'] },
                    { label: 'Status',   key: 'status',   type: 'select', opts: ['scheduled','draft','filming','idea'] },
                    { label: 'Notes',    key: 'notes',    type: 'text',   placeholder: 'Brief description or details...' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>{f.label}</label>
                      {f.type === 'select'
                        ? <select value={newPost[f.key]} onChange={e => setNewPost(p => ({...p, [f.key]: e.target.value}))}
                            className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500 transition-colors`}>
                            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        : <input type="text" value={newPost[f.key]} onChange={e => setNewPost(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder}
                            className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-400`} />
                      }
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddPost}
                    className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-black hover:bg-teal-500 transition-all">
                    <Plus size={13} /> Add to Calendar
                  </button>
                  <button onClick={() => setShowAddPost(false)}
                    className={`px-6 py-2.5 ${card} ${muted} rounded-xl text-sm font-black hover:text-teal-500 transition-all border`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              {[
                { label: 'Scheduled',     value: contentItems.filter(c=>c.status==='scheduled').length, color: 'text-teal-500'   },
                { label: 'In Draft',      value: contentItems.filter(c=>c.status==='draft').length,     color: 'text-amber-500'  },
                { label: 'In Production', value: contentItems.filter(c=>c.status==='filming').length,   color: 'text-pink-500'   },
                { label: 'Ideas',         value: contentItems.filter(c=>c.status==='idea').length,      color: 'text-slate-400'  },
              ].map(s => (
                <div key={s.label} className={`${card} p-5 rounded-2xl text-center`}>
                  <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                  <div className={`text-[13px] font-black ${subtl} uppercase tracking-wider mt-1`}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Calendar} color="text-teal-500" title="Content Calendar" subtitle="Upcoming Posts &amp; Deadlines" />
              <div className="space-y-3">
                {filteredContent.map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 ${rowCls} rounded-2xl`}>
                    <div className={`shrink-0 text-center w-12 ${card} px-2 py-1.5 rounded-xl`}>
                      <div className={`text-[13px] font-black uppercase ${subtl}`}>{item.date.split(' ')[0]}</div>
                      <div className={`text-lg font-black ${txt}`}>{item.date.split(' ')[1]}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${txt} truncate`}>{item.title}</p>
                      <p className={`text-[13px] ${muted} font-medium mt-0.5`}>{item.platform}</p>
                    </div>
                    <span className={`shrink-0 text-[13px] font-black px-2 py-1 rounded-full ${typeColor[item.type]||''}`}>{item.type}</span>
                    <span className={`shrink-0 text-[12px] font-black px-2 py-1 rounded-full capitalize ${statusColor[item.status]||''}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ REVIEWS ══════════════════ */}
        {activeTab === 'reviews' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              <StatCard title="Current Rating"  value={_avgRating ? _avgRating + ' ★' : '—'} trend={null} icon={Star} color="bg-amber-500" sub="Google Business Profile" />
              <StatCard title="Total Reviews"   value={_totalReviewCount || '—'} trend={null} icon={MessageSquare} color="bg-teal-600" sub="All Time" />
              <StatCard title="Promoters Ready" value={_reviews.filter(r=>Number(r.rating)>=4).length || '—'} trend={null} icon={ThumbsUp} color="bg-emerald-600" sub="4-5 Star Reviews" />
              <StatCard title="Response Rate"   value={_reviews.length ? _reviews.filter(r=>Number(r.rating)>=4).length+' of '+_reviews.length : '—'} trend={null} icon={Send} color="bg-purple-600" sub="High-Rating Reviews" />
            </div>

            {/* ── Review Score Override — simple manual entry ── */}
            <div className={`${card} p-6 rounded-[2rem] mb-8`}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl"><Star size={16} className="text-amber-500" /></div>
                <div>
                  <p className={`text-sm font-black ${txt}`}>Set Your Review Score</p>
                  <p className={`text-xs ${subtl}`}>Enter your current rating and total review count — KPI cards update instantly</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-wider ${subtl} mb-1`}>Overall Rating (e.g. 4.7)</label>
                  <input
                    type="number" min="1" max="5" step="0.1"
                    placeholder={reviewOverrides.rating || '4.7'}
                    value={reviewOverrideForm.rating}
                    onChange={e => setReviewOverrideForm(f => ({...f, rating: e.target.value}))}
                    className={`px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ${txt} text-sm w-36 focus:outline-none focus:border-amber-400`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-black uppercase tracking-wider ${subtl} mb-1`}>Total Reviews (e.g. 167)</label>
                  <input
                    type="number" min="0"
                    placeholder={reviewOverrides.totalReviews || '167'}
                    value={reviewOverrideForm.totalReviews}
                    onChange={e => setReviewOverrideForm(f => ({...f, totalReviews: e.target.value}))}
                    className={`px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ${txt} text-sm w-36 focus:outline-none focus:border-amber-400`}
                  />
                </div>
                <button
                  onClick={() => {
                    const updated = {
                      ...reviewOverrides,
                      ...(reviewOverrideForm.rating      ? { rating:       reviewOverrideForm.rating }      : {}),
                      ...(reviewOverrideForm.totalReviews ? { totalReviews: reviewOverrideForm.totalReviews } : {}),
                    };
                    setReviewOverrides(updated);
                    localStorage.setItem('dmd_review_overrides', JSON.stringify(updated));
                    setReviewOverrideForm({ rating: '', totalReviews: '' });
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-black rounded-xl transition-all"
                >Save</button>
                {(reviewOverrides.rating || reviewOverrides.totalReviews) && (
                  <div className={`flex items-center gap-3 text-xs ${subtl}`}>
                    {reviewOverrides.rating && <span className="px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-black">Rating: {reviewOverrides.rating} ★</span>}
                    {reviewOverrides.totalReviews && <span className="px-2 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-black">{reviewOverrides.totalReviews} reviews</span>}
                    <button onClick={() => { setReviewOverrides({}); localStorage.removeItem('dmd_review_overrides'); }} className="text-slate-400 hover:text-red-400 transition-all">clear</button>
                  </div>
                )}
              </div>
            </div>

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={TrendingUp} color="text-amber-500" title="Google Rating Trend" subtitle="6-Month Review & Rating Growth" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={reviewTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 11, fontWeight: 700 }} />
                    <YAxis yAxisId="left"  domain={[3,5]}  axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: tick, fontSize: 10 }} />
                    <Tooltip contentStyle={tipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: tick }} />
                    <Area yAxisId="left"  type="monotone" dataKey="rating"  stroke="#f59e0b" fill={darkMode ? '#f59e0b20' : '#fef3c7'} strokeWidth={3} name="Avg Rating"  />
                    <Bar  yAxisId="right" dataKey="reviews" fill="#0d9488"  radius={[4,4,0,0]} barSize={16} name="New Reviews" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className={`${card} p-6 rounded-[2rem]`}>
                <SectionHeader icon={Star} color="text-amber-500" title="Recent Reviews" subtitle="Latest Google Business Reviews" />
                <div className="space-y-4">
                  {recentReviews.map((r, i) => (
                    <div key={i} className={`p-4 ${rowCls} rounded-2xl`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-[13px] font-black text-teal-700 dark:text-teal-300">{r.author[0]}</div>
                          <span className={`text-xs font-black ${txt}`}>{r.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex gap-0.5">
                            {[1,2,3,4,5].map(n => <Star key={n} size={11} className={n<=r.rating?'text-amber-400 fill-amber-400':'text-slate-300 dark:text-slate-600'} />)}
                          </span>
                          <span className={`text-[12px] ${subtl}`}>{r.date}</span>
                        </div>
                      </div>
                      <p className={`text-xs ${txt2} leading-relaxed line-clamp-2`}>{r.text}</p>
                      <div className="flex justify-end mt-2">
                        <span className={`text-[12px] font-black px-2 py-1 rounded-full ${r.responded ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                          {r.responded ? '? Responded' : 'Needs Response'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} p-6 rounded-[2rem]`}>
                <SectionHeader icon={ThumbsUp} color="text-emerald-500" title="Promoter Outreach Pipeline" subtitle="NPS 9–10 Clients Ready for Google Review" />
                <div className="space-y-3">
                  {promoters.map((p, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 ${rowCls} rounded-xl`}>
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-black text-emerald-700 dark:text-emerald-300 shrink-0">{p.name[0]}</div>
                      <div className="flex-1">
                        <div className={`text-sm font-bold ${txt}`}>{p.name}</div>
                        <div className={`text-[13px] ${subtl}`}>NPS Score: {p.nps}/10</div>
                      </div>
                      <span className={`text-[12px] font-black px-2 py-1 rounded-full capitalize ${p.status==='reviewed'?'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400':p.status==='contacted'?'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400':'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-200 dark:border-teal-800">
                  <p className="text-xs font-black text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-1">Goal</p>
                  <p className="text-sm text-teal-600 dark:text-teal-400">Convert all pipeline promoters to 5-star reviews ? Push rating above 4.5 ?</p>
                </div>
              </div>
            </div>

          </>
        )}

        {/* ══════════════════ INTEL ══════════════════ */}
        {activeTab === 'intel' && (() => {
          const newsApiCreds = connections['News API'] || {};
          const _ytLive   = liveData['YouTube Analytics'] || {};
          const _yelpLive = liveData['Yelp Reviews']     || {};
          const presetQueries = [
            'mental health Arizona',
            'Destiny Springs Healthcare',
            'psychiatry Scottsdale AZ',
            'behavioral health Arizona',
          ];
          return (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
                {[
                  { label: 'Tracked URLs',    value: String(savedUrls.length),              color: 'text-teal-500',    icon: Link2 },
                  { label: 'News Loaded',     value: String(newsItems.length),              color: 'text-sky-500',     icon: Newspaper },
                  { label: 'YT Subscribers',  value: _ytLive.subscribers ? Number(_ytLive.subscribers).toLocaleString()  : '—', color: 'text-rose-500',    icon: Youtube },
                  { label: 'Yelp Rating',     value: _yelpLive.rating    ? `${_yelpLive.rating} ★ (${_yelpLive.reviewCount || 0})` : '—', color: 'text-red-500', icon: Building2 },
                ].map(s => (
                  <div key={s.label} className={`${card} p-5 rounded-2xl text-center`}>
                    <s.icon size={22} className={`${s.color} mx-auto mb-2`} />
                    <div className={`text-2xl font-black ${txt} mb-1`}>{s.value}</div>
                    <div className={`text-[12px] font-black ${subtl} uppercase tracking-wider`}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Sub-tab switcher */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  ['news',    <><Newspaper size={12} className="inline mr-1"/>Industry News</>],
                  ['scraper', <><Link2 size={12} className="inline mr-1"/>Page Scraper</>],
                  ['rss',     <><Rss size={12} className="inline mr-1"/>RSS Reader</>],
                ].map(([id, label]) => (
                  <button key={id} onClick={() => setIntelSubTab(id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${intelSubTab===id ? 'bg-teal-600 text-white' : `bg-slate-100 dark:bg-slate-800 ${muted} hover:text-teal-500`}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── News Feed ── */}
              {intelSubTab === 'news' && (
                <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
                  <SectionHeader icon={Newspaper} color="text-sky-500" title="Industry News Feed" subtitle="Real-time news pulled from newsapi.org" />
                  {!newsApiCreds?.apiKey && (
                    <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
                      <Bell size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Connect <strong>News API</strong> on the Integrations tab to auto-load your API key, or fetch using the field below.
                        Free tier at <a href="https://newsapi.org" target="_blank" rel="noreferrer" className="underline">newsapi.org</a>.
                      </p>
                    </div>
                  )}
                  {/* Query bar */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <input
                      className={`flex-1 bg-slate-100 dark:bg-slate-800 ${txt} rounded-xl px-4 py-2.5 text-sm border ${brd} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      value={newsQuery}
                      onChange={e => setNewsQuery(e.target.value)}
                      placeholder="Search query e.g. mental health Arizona…"
                      onKeyDown={e => { if (e.key === 'Enter') fetchNewsItems(newsQuery, newsApiCreds?.apiKey); }}
                    />
                    <button
                      onClick={() => fetchNewsItems(newsQuery, newsApiCreds?.apiKey)}
                      disabled={newsLoading}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-black flex items-center gap-2 disabled:opacity-50"
                    >
                      {newsLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                      {newsLoading ? 'Fetching…' : 'Fetch News'}
                    </button>
                  </div>
                  {/* Preset queries */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {presetQueries.map(q => (
                      <button key={q} onClick={() => { setNewsQuery(q); fetchNewsItems(q, newsApiCreds?.apiKey); }}
                        className={`text-xs px-3 py-1 rounded-full border ${brd} ${muted} hover:border-teal-500 hover:text-teal-500 transition-colors`}>{q}</button>
                    ))}
                  </div>
                  {newsError && <p className="text-rose-500 text-sm mb-4">{newsError}</p>}
                  {/* Articles grid */}
                  {newsItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {newsItems.map((article, i) => (
                        <a key={i} href={article.url} target="_blank" rel="noreferrer"
                          className={`group block ${card} p-0 rounded-2xl overflow-hidden hover:ring-2 hover:ring-teal-500 transition-all`}>
                          {article.urlToImage && (
                            <img src={article.urlToImage} alt="" className="w-full h-36 object-cover" onError={e => e.currentTarget.style.display='none'} />
                          )}
                          <div className="p-4">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className={`text-[11px] font-black px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400`}>{article.source}</span>
                              <span className={`text-[11px] ${subtl}`}>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
                            </div>
                            <p className={`text-sm font-black ${txt} mb-1 line-clamp-2 group-hover:text-teal-500 transition-colors`}>{article.title}</p>
                            {article.description && <p className={`text-xs ${subtl} line-clamp-2`}>{article.description}</p>}
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    !newsLoading && (
                      <div className="text-center py-12">
                        <Newspaper size={36} className={`${subtl} mx-auto mb-3`} />
                        <p className={`text-sm ${muted}`}>Click <strong>Fetch News</strong> or choose a preset query above to load articles.</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ── Web Page Scraper ── */}
              {intelSubTab === 'scraper' && (
                <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
                  <SectionHeader icon={Link2} color="text-teal-500" title="Page Intelligence Scraper" subtitle="Extract metadata, headings, contacts & SEO signals from any URL" />
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                      className={`flex-1 bg-slate-100 dark:bg-slate-800 ${txt} rounded-xl px-4 py-2.5 text-sm border ${brd} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      value={scraperUrl}
                      onChange={e => setScraperUrl(e.target.value)}
                      placeholder="https://competitor.com or https://destinyspringshealthcare.com"
                      onKeyDown={e => { if (e.key === 'Enter') fetchScrapeUrl(scraperUrl); }}
                    />
                    <button
                      onClick={() => fetchScrapeUrl(scraperUrl)}
                      disabled={scraperLoading || !scraperUrl}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-black flex items-center gap-2 disabled:opacity-50"
                    >
                      {scraperLoading ? <RefreshCw size={14} className="animate-spin" /> : <Globe size={14} />}
                      {scraperLoading ? 'Scraping…' : 'Analyze Page'}
                    </button>
                    {scraperResult && (
                      <button onClick={() => saveTrackedUrl(scraperUrl, scraperResult?.title)}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors flex items-center gap-1">
                        <Plus size={12} /> Track URL
                      </button>
                    )}
                  </div>
                  {scraperError && <p className="text-rose-500 text-sm mb-4">{scraperError}</p>}
                  {scraperResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                      {/* Main info */}
                      <div className="space-y-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                          <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-1`}>Page Title</p>
                          <p className={`font-black text-sm ${txt}`}>{scraperResult.title || '—'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                          <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-1`}>Meta Description</p>
                          <p className={`text-sm ${txt2}`}>{scraperResult.description || '—'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                          <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-1`}>H1 Heading</p>
                          <p className={`font-black text-sm text-teal-600 dark:text-teal-400`}>{scraperResult.h1 || '—'}</p>
                        </div>
                        {scraperResult.h2s?.length > 0 && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-2`}>H2 Headings</p>
                            <ul className="space-y-1">
                              {scraperResult.h2s.map((h, i) => <li key={i} className={`text-sm ${txt2}`}>• {h}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                      {/* Contacts + stats */}
                      <div className="space-y-3">
                        {scraperResult.phones?.length > 0 && (
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                            <p className={`text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2`}>Phone Numbers Found</p>
                            {scraperResult.phones.map((p, i) => <p key={i} className="text-sm font-black text-emerald-700 dark:text-emerald-300">{p}</p>)}
                          </div>
                        )}
                        {scraperResult.emails?.length > 0 && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl">
                            <p className={`text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2`}>Emails Found</p>
                            {scraperResult.emails.map((e, i) => <p key={i} className="text-sm font-mono text-blue-700 dark:text-blue-300">{e}</p>)}
                          </div>
                        )}
                        {scraperResult.image && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-2`}>OG Image</p>
                            <img src={scraperResult.image} alt="OG Preview" className="w-full h-32 object-cover rounded-xl" onError={e => e.currentTarget.style.display='none'} />
                          </div>
                        )}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex gap-4">
                          <div className="text-center flex-1">
                            <p className={`text-xl font-black ${txt}`}>{scraperResult.wordCount?.toLocaleString() || 0}</p>
                            <p className={`text-[11px] ${subtl}`}>Word Count</p>
                          </div>
                          <div className={`w-px bg-slate-200 dark:bg-slate-700`}></div>
                          <div className="text-center flex-1">
                            <p className={`text-xl font-black ${txt}`}>{scraperResult.phones?.length || 0}</p>
                            <p className={`text-[11px] ${subtl}`}>Phones</p>
                          </div>
                          <div className={`w-px bg-slate-200 dark:bg-slate-700`}></div>
                          <div className="text-center flex-1">
                            <p className={`text-xl font-black ${txt}`}>{scraperResult.emails?.length || 0}</p>
                            <p className={`text-[11px] ${subtl}`}>Emails</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Saved / tracked URLs */}
                  {savedUrls.length > 0 && (
                    <div>
                      <p className={`text-[12px] font-black ${subtl} uppercase tracking-wider mb-3`}>Tracked Pages</p>
                      <div className="space-y-2">
                        {savedUrls.map((u, i) => (
                          <div key={i} className={`flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border ${brd}`}>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-black ${txt} truncate`}>{u.label}</p>
                              <p className={`text-[11px] ${subtl} truncate`}>{u.url}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => { setScraperUrl(u.url); fetchScrapeUrl(u.url); }} className="text-teal-500 hover:text-teal-400 text-xs font-black flex items-center gap-1">
                                <RefreshCw size={10} /> Re-scan
                              </button>
                              <button onClick={() => removeTrackedUrl(u.url)} className="text-rose-400 hover:text-rose-300 text-xs font-black flex items-center gap-1">
                                <X size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── RSS Reader ── */}
              {intelSubTab === 'rss' && (
                <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
                  <SectionHeader icon={Rss} color="text-orange-500" title="RSS / Atom Feed Reader" subtitle="Pull blog posts and updates from any RSS or Atom feed URL" />
                  <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <input
                      className={`flex-1 bg-slate-100 dark:bg-slate-800 ${txt} rounded-xl px-4 py-2.5 text-sm border ${brd} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      value={rssFeedUrl}
                      onChange={e => setRssFeedUrl(e.target.value)}
                      placeholder="https://competitor.com/feed or https://nami.org/feed/"
                      onKeyDown={e => { if (e.key === 'Enter') fetchRssFeed(rssFeedUrl); }}
                    />
                    <button
                      onClick={() => fetchRssFeed(rssFeedUrl)}
                      disabled={rssLoading || !rssFeedUrl}
                      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-black flex items-center gap-2 disabled:opacity-50"
                    >
                      {rssLoading ? <RefreshCw size={14} className="animate-spin" /> : <Rss size={14} />}
                      {rssLoading ? 'Fetching…' : 'Load Feed'}
                    </button>
                  </div>
                  {/* Preset feeds */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { label: 'NAMI Blog',       url: 'https://www.nami.org/blog/feed/' },
                      { label: 'Psychology Today', url: 'https://www.psychologytoday.com/us/rss.xml' },
                      { label: 'Behavioral Health News', url: 'https://bhbusiness.com/feed/' },
                    ].map(f => (
                      <button key={f.label} onClick={() => { setRssFeedUrl(f.url); fetchRssFeed(f.url); }}
                        className={`text-xs px-3 py-1 rounded-full border ${brd} ${muted} hover:border-orange-500 hover:text-orange-500 transition-colors`}>{f.label}</button>
                    ))}
                  </div>
                  {rssError && <p className="text-rose-500 text-sm mb-4">{rssError}</p>}
                  {rssItems.length > 0 ? (
                    <div className="space-y-3">
                      {rssItems.map((item, i) => (
                        <a key={i} href={item.link} target="_blank" rel="noreferrer"
                          className={`group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border ${brd} hover:border-orange-400 transition-all`}>
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Rss size={14} className="text-orange-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`font-black text-sm ${txt} group-hover:text-orange-500 transition-colors line-clamp-2`}>{item.title}</p>
                            {item.description && <p className={`text-xs ${subtl} mt-1 line-clamp-2`}>{item.description}</p>}
                            {item.pubDate && <p className={`text-[11px] text-slate-400 dark:text-slate-500 mt-1`}>{new Date(item.pubDate).toLocaleDateString()}</p>}
                          </div>
                          <ExternalLink size={13} className={`${subtl} flex-shrink-0 mt-1 group-hover:text-orange-500 transition-colors`} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    !rssLoading && (
                      <div className="text-center py-12">
                        <Rss size={36} className={`${subtl} mx-auto mb-3`} />
                        <p className={`text-sm ${muted}`}>Enter an RSS feed URL or pick a preset above to load articles.</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* YouTube + Yelp live data cards */}
              {(_ytLive.channelName || _yelpLive.name) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  {_ytLive.channelName && (
                    <div className={`${card} p-5 rounded-2xl`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20"><Youtube size={18} className="text-rose-500" /></div>
                        <div>
                          <p className={`font-black text-sm ${txt}`}>{_ytLive.channelName}</p>
                          <p className={`text-xs ${subtl}`}>YouTube Channel</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: 'Subscribers', value: Number(_ytLive.subscribers  || 0).toLocaleString() },
                          { label: 'Total Views',  value: Number(_ytLive.totalViews   || 0).toLocaleString() },
                          { label: 'Videos',       value: Number(_ytLive.videoCount   || 0).toLocaleString() },
                        ].map(s => (
                          <div key={s.label} className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <p className={`text-base font-black ${txt}`}>{s.value}</p>
                            <p className={`text-[11px] ${subtl}`}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                      {_ytLive.recentVideos?.length > 0 && (
                        <>
                          <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-2`}>Recent Videos</p>
                          <div className="space-y-2">
                            {_ytLive.recentVideos.slice(0,3).map((v, i) => (
                              <div key={i} className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50`}>
                                {v.thumbnail && <img src={v.thumbnail} alt="" className="w-10 h-7 object-cover rounded-lg flex-shrink-0" />}
                                <div className="min-w-0 flex-1">
                                  <p className={`text-xs font-black ${txt} truncate`}>{v.title}</p>
                                  <p className={`text-[11px] ${subtl}`}>{Number(v.views||0).toLocaleString()} views · {Number(v.likes||0).toLocaleString()} likes</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {_yelpLive.name && (
                    <div className={`${card} p-5 rounded-2xl`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20"><Building2 size={18} className="text-red-500" /></div>
                        <div>
                          <p className={`font-black text-sm ${txt}`}>{_yelpLive.name}</p>
                          <p className={`text-xs ${subtl}`}>{_yelpLive.categories}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <p className="text-2xl font-black text-amber-500">{_yelpLive.rating}</p>
                          <p className={`text-[11px] ${subtl}`}>Yelp Rating</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <p className={`text-2xl font-black ${txt}`}>{Number(_yelpLive.reviewCount||0).toLocaleString()}</p>
                          <p className={`text-[11px] ${subtl}`}>Reviews</p>
                        </div>
                      </div>
                      {_yelpLive.address && <p className={`text-xs ${subtl}`}>📍 {_yelpLive.address}</p>}
                      {_yelpLive.phone   && <p className={`text-xs ${subtl} mt-1`}>📞 {_yelpLive.phone}</p>}
                      {_yelpLive.url && (
                        <a href={_yelpLive.url} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-400 font-black">
                          <ExternalLink size={11} /> View on Yelp
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          );
        })()}

        {/* ══════════════════ INTEGRATIONS ══════════════════ */}
        {activeTab === 'integrations' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className={`${card} p-5 rounded-2xl text-center`}>
                <div className="text-3xl font-black text-teal-500 mb-1">{integrations.filter(i=>i.connected).length}</div>
                <div className={`text-[13px] font-black ${subtl} uppercase tracking-wider`}>Active Integrations</div>
              </div>
              <div className={`${card} p-5 rounded-2xl text-center`}>
                <div className="text-3xl font-black text-amber-500 mb-1">{integrations.filter(i=>!i.connected).length}</div>
                <div className={`text-[13px] font-black ${subtl} uppercase tracking-wider`}>Pending Setup</div>
              </div>
              <div className={`${card} p-5 rounded-2xl text-center`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-3xl font-black text-emerald-500">Live</span>
                </div>
                <div className={`text-[13px] font-black ${subtl} uppercase tracking-wider`}>All Active Feeds</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {integrations.map(intg => (
                <div key={intg.name} className={`${card} p-5 rounded-[1.5rem] ${!intg.connected ? 'opacity-70' : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${intg.connected ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <intg.icon size={18} className={intg.connected ? intg.color : subtl} />
                      </div>
                      <div className="min-w-0">
                        <div className={`font-black text-sm truncate ${txt}`}>{intg.name}</div>
                        <div className={`text-[12px] truncate ${subtl}`}>{intg.sub}</div>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-full whitespace-nowrap ${intg.connected ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                      {intg.connected ? <RefreshCw size={10} /> : <WifiOff size={10} />}
                      {intg.connected ? 'Connected' : 'Setup Required'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(intg.connected && liveData[intg.name] && Object.keys(liveData[intg.name]).filter(k => !['id','name'].includes(k)).length > 0)
                      ? Object.entries(liveData[intg.name])
                          .filter(([k]) => !['id', 'name'].includes(k))
                          .slice(0, 4)
                          .map(([k, v]) => (
                            <span key={k} className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                              {k.replace(/_/g,' ')}: <strong>{String(v)}</strong>
                            </span>
                          ))
                      : intg.metrics.map(m => (
                          <span key={m} className={`text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 ${intg.connected ? 'text-teal-600 dark:text-teal-400' : subtl}`}>{m}</span>
                        ))
                    }
                  </div>
                  <div className={`flex items-center justify-between text-[12px] ${subtl} border-t ${brd} pt-3`}>
                    <span className="truncate mr-2">Last sync: {intg.lastSync}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {intg.connected && (
                        <button onClick={() => disconnectIntegration(intg.name)} className="text-rose-400 hover:text-rose-300 font-black flex items-center gap-1 text-[11px]">
                          <WifiOff size={10} /> Disconnect
                        </button>
                      )}
                      {intg.connected
                        ? <button onClick={() => syncIntegrationWithCreds(intg.name, connections[intg.name])} className="text-teal-500 hover:text-teal-400 font-black flex items-center gap-1">
                            {syncStatus[intg.name] === 'syncing'
                              ? <RefreshCw size={10} className="animate-spin" />
                              : syncStatus[intg.name] === 'error'
                              ? <X size={10} className="text-rose-500" />
                              : <RefreshCw size={10} />}
                            {syncStatus[intg.name] === 'syncing' ? 'Syncing…' : syncStatus[intg.name] === 'error' ? 'Retry' : 'Sync Now'}
                          </button>
                        : <button onClick={() => { setConnectModal(intg.name); setConnectFormData(connections[intg.name] || {}); setConnectError(null); }} className="text-amber-500 hover:text-amber-400 font-black flex items-center gap-1">
                            <Plug size={10} /> Connect
                          </button>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem]`}>
              <SectionHeader icon={Plug} color="text-teal-500" title="Integration Setup Guide" subtitle="Steps to connect remaining platforms" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  { name: 'Meta Ads Manager',    icon: Megaphone,  step: 'Meta Business Manager ? Apps ? Generate API token ? Add to .env as VITE_META_ADS_TOKEN'  },
                  { name: 'TikTok for Business', icon: PlayCircle, step: 'Apply for TikTok Business API ? Create App ? Get access token ? Add as VITE_TIKTOK_TOKEN' },
                ].map(g => (
                  <div key={g.name} className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <g.icon size={15} className="text-amber-500" />
                      <span className="text-sm font-black text-amber-700 dark:text-amber-300">{g.name}</span>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">{g.step}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl">
                <p className="text-xs font-black text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-1">Note</p>
                <p className="text-sm text-teal-600 dark:text-teal-400 leading-relaxed">All active integrations pull live data via their respective APIs, refreshing every 5–30 min depending on rate limits. Contact your developer to update API keys in the environment config.</p>
              </div>
            </div>
          </>
        )}

        {/* ------------------ DATA IMPORT ------------------ */}
        {activeTab === 'import' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              {[
                { label: 'Data Sources',   value: String(integrations.length),                                                                               color: 'text-teal-500',    icon: Plug      },
                { label: 'Auto Syncing',   value: String(integrations.filter(i=>i.connected).length),                                                        color: 'text-emerald-500', icon: RefreshCw },
                { label: 'Pending Setup',  value: String(integrations.filter(i=>!i.connected).length),                                                       color: 'text-amber-500',   icon: Clock     },
                { label: 'Manual Entries', value: String(Object.values(manualData).reduce((s,a)=>s+(Array.isArray(a)?a.length:0),0)),                        color: 'text-purple-500',  icon: Upload    },
              ].map(s => (
                <div key={s.label} className={`${card} p-5 rounded-2xl text-center`}>
                  <s.icon size={22} className={`${s.color} mx-auto mb-2`} />
                  <div className={`text-3xl font-black ${txt} mb-1`}>{s.value}</div>
                  <div className={`text-[13px] font-black ${subtl} uppercase tracking-wider`}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Upload} color="text-teal-500" title="Import Data" subtitle="Upload files, paste CSV, or enter data manually" />
              <div className="flex gap-2 mb-6">
                {[
                  ['upload',   <><Upload size={12} className="inline mr-1" />File Upload</>],
                  ['paste',    <><FileText size={12} className="inline mr-1" />Paste CSV</>],
                  ['manual',   <><Pencil size={12} className="inline mr-1" />Manual Entry</>],
                ].map(([m, label]) => (
                  <button key={m} onClick={() => setImportMode(m)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${importMode===m ? 'bg-teal-600 text-white' : `bg-slate-100 dark:bg-slate-800 ${muted} hover:text-teal-500`}`}>
                    {label}
                  </button>
                ))}
              </div>

              {importMode === 'upload' && (
                <>
                {importNotice && (
                  <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-sm text-teal-700 dark:text-teal-300 font-medium flex items-center justify-between">
                    <span>{importNotice}</span>
                    <button onClick={() => setImportNotice('')} className="ml-3 text-teal-500 hover:text-teal-700"><X size={14} /></button>
                  </div>
                )}
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center hover:border-teal-500 dark:hover:border-teal-500 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
                >
                  <Upload size={36} className={`${muted} group-hover:text-teal-500 mx-auto mb-3 transition-colors`} />
                  <p className={`text-sm font-black ${txt} mb-1`}>Drop your CSV, XLSX, or JSON file here</p>
                  <p className={`text-xs ${subtl} mb-5`}>Supports Google Analytics exports, Meta Business Suite, Mailchimp CSV, and any standard format</p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.json,.txt"
                    className="hidden"
                    onChange={e => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); e.target.value = ''; }}
                  />
                  <button
                    className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-black hover:bg-teal-500 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >Browse Files</button>
                    <button className={`px-6 py-2.5 ${card} ${muted} rounded-xl text-sm font-black border hover:text-teal-500 transition-all`}><Download size={13} className="inline mr-1.5" />Download Template</button>
                  </div>
                  <div className="flex gap-2 justify-center mt-5 flex-wrap">
                    {['Google Analytics', 'Meta Business', 'Mailchimp', 'Google Ads', 'TikTok', 'Generic CSV'].map(fmt => (
                      <span key={fmt} className={`text-[13px] font-black px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 ${muted}`}>{fmt}</span>
                    ))}
                  </div>
                </div>
                </>
              )}

              {importMode === 'paste' && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className={`text-xs font-black ${muted} uppercase tracking-wider`}>Paste CSV or JSON Data</label>
                    <select value={pasteDataType} onChange={e => setPasteDataType(e.target.value)} className={`text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${txt} focus:outline-none`}>
                      {['Social Metrics','SEO Rankings','Ad Spend','Email Stats','Reviews'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <textarea value={pasteCSV} onChange={e => setPasteCSV(e.target.value)} className={`w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} font-mono h-44 resize-none focus:outline-none focus:border-teal-500 mb-4`}
                    placeholder={'month,sessions,leads,reach\nJan,1200,45,8500\nFeb,1350,52,9200\nMar,1580,61,10400'} />
                  <button onClick={() => parseCSVText(pasteCSV, pasteDataType)} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-black hover:bg-teal-500 transition-all">Parse &amp; Import</button>
                </div>
              )}

              {importMode === 'manual' && (
                <div>
                  <div className="flex gap-2 mb-5 flex-wrap">
                    {['TikTok Posts','Social Metrics','SEO Rankings','Ad Spend','Email Stats','Reviews'].map(dt => (
                      <button key={dt} onClick={() => setImportDataType(dt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${importDataType===dt ? 'bg-teal-600 text-white' : `bg-slate-100 dark:bg-slate-800 ${muted} hover:text-teal-500`}`}>
                        {dt}
                      </button>
                    ))}
                  </div>
                  {importDataType === 'TikTok Posts' && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { key: 'title',    label: 'Video Title',           type: 'text',   ph: 'e.g. 5 Signs You Need Support' },
                          { key: 'date',     label: 'Post Date',             type: 'date'   },
                          { key: 'views',    label: 'Video Views',           type: 'number', ph: '0' },
                          { key: 'likes',    label: 'Likes',                 type: 'number', ph: '0' },
                          { key: 'comments', label: 'Comments',              type: 'number', ph: '0' },
                          { key: 'shares',   label: 'Shares',                type: 'number', ph: '0' },
                          { key: 'watchTime',label: 'Avg Watch Time (sec)',  type: 'number', ph: '0' },
                          { key: 'followers',label: 'Followers (current)',   type: 'number', ph: '0' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>{f.label}</label>
                            <input
                              type={f.type}
                              placeholder={f.ph || ''}
                              value={manualForm[f.key] || ''}
                              onChange={e => setManualForm(p => ({ ...p, [f.key]: e.target.value }))}
                              className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500`}
                            />
                          </div>
                        ))}
                      </div>
                      {/* Saved entries table */}
                      {(manualData['tiktok_posts'] || []).length > 0 && (
                        <div className="mt-6">
                          <p className={`text-[13px] font-black ${muted} uppercase tracking-wider mb-3`}>Saved Posts ({manualData['tiktok_posts'].length})</p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                              <thead>
                                <tr className={`border-b ${brd}`}>
                                  {['Title','Date','Views','Likes','Comments','Shares'].map(h => (
                                    <th key={h} className={`text-left pb-2 font-black ${muted} uppercase tracking-wider pr-4`}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className={`divide-y ${divdr}`}>
                                {[...(manualData['tiktok_posts'] || [])].reverse().slice(0, 10).map((e, i) => (
                                  <tr key={i} className={rowCls}>
                                    <td className={`py-2 pr-4 font-bold ${txt} max-w-[140px] truncate`}>{e.title || '—'}</td>
                                    <td className={`py-2 pr-4 ${txt2}`}>{e.date || '—'}</td>
                                    <td className={`py-2 pr-4 font-black text-teal-500`}>{Number(e.views || 0).toLocaleString()}</td>
                                    <td className={`py-2 pr-4 ${txt2}`}>{Number(e.likes || 0).toLocaleString()}</td>
                                    <td className={`py-2 pr-4 ${txt2}`}>{Number(e.comments || 0).toLocaleString()}</td>
                                    <td className={`py-2 pr-4 ${txt2}`}>{Number(e.shares || 0).toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {importDataType === 'Social Metrics' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { key: 'platform',    label: 'Platform',          type: 'select', opts: ['Facebook','Instagram','LinkedIn','TikTok','Twitter/X'] },
                        { key: 'month',       label: 'Reporting Month',   type: 'month'  },
                        { key: 'followers',   label: 'Followers',         type: 'number', ph: '0' },
                        { key: 'reach',       label: 'Monthly Reach',     type: 'number', ph: '0' },
                        { key: 'impressions', label: 'Impressions',       type: 'number', ph: '0' },
                        { key: 'engagement',  label: 'Engagement Rate %', type: 'number', ph: '0.0' },
                        { key: 'clicks',      label: 'Link Clicks',       type: 'number', ph: '0' },
                        { key: 'posts',       label: 'Posts Published',   type: 'number', ph: '0' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>{f.label}</label>
                          {f.type === 'select'
                            ? <select value={manualForm[f.key]||''} onChange={e=>setManualForm(p=>({...p,[f.key]:e.target.value}))} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500`}><option value="">Select...</option>{f.opts.map(o=><option key={o}>{o}</option>)}</select>
                            : <input type={f.type} placeholder={f.ph||''} value={manualForm[f.key]||''} onChange={e=>setManualForm(p=>({...p,[f.key]:e.target.value}))} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500`} />
                          }
                        </div>
                      ))}
                    </div>
                  )}
                  {importDataType === 'SEO Rankings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { key: 'keyword',     label: 'Keyword',            type: 'text',   ph: 'e.g. healthcare Arizona' },
                        { key: 'rank',        label: 'Current Rank',       type: 'number', ph: '1-100' },
                        { key: 'prevRank',    label: 'Previous Rank',      type: 'number', ph: '1-100' },
                        { key: 'searchVol',   label: 'Monthly Search Vol', type: 'number', ph: '0' },
                        { key: 'impressions', label: 'Impressions',        type: 'number', ph: '0' },
                        { key: 'clicks',      label: 'Clicks',             type: 'number', ph: '0' },
                        { key: 'ctr',         label: 'CTR %',              type: 'number', ph: '0.0' },
                        { key: 'month',       label: 'Reporting Month',    type: 'month'  },
                      ].map(f => (
                        <div key={f.key}>
                          <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>{f.label}</label>
                          <input type={f.type} placeholder={f.ph||''} value={manualForm[f.key]||''} onChange={e=>setManualForm(p=>({...p,[f.key]:e.target.value}))} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500`} />
                        </div>
                      ))}
                    </div>
                  )}
                  {importDataType === 'Ad Spend' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { key: 'platform',    label: 'Ad Platform',         type: 'select', opts: ['Google Ads','Meta Ads','LinkedIn Ads','TikTok Ads'] },
                        { key: 'month',       label: 'Reporting Month',     type: 'month'  },
                        { key: 'spend',       label: 'Total Spend ($)',      type: 'number', ph: '0.00' },
                        { key: 'impressions', label: 'Impressions',         type: 'number', ph: '0' },
                        { key: 'clicks',      label: 'Clicks',              type: 'number', ph: '0' },
                        { key: 'leads',       label: 'Conversions / Leads', type: 'number', ph: '0' },
                        { key: 'cpl',         label: 'Cost Per Lead ($)',    type: 'number', ph: '0.00' },
                        { key: 'roas',        label: 'ROAS',                type: 'number', ph: '0.0' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>{f.label}</label>
                          {f.type === 'select'
                            ? <select value={manualForm[f.key]||''} onChange={e=>setManualForm(p=>({...p,[f.key]:e.target.value}))} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500`}><option value="">Select...</option>{f.opts.map(o=><option key={o}>{o}</option>)}</select>
                            : <input type={f.type} placeholder={f.ph||''} value={manualForm[f.key]||''} onChange={e=>setManualForm(p=>({...p,[f.key]:e.target.value}))} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500`} />
                          }
                        </div>
                      ))}
                    </div>
                  )}
                  {importDataType === 'Email Stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { key: 'campaign',    label: 'Campaign Name',      type: 'text',   ph: 'e.g. April Newsletter' },
                        { key: 'date',        label: 'Send Date',          type: 'date'   },
                        { key: 'sent',        label: 'Total Sent',         type: 'number', ph: '0' },
                        { key: 'opened',      label: 'Opened',             type: 'number', ph: '0' },
                        { key: 'clicked',     label: 'Clicked',            type: 'number', ph: '0' },
                        { key: 'unsub',       label: 'Unsubscribed',       type: 'number', ph: '0' },
                        { key: 'conversions', label: 'Conversions',        type: 'number', ph: '0' },
                        { key: 'revenue',     label: 'Revenue Attributed', type: 'number', ph: '0.00' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>{f.label}</label>
                          <input type={f.type} placeholder={f.ph||''} value={manualForm[f.key]||''} onChange={e=>setManualForm(p=>({...p,[f.key]:e.target.value}))} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500`} />
                        </div>
                      ))}
                    </div>
                  )}
                  {importDataType === 'Reviews' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'name',     label: 'Reviewer Name', type: 'text',     ph: 'e.g. J. Smith', half: false },
                        { key: 'rating',   label: 'Rating (1-5)',  type: 'number',   ph: '5', half: false },
                        { key: 'date',     label: 'Review Date',   type: 'date',     half: false },
                        { key: 'platform', label: 'Platform',      type: 'select',   opts: ['Google','Yelp','Healthgrades','Facebook'], half: false },
                        { key: 'text',     label: 'Review Text',   type: 'textarea', ph: 'Paste review content here...', half: true },
                      ].map(f => (
                        <div key={f.key} className={f.half ? 'md:col-span-2' : ''}>
                          <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>{f.label}</label>
                          {f.type === 'select'
                            ? <select value={manualForm[f.key]||''} onChange={e=>setManualForm(p=>({...p,[f.key]:e.target.value}))} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500`}><option value={''}>Select...</option>{f.opts.map(o=><option key={o}>{o}</option>)}</select>
                            : f.type === 'textarea'
                            ? <textarea placeholder={f.ph} value={manualForm[f.key]||''} onChange={e=>setManualForm(p=>({...p,[f.key]:e.target.value}))} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} h-24 resize-none focus:outline-none focus:border-teal-500`} />
                            : <input type={f.type} placeholder={f.ph||''} value={manualForm[f.key]||''} onChange={e=>setManualForm(p=>({...p,[f.key]:e.target.value}))} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500`} />
                          }
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => saveManualEntry(importDataType)}
                    className="mt-5 flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-black hover:bg-teal-500 transition-all">
                    <Plus size={13} /> Save Entry
                  </button>
                </div>
              )}
            </div>

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Zap} color="text-amber-500" title="Automation Feeds" subtitle="Live data flowing in from connected integrations" />
              <div className="space-y-3">
                {integrations.map(feed => (
                  <div key={feed.name} className={`flex items-center gap-4 p-4 ${rowCls} rounded-2xl`}>
                    <div className={`p-2.5 rounded-xl shrink-0 ${feed.connected ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <feed.icon size={15} className={feed.connected ? feed.color : subtl} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${txt}`}>{feed.name}</p>
                      <p className={`text-[13px] ${subtl} truncate`}>
                        {feed.connected
                          ? (liveData[feed.name] && Object.keys(liveData[feed.name]).filter(k=>!['id','name','connected','lastSync','accessToken','openId','clientId','apiKey','apiSecret','pageId','placeId'].includes(k)).length > 0
                            ? Object.entries(liveData[feed.name]).filter(([k])=>!['id','name','connected','lastSync','accessToken','openId','clientId','apiKey','apiSecret','pageId','placeId'].includes(k)).slice(0,3).map(([k,v])=>`${k.replace(/_/g,' ')}: ${v}`).join(' · ')
                            : `Last synced ${connections[feed.name]?.lastSync || '—'}`)
                          : feed.metrics.join(', ')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {feed.connected
                        ? <span className="text-[12px] font-black px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> Connected</span>
                        : <button
                            onClick={() => { setConnectModal(feed.name); setConnectFormData(connections[feed.name] || {}); setConnectError(null); setActiveTab('integrations'); }}
                            className="text-[12px] font-black px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                          >Set Up →</button>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem]`}>
              <SectionHeader icon={Clock} color="text-slate-500" title="Import History" subtitle="Recent uploads and manual data entries" />
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Download size={36} className={`${subtl} mb-3`} />
                <p className={`text-sm font-bold ${txt} mb-1`}>No imports yet</p>
                <p className={`text-xs ${subtl} max-w-sm`}>Your data import history will appear here once you begin uploading files or entering data manually above.</p>
              </div>
            </div>
          </>
        )}

        {/* ------------------ AI TOOLS ------------------ */}
        {activeTab === 'ai-tools' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Sintra AI */}
              <div className={`${card} p-8 rounded-[2.5rem]`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shrink-0">
                    <Bot size={28} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-black ${txt}`}>Sintra AI</h3>
                    <p className={`text-xs ${subtl}`}>AI Marketing Automation Platform</p>
                  </div>
                  <span className="shrink-0 text-[13px] font-black px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">Connect Required</span>
                </div>
                <p className={`text-sm ${txt2} leading-relaxed mb-5`}>Sintra AI automates your digital marketing workflows – from social post generation to SEO optimization and ad copy. Connect your account to sync campaign data and run AI-powered automations directly from this dashboard.</p>
                <div className="space-y-2 mb-6">
                  {[
                    'Automated social media post generation',
                    'AI-powered SEO content briefs',
                    'Campaign performance insights & recommendations',
                    'Multi-platform publishing automation',
                    'Marketing workflow automation & scheduling',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-teal-500 shrink-0" />
                      <span className={`text-xs font-medium ${txt2}`}>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <a href="https://sintra.ai" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-black hover:bg-purple-500 transition-all">
                    <ExternalLink size={13} /> Open Sintra AI
                  </a>
                  <button className={`flex items-center gap-2 px-5 py-2.5 ${card} ${muted} rounded-xl text-sm font-black hover:text-teal-500 transition-all border`}>
                    <Plug size={13} /> Configure API
                  </button>
                </div>
              </div>

              {/* MarkyAI */}
              <div className={`${card} p-8 rounded-[2.5rem]`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center shadow-lg shrink-0">
                    <Zap size={28} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-black ${txt}`}>MarkyAI</h3>
                    <p className={`text-xs ${subtl}`}>AI Content Creation &amp; Social Scheduling</p>
                  </div>
                  <span className="shrink-0 text-[13px] font-black px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">Connect Required</span>
                </div>
                <p className={`text-sm ${txt2} leading-relaxed mb-5`}>MarkyAI generates high-quality marketing content including social posts, captions, hashtags, and ad copy. Connect to automate your content calendar and push performance data directly into this dashboard.</p>
                <div className="space-y-2 mb-6">
                  {[
                    'AI caption & hashtag generation for all platforms',
                    'Brand-voice trained content templates',
                    'Healthcare-compliant content guidelines',
                    'Bulk content schedule & approval workflow',
                    'Performance feedback loop & content scoring',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-teal-500 shrink-0" />
                      <span className={`text-xs font-medium ${txt2}`}>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <a href="https://marky.ai" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-black hover:bg-pink-500 transition-all">
                    <ExternalLink size={13} /> Open MarkyAI
                  </a>
                  <button className={`flex items-center gap-2 px-5 py-2.5 ${card} ${muted} rounded-xl text-sm font-black hover:text-teal-500 transition-all border`}>
                    <Plug size={13} /> Configure API
                  </button>
                </div>
              </div>
            </div>

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Bot} color="text-purple-500" title="AI Content Generator" subtitle="Generate healthcare marketing content for any platform and tone" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>Content Type</label>
                  <select value={aiContentType} onChange={e => setAiContentType(e.target.value)} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-purple-500`}>
                    {['Social Post','Blog Brief','Email Subject Line','Ad Copy','TikTok Script','Caption + Hashtags'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>Platform</label>
                  <select value={aiPlatform} onChange={e => setAiPlatform(e.target.value)} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-purple-500`}>
                    {['Facebook','Instagram','LinkedIn','TikTok','Email','Website Blog'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>Tone</label>
                  <select value={aiTone} onChange={e => setAiTone(e.target.value)} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-purple-500`}>
                    {['Professional','Empathetic','Informational','Motivational','Conversational','Urgent'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-5">
                <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>Topic / Brief</label>
                <textarea value={aiTopic} onChange={e => setAiTopic(e.target.value)} className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} h-24 resize-none focus:outline-none focus:border-purple-500`}
                  placeholder="e.g. Mental health awareness week post – focus on reducing stigma in Arizona healthcare..." />
              </div>
              <div className="flex items-center gap-3 flex-wrap mb-5">
                <button
                  onClick={generateAIContent}
                  disabled={aiGenerating}
                  className={`flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-black hover:bg-purple-500 transition-all ${aiGenerating ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <Bot size={14} /> {aiGenerating ? "Generating..." : "Generate Content"}
                </button>
                {aiOutput && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(aiOutput).catch(()=>{}); }}
                    className={`flex items-center gap-2 px-4 py-2.5 ${card} ${muted} rounded-xl text-sm font-black border hover:text-purple-500 transition-all`}
                  >
                    <FileText size={13} /> Copy to Clipboard
                  </button>
                )}
                {aiOutput && (
                  <button onClick={() => { setAiOutput(""); setAiTopic(""); }} className={`flex items-center gap-2 px-4 py-2.5 ${card} ${muted} rounded-xl text-sm font-black border hover:text-red-400 transition-all`}>
                    <X size={13} /> Clear
                  </button>
                )}
              </div>
              {aiOutput && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                  <p className={`text-[13px] font-black ${muted} uppercase tracking-wider mb-2`}>Generated Content</p>
                  <pre className={`text-sm ${txt} whitespace-pre-wrap font-sans leading-relaxed`}>{aiOutput}</pre>
                </div>
              )}
            </div>

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem]`}>
              <SectionHeader icon={Zap} color="text-amber-500" title="AI Performance Insights" subtitle="Machine-learned recommendations for campaign optimization" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { title: 'Best Posting Time',        desc: 'Connect social data to get AI-powered optimal post scheduling recommendations per platform and audience.',       icon: Clock,     color: 'text-teal-500',    bg: 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800'     },
                  { title: 'Content Recommendations',  desc: 'AI will analyze your top-performing content and suggest new topics based on audience behavior and trends.',      icon: FileText,  color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800' },
                  { title: 'Campaign Optimization',    desc: 'Connect ad data for AI-driven bid adjustments, audience targeting, and creative A/B testing recommendations.',   icon: Target,    color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800'  },
                  { title: 'Sentiment Analysis',       desc: 'AI monitors review sentiment across Google, Yelp, and Healthgrades and alerts you to reputation threats.',       icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'  },
                  { title: 'SEO Opportunity Score',    desc: 'Identifies high-value keyword gaps vs. competitors in the AZ healthcare space and prioritizes blog topics.',     icon: Search,    color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'         },
                  { title: 'Lead Scoring Automation',  desc: 'Score and rank inbound leads by conversion likelihood using behavioral signals and historical campaign data.',    icon: Users,     color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' },
                ].map(item => (
                  <div key={item.title} className={`p-5 rounded-2xl border ${item.bg}`}>
                    <item.icon size={20} className={`${item.color} mb-3`} />
                    <h4 className={`text-sm font-black ${txt} mb-2`}>{item.title}</h4>
                    <p className={`text-xs ${subtl} leading-relaxed mb-3`}>{item.desc}</p>
                    <span className="text-[13px] font-black px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">Awaiting Connection</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className={`mt-12 pt-6 border-t ${brd} flex flex-col md:flex-row justify-between items-center gap-3 no-print`}>
          <div className="flex items-center gap-2">
            <Heart size={13} className="text-teal-500 fill-teal-500" />
            <span className={`text-xs ${subtl} font-medium`}>Destiny Springs Healthcare – Digital Marketing Portal</span>
          </div>
          <span className={`text-[13px] ${subtl} uppercase tracking-wider`}>Powered by DMD &middot; Destiny Springs Healthcare</span>
        </div>

        </main>
      </div>

      {/* ══ CONNECT MODAL ══════════════════════════════════════════════════════ */}
      {connectModal && (() => {
        const intg   = integrations.find(i => i.name === connectModal);
        const fields = integrationFields[connectModal] || [];
        if (!intg) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
               onClick={() => { setConnectModal(null); setConnectError(null); }}>
            <div className={`${card} w-full max-w-md rounded-2xl p-6 shadow-2xl`} onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/30">
                    <intg.icon size={20} className={intg.color} />
                  </div>
                  <div>
                    <h3 className={`font-black text-base ${txt}`}>Connect {intg.name}</h3>
                    <p className={`text-[12px] ${subtl}`}>{intg.sub}</p>
                  </div>
                </div>
                <button onClick={() => { setConnectModal(null); setConnectError(null); }} className={`${muted} hover:text-rose-500 transition-colors`}><X size={18} /></button>
              </div>
              {/* TikTok: OAuth button instead of credential fields */}
              {connectModal === 'TikTok for Business' ? (
                <div className="mb-4">
                  <p className={`text-sm ${txt2} mb-4 leading-relaxed`}>
                    Click below to log in with your TikTok account. You’ll be redirected to TikTok and back automatically — no credentials to copy.
                  </p>
                  <a
                    href="/api/tiktok?action=login"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black text-white transition-colors"
                    style={{ background: '#010101' }}
                  >
                    <PlayCircle size={16} />
                    Login with TikTok
                  </a>
                  <p className={`text-[11px] mt-3 text-center ${subtl}`}>
                    Requires <code>user.info.basic</code> and <code>video.list</code> permissions
                  </p>
                  <button
                    onClick={() => { setConnectModal(null); setConnectError(null); }}
                    className={`mt-3 w-full py-2.5 rounded-xl text-sm font-black border ${brd} ${muted} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                  >Cancel</button>
                </div>
              ) : (
              <>{/* Fields */}
              {fields.map(field => (
                <div key={field.key} className="mb-4">
                  <label className={`block text-[12px] font-black ${txt2} uppercase tracking-wider mb-1.5`}>{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={connectFormData[field.key] || ''}
                    onChange={e => setConnectFormData(d => ({ ...d, [field.key]: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm ${txt} bg-slate-50 dark:bg-slate-800 border ${brd} focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500`}
                  />
                  {field.hint && <p className={`text-[11px] mt-1 ${subtl}`}>{field.hint}</p>}
                </div>
              ))}
              </>
              )}
              {/* Error / Warning */}
              {connectError && (
                <div className={`mb-4 p-3 rounded-xl text-sm border ${
                  connectError.startsWith('⚠️')
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                    : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                }`}>{connectError}</div>
              )}
              {/* Note for non-Meta, non-Wix, non-TikTok platforms */}
              {!['Meta Business Suite','Meta Ads Manager','Wix Analytics','TikTok for Business'].includes(connectModal) && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-[12px] text-blue-600 dark:text-blue-400">
                  Credentials are saved locally. Live data sync for this platform requires the backend API proxy to be configured by your developer.
                </div>
              )}
              {/* Actions — hidden for TikTok (OAuth handles it) */}
              {connectModal !== 'TikTok for Business' && (
              <div className="flex gap-3 mt-2">
                <button onClick={() => { setConnectModal(null); setConnectError(null); }} className={`flex-1 py-2.5 rounded-xl text-sm font-black border ${brd} ${muted} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}>Cancel</button>
                <button
                  onClick={() => saveConnection(connectModal, connectFormData)}
                  disabled={connectTesting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-2"
                >
                  {connectTesting
                    ? <><RefreshCw size={14} className="animate-spin" /> Testing…</>
                    : <><Plug size={14} /> Save & Connect</>}
                </button>
              </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default App;
