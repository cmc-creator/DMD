import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft, ChevronRight, ChevronDown, Upload, Plus, Download, ExternalLink, Bot, X,
  Newspaper, Rss, Link2, Youtube, Building2, Menu,
  Trash2, Layers, Scale, Tag,
} from 'lucide-react';

// ─── Captain KPI avatar — inline SVG bot face ──────────────────────────────
const CaptainKPI = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body / head */}
    <rect x="5" y="11" width="30" height="24" rx="8" fill="#6d28d9"/>
    {/* Visor stripe */}
    <rect x="5" y="15" width="30" height="9" rx="3" fill="#4c1d95"/>
    {/* Eyes */}
    <circle cx="15" cy="20" r="3" fill="#a78bfa"/>
    <circle cx="25" cy="20" r="3" fill="#a78bfa"/>
    <circle cx="16" cy="20.8" r="1.2" fill="white"/>
    <circle cx="26" cy="20.8" r="1.2" fill="white"/>
    {/* Smile */}
    <path d="M14 29 Q20 34 26 29" stroke="#c4b5fd" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    {/* Antenna */}
    <rect x="18" y="4" width="4" height="7" rx="2" fill="#7c3aed"/>
    <circle cx="20" cy="3.5" r="3" fill="#ddd6fe"/>
    <circle cx="20" cy="3.5" r="1.5" fill="#7c3aed"/>
    {/* Cap brim */}
    <rect x="3" y="10" width="34" height="4" rx="2" fill="#5b21b6"/>
    <rect x="0" y="12" width="40" height="2" rx="1" fill="#4c1d95"/>
  </svg>
);

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
  const [calView,     setCalView]               = useState('month');
  const [calViewDate, setCalViewDate]           = useState(() => new Date().toISOString().slice(0, 10));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen]       = useState(false);
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
  const [wixData, setWixData]                   = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_wix') || 'null') || {}; } catch { return {}; } });
  const [manualForm, setManualForm]             = useState({});
  const [showQuickAdd, setShowQuickAdd]         = useState(false);
  const fileInputRef                             = useRef(null);
  const wixFileRef                               = useRef(null);
  const cloudLoadedRef                           = useRef(false);
  const skipNextPushRef                          = useRef(false);
  const pushTimerRef                             = useRef(null);
  const chatEndRef                               = useRef(null);
  const [cloudSynced, setCloudSynced]            = useState('loading'); // 'loading'|'ok'|'syncing'|'error'|'offline'
  const [showDbDiag, setShowDbDiag]              = useState(false);
  const [dbDiag, setDbDiag]                      = useState(null);
  const [dbDiagLoading, setDbDiagLoading]        = useState(false);
  const [pasteCSV, setPasteCSV]                 = useState('');
  const [pasteDataType, setPasteDataType]       = useState('Social Metrics');
  const [aiContentType, setAiContentType]       = useState('Social Post');
  const [aiPlatform, setAiPlatform]             = useState('Facebook');
  const [aiTone, setAiTone]                     = useState('Empathetic');
  const [aiTopic, setAiTopic]                   = useState('');
  const [aiOutput, setAiOutput]                 = useState('');
  const [aiGenerating, setAiGenerating]         = useState(false);
  const [fileImportLog, setFileImportLog]       = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_import_log') || '[]'); } catch { return []; } });
  const [surveyParsed, setSurveyParsed]         = useState(null);  // parsed SM preview before confirm
  const surveyFileRef                            = useRef(null);
  const [aiInsights, setAiInsights]             = useState('');
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [chatOpen, setChatOpen]                 = useState(false);
  const [chatMessages, setChatMessages]         = useState([{ role: 'assistant', content: "Reporting for duty! 🫡 I'm **Captain KPI**, your marketing analytics officer. Fire away — ask me about the data, what to post, how to get more reviews, or why your bounce rate looks like a trampoline." }]);
  const [chatInput, setChatInput]               = useState('');
  const [chatLoading, setChatLoading]           = useState(false);
  const [importNotice, setImportNotice]         = useState('');
  const [wixFormVals, setWixFormVals]           = useState({});
  const [reviewPlatformData, setReviewPlatformData] = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_review_platforms') || '{}'); } catch { return {}; } });
  const [reviewPlatformForm, setReviewPlatformForm]   = useState({ editingPlatform: null, rating: '', count: '', url: '' });
  const [reviewFetchingPlatform, setReviewFetchingPlatform] = useState(null);
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
  const [facilityProfiles, setFacilityProfiles] = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_facility_profiles') || '[]'); } catch { return []; } });
  const [scraperLabel, setScraperLabel]         = useState('');
  const [scraperSubView, setScraperSubView]     = useState('scan');
  const [compareIdxA, setCompareIdxA]           = useState(0);
  const [compareIdxB, setCompareIdxB]           = useState(1);
  const [compareReport, setCompareReport]       = useState('');
  const [compareReportLoading, setCompareReportLoading] = useState(false);
  // ── Destiny Springs auto-profile state ──────────────────────────────────────
  const [destinyData, setDestinyData]           = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_destiny') || 'null'); } catch { return null; } });
  const [destinyLoading, setDestinyLoading]     = useState(false);
  const [destinyError, setDestinyError]         = useState('');
  // ── Competitor Intelligence state ──────────────────────────────────────────────
  const [competitorData, setCompetitorData]      = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_competitors') || 'null'); } catch { return null; } });
  const [competitorLoading, setCompetitorLoading] = useState(false);
  // ── Overview layout customization ────────────────────────────────────────────
  const [overviewHidden, setOverviewHidden]       = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_overview_hidden') || '[]'); } catch { return []; } });
  const [showOverviewCustomizer, setShowOverviewCustomizer] = useState(false);
  const [reviewOverrides, setReviewOverrides]     = useState(() => { try { return JSON.parse(localStorage.getItem('dmd_review_overrides') || '{}'); } catch { return {}; } });
  const [editingRating, setEditingRating]         = useState(false);
  const [ratingEditVal, setRatingEditVal]         = useState('');
  const [ratingCountVal, setRatingCountVal]       = useState('');

  // ── Feature state ─────────────────────────────────────────────────────────
  const [captionGenerating, setCaptionGenerating]   = useState(false);
  const [reviewDrafts, setReviewDrafts]             = useState({});
  const [reviewDraftLoading, setReviewDraftLoading] = useState({});
  const [autoPostLoading, setAutoPostLoading]       = useState({});
  const [digestSending, setDigestSending]           = useState(false);
  const [digestResult, setDigestResult]             = useState('');
  const [contentItems, setContentItems]             = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('dmd_content') || 'null');
      if (Array.isArray(s) && s.length) return s;
    } catch {}
    return [
      { title: 'Mental Health Awareness Post',       platform: 'Facebook, Instagram', date: '2026-03-03', type: 'Social', status: 'scheduled', notes: 'Focus on stigma reduction'          },
      { title: '5 Signs You Need Support (TikTok)',  platform: 'TikTok',              date: '2026-03-04', type: 'TikTok', status: 'filming',   notes: 'Short-form, 60s max'                },
      { title: 'Blog: Anxiety Support in Arizona',   platform: 'Website',             date: '2026-03-05', type: 'Blog',   status: 'draft',     notes: '1,200 words – SEO optimized'        },
      { title: 'Weekly Email Newsletter',            platform: 'Mailchimp',           date: '2026-03-06', type: 'Email',  status: 'scheduled', notes: 'All subscribers – 3pm send time'    },
      { title: 'Success Story Spotlight',            platform: 'LinkedIn',            date: '2026-03-07', type: 'Social', status: 'idea',      notes: 'Patient testimonial (anonymized)'   },
      { title: 'Weekend Wellness Tip',               platform: 'Instagram',           date: '2026-03-08', type: 'Social', status: 'scheduled', notes: '5 breathing exercises for calm'     },
      { title: 'Staff Introduction Video',           platform: 'TikTok, Instagram',   date: '2026-03-10', type: 'TikTok', status: 'filming',   notes: 'Behind the scenes series'           },
      { title: 'SEO Blog: Finding a Therapist AZ',  platform: 'Website',             date: '2026-03-13', type: 'Blog',   status: 'idea',      notes: 'Target: therapist near me Arizona'  },
      { title: 'Monthly Patient Outreach Email',     platform: 'Mailchimp',           date: '2026-03-14', type: 'Email',  status: 'scheduled', notes: 'Re-engagement campaign'             },
      { title: 'Recovery Awareness Post',            platform: 'Facebook, LinkedIn',  date: '2026-03-17', type: 'Social', status: 'scheduled', notes: 'Link to latest blog article'        },
      { title: 'TikTok Q&A: Common Questions',       platform: 'TikTok',              date: '2026-03-19', type: 'TikTok', status: 'idea',      notes: '3-part Q&A series'                 },
      { title: 'Ad Creative: New Patient Special',   platform: 'Meta Ads',            date: '2026-03-20', type: 'Social', status: 'draft',     notes: 'A/B test 2 creative variants'      },
    ];
  });

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else          document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Persist liveData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dmd_livedata', JSON.stringify(liveData));
  }, [liveData]);

  // Persist contentItems to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dmd_content', JSON.stringify(contentItems));
  }, [contentItems]);

  // ── Cloud sync: pull shared data from Vercel KV on mount ────────────────────
  useEffect(() => {
    fetch('/api/data')
      .then(r => r.ok ? r.json() : Promise.reject('http-' + r.status))
      .then(({ data, error }) => {
        if (error || !data) { cloudLoadedRef.current = true; setCloudSynced('offline'); return; }
        // Mark that we're restoring from cloud so the auto-push doesn't immediately mirror back
        skipNextPushRef.current = true;
        const ls = (k, v) => localStorage.setItem(k, JSON.stringify(v));
        if (data.dmd_destiny)          { setDestinyData(data.dmd_destiny);                 ls('dmd_destiny',          data.dmd_destiny); }
        if (data.dmd_review_platforms) { setReviewPlatformData(data.dmd_review_platforms); ls('dmd_review_platforms',  data.dmd_review_platforms); }
        if (data.dmd_manual)           { setManualData(data.dmd_manual);                   ls('dmd_manual',            data.dmd_manual); }
        if (data.dmd_wix)              { setWixData(data.dmd_wix);                         ls('dmd_wix',               data.dmd_wix); }
        if (data.dmd_livedata)         { setLiveData(data.dmd_livedata);                   ls('dmd_livedata',          data.dmd_livedata); }
        if (data.dmd_competitors)      { setCompetitorData(data.dmd_competitors);           ls('dmd_competitors',       data.dmd_competitors); }
        if (data.dmd_overview_hidden)  { setOverviewHidden(data.dmd_overview_hidden);       ls('dmd_overview_hidden',   data.dmd_overview_hidden); }
        if (data.dmd_review_overrides) { setReviewOverrides(data.dmd_review_overrides);     ls('dmd_review_overrides',  data.dmd_review_overrides); }
        if (data.dmd_connections)      { setConnections(data.dmd_connections);              ls('dmd_connections',        data.dmd_connections); }
        if (data.dmd_saved_urls)       { setSavedUrls(data.dmd_saved_urls);                 ls('dmd_saved_urls',        data.dmd_saved_urls); }
        if (data.dmd_facility_profiles){ setFacilityProfiles(data.dmd_facility_profiles);   ls('dmd_facility_profiles', data.dmd_facility_profiles); }
        if (data.dmd_content)          { setContentItems(data.dmd_content);                   ls('dmd_content',           data.dmd_content); }
        cloudLoadedRef.current = true;
        setCloudSynced('ok');
        setTimeout(() => { skipNextPushRef.current = false; }, 600);
      })
      .catch(() => { cloudLoadedRef.current = true; setCloudSynced('offline'); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cloud sync: auto-push whenever data changes (debounced 3 s) ─────────────
  useEffect(() => {
    if (!cloudLoadedRef.current || skipNextPushRef.current) return;
    clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      const payload = {
        dmd_destiny:           destinyData,
        dmd_review_platforms:  reviewPlatformData,
        dmd_manual:            manualData,
        dmd_wix:               wixData,
        dmd_livedata:          liveData,
        dmd_competitors:       competitorData,
        dmd_overview_hidden:   overviewHidden,
        dmd_review_overrides:  reviewOverrides,
        dmd_connections:       connections,
        dmd_saved_urls:        savedUrls,
        dmd_facility_profiles: facilityProfiles,
        dmd_content:           contentItems,
        _updatedAt:            new Date().toISOString(),
      };
      setCloudSynced('syncing');
      fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(r => r.json())
        .then(({ ok, error }) => setCloudSynced(ok ? 'ok' : (error?.includes?.('not configured') ? 'offline' : 'error')))
        .catch(() => setCloudSynced('error'));
    }, 3000);
    return () => clearTimeout(pushTimerRef.current);
  }, [destinyData, reviewPlatformData, manualData, wixData, liveData, competitorData, overviewHidden, reviewOverrides, connections, savedUrls, facilityProfiles, contentItems]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setShowQuickAdd(false); setManualForm({}); }, [activeTab]); // eslint-disable-line

  // Auto-scroll chatbot to latest message
  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatOpen]);

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
      { key: 'placeId', label: 'Google Place ID (optional)', placeholder: 'ChIJxxxxxxxxxxxxxxxx',  hint: 'Leave blank to auto-find by name. Or: Google Maps → your listing → Share → copy place_id from the URL'             },
      { key: 'apiKey',  label: 'Places API Key',             placeholder: 'AIzaSyxxxxxxxxxx', type: 'password', hint: 'Enables auto-sync of live Google Rating, Review Count & Reviews on the Overview tab. console.cloud.google.com → Enable "Places API" → Credentials → API Key (free up to $200/mo credit)' },
    ],
    'Meta Business Suite': [
      { key: 'accessToken', label: 'Page Access Token', placeholder: 'EAAxxxxxxxx…', type: 'password', hint: 'developers.facebook.com → Graph API Explorer → Generate Token' },
      { key: 'pageId',      label: 'Facebook Page ID',  placeholder: '123456789012345',                hint: 'Facebook Page → About → Page ID'                                },
    ],
    'Wix Analytics': [
      { key: 'sessions',   label: 'Monthly Sessions',          placeholder: 'e.g. 1250',  hint: 'Wix Dashboard → Analytics → Reports → Traffic Overview → Sessions this month'   },
      { key: 'bounceRate', label: 'Bounce Rate % (optional)',  placeholder: 'e.g. 42',    hint: 'Wix Analytics → Overview → Bounce Rate — enter the number only, no % sign'       },
      { key: 'organic',    label: 'Organic Search % (optional)', placeholder: 'e.g. 45', hint: 'Wix Analytics → Traffic Sources → percentage from Organic Search'                 },
      { key: 'social',     label: 'Social Media % (optional)', placeholder: 'e.g. 20',   hint: 'Wix Analytics → Traffic Sources → percentage from Social Media'                   },
      { key: 'direct',     label: 'Direct % (optional)',       placeholder: 'e.g. 25',    hint: 'Wix Analytics → Traffic Sources → percentage from Direct visits'                  },
      { key: 'referral',   label: 'Referral % (optional)',     placeholder: 'e.g. 10',    hint: 'Wix Analytics → Traffic Sources → percentage from Referral links'                 },
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
      { key: 'businessId', label: 'Yelp Business ID',  placeholder: 'destiny-springs-healthcare-surprise', hint: 'From the Yelp business URL: yelp.com/biz/YOUR-BUSINESS-ID' },
      { key: 'apiKey',     label: 'Yelp API Key',      placeholder: 'your-yelp-api-key', type: 'password',   hint: 'Register at api.yelp.com → Create App → API Key (500 free calls/day)' },
    ],
    'News API': [
      { key: 'apiKey',       label: 'API Key',             placeholder: 'your-newsapi.org-key', type: 'password', hint: 'Register free at newsapi.org → Account → API Key (100 req/day free)' },
      { key: 'defaultQuery', label: 'Default Search Query (optional)', placeholder: 'mental health Arizona',         hint: 'Keywords auto-loaded on the Intel tab. Leave blank for default.' },
    ],
  };

  // ── Live data fetch helpers ───────────────────────────────────────────────────
  const fetchWixData = async (creds) => {
    const { sessions } = creds;
    if (!sessions) return { success: false, error: 'Please enter Monthly Sessions (required)' };
    const data = {
      sessions:   Number(sessions)        || 0,
      bounceRate: Number(creds.bounceRate) || 0,
      organic:    Number(creds.organic)    || 0,
      social:     Number(creds.social)     || 0,
      direct:     Number(creds.direct)     || 0,
      referral:   Number(creds.referral)   || 0,
      savedAt:    new Date().toISOString(),
    };
    setWixData(data);
    localStorage.setItem('dmd_wix', JSON.stringify(data));
    return { success: true, data };
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
    // Prefer page access token (from OAuth flow); fall back to manually-entered access token
    const { accessToken, pageToken, pageId } = creds;
    const token = pageToken || accessToken;
    if (!token || !pageId) return { success: false, error: 'Missing access token or page ID' };
    try {
      const [statsRes, feedRes] = await Promise.all([
        fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=fan_count,followers_count,name&access_token=${encodeURIComponent(token)}`),
        fetch(`/api/meta?action=feed&token=${encodeURIComponent(token)}&pageId=${encodeURIComponent(pageId)}`),
      ]);
      const data     = await statsRes.json();
      const feedData = await feedRes.json();
      if (data.error) return { success: false, error: data.error.message };
      if (feedData.ok) {
        data.fbPosts = feedData.fbPosts;
        data.igPosts = feedData.igPosts;
      }
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  };

  const fetchMailchimpDirect = async (creds) => {
    const { apiKey, listId } = creds;
    if (!apiKey) return { success: false, error: 'Enter your Mailchimp API key in Integrations → Mailchimp → Connect' };
    try {
      const params = new URLSearchParams({ action: 'data', apiKey, ...(listId && { listId }) });
      const res  = await fetch(`/api/mailchimp?${params}`);
      const data = await res.json();
      if (!data.ok) return { success: false, error: data.error || 'Mailchimp fetch failed' };
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  };

  const fetchGoogleAnalyticsData = async (creds) => {
    const { refresh_token, propertyId } = creds;
    if (!refresh_token) return { success: false, error: 'Not connected — click the Google OAuth login button to authorize' };
    try {
      const params = new URLSearchParams({ action: 'refresh', refresh_token, ...(propertyId && { propertyId }) });
      const res  = await fetch(`/api/google?${params}`);
      const data = await res.json();
      if (!data.ok) return { success: false, error: data.error || 'Google Analytics refresh failed' };
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  };

  // ── AI caption generation ─────────────────────────────────────────────────────
  const generateCaption = async (title, platform, type) => {
    if (!title) return;
    setCaptionGenerating(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxTokens: 300,
          messages: [{ role: 'user', content: `Write a compelling, HIPAA-safe social media caption for a behavioral health/mental wellness facility. Post type: ${type}. Platform: ${platform}. Topic: "${title}". Keep it empathetic, professional, and engaging. Include 3-5 relevant hashtags. Output ONLY the caption text.` }],
          systemPrompt: 'You are a healthcare social media copywriter specializing in mental health and behavioral wellness. Write warm, professional, stigma-free content. Never mention specific treatment outcomes or patient stories. Always include a gentle call to action.',
        }),
      });
      const d = await res.json();
      if (d.reply) setNewPost(p => ({ ...p, notes: d.reply }));
    } catch {}
    setCaptionGenerating(false);
  };

  // ── AI review response draft ─────────────────────────────────────────────────
  const generateReviewResponse = async (review, idx) => {
    setReviewDraftLoading(l => ({ ...l, [idx]: true }));
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxTokens: 250,
          messages: [{ role: 'user', content: `Write a professional, HIPAA-compliant response to this ${review.rating}-star ${review.platform} review from "${review.author}":\n\n"${review.text}"\n\nRespond as Destiny Springs Healthcare. Be warm, professional, and never reference specific treatment details or confirm they are/were a patient.` }],
          systemPrompt: 'You are a healthcare reputation manager. Write HIPAA-safe, empathetic review responses. Never confirm/deny patient status. Thank positive reviewers. Address concerns constructively for negative ones. Keep it under 100 words.',
        }),
      });
      const d = await res.json();
      if (d.reply) setReviewDrafts(prev => ({ ...prev, [idx]: d.reply }));
    } catch {}
    setReviewDraftLoading(l => ({ ...l, [idx]: false }));
  };

  // ── Auto-post to Facebook/Instagram via Graph API ────────────────────────
  const publishPost = async (item, idx) => {
    const metaCreds = connections['Meta Business Suite'];
    if (!metaCreds?.connected || !metaCreds?.accessToken || !metaCreds?.pageId) {
      alert('Connect Meta Business Suite with a Page Access Token first (Settings → Integrations).');
      return;
    }
    setAutoPostLoading(l => ({ ...l, [idx]: true }));
    try {
      const res = await fetch('/api/post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: item.notes || item.title,
          pageId:  metaCreds.pageId,
          token:   metaCreds.accessToken,
          published: item.status === 'scheduled',
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setContentItems(prev => prev.map((c, i) => i === idx ? { ...c, status: 'published', postId: d.postId } : c));
        alert(`✅ Published! Post ID: ${d.postId}`);
      } else {
        alert(`❌ Publish failed: ${d.error}`);
      }
    } catch (e) { alert(`❌ Error: ${e.message}`); }
    setAutoPostLoading(l => ({ ...l, [idx]: false }));
  };

  // ── Send weekly digest via Mailchimp ─────────────────────────────────────
  const sendWeeklyDigest = async () => {
    const mc = connections['Mailchimp'];
    if (!mc?.connected || !mc?.apiKey) {
      alert('Connect Mailchimp with an API Key first (Settings → Integrations).');
      return;
    }
    setDigestSending(true); setDigestResult('');
    try {
      const res = await fetch('/api/mailchimp?action=sendDigest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: mc.apiKey,
          listId: mc.listId,
          stats: {
            openRate: _mailLive.openRate,
            subscribers: _mailLive.subscribers,
            clickRate: _mailLive.clickRate,
            totalCampaigns: _mailLive.totalCampaigns,
          },
        }),
      });
      const d = await res.json();
      setDigestResult(d.ok ? `✅ Digest campaign created! ${d.campaignId ? 'ID: ' + d.campaignId : ''}` : `❌ ${d.error || 'Failed to create digest'}`);
    } catch (e) { setDigestResult(`❌ Error: ${e.message}`); }
    setDigestSending(false);
  };

  const fetchMetaAdsData = async (creds) => {
    const { accessToken, adAccountId } = creds || {};
    if (!accessToken || !adAccountId) return { success: false, error: 'Missing Access Token or Ad Account ID — check Integrations → Meta Ads Manager' };
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

  const saveFacilityProfile = (label, result) => {
    if (!result) return;
    let host; try { host = new URL(result.url).hostname; } catch { host = result.url; }
    const entry   = { id: Date.now(), label: label || result.title || host, ...result, savedAt: new Date().toLocaleString() };
    const updated = [entry, ...facilityProfiles.filter(p => p.url !== result.url)].slice(0, 30);
    setFacilityProfiles(updated);
    localStorage.setItem('dmd_facility_profiles', JSON.stringify(updated));
    setScraperLabel('');
  };

  const removeFacilityProfile = (id) => {
    const updated = facilityProfiles.filter(p => p.id !== id);
    setFacilityProfiles(updated);
    localStorage.setItem('dmd_facility_profiles', JSON.stringify(updated));
  };

  const generateCompareReport = async (profA, profB) => {
    if (!profA || !profB) return;
    setCompareReportLoading(true);
    setCompareReport('');
    const sum = (p) => 'Facility: "' + p.label + '" | URL: ' + p.url
      + '\nTitle: ' + (p.title||'--') + '\nDescription: ' + (p.description||'--')
      + '\nH1: ' + (p.h1||'--') + '\nKey Headings: ' + [...(p.h2s||[]),...(p.h3s||[])].slice(0,6).join(' | ')
      + '\nWord Count: ' + (p.wordCount||0) + ' | Links: ' + (p.linkCount||0)
      + '\nPhones: ' + ((p.phones||[]).join(', ')||'none') + ' | Emails: ' + ((p.emails||[]).join(', ')||'none')
      + '\nServices : ' + ((p.servicesFound||[]).join(', ')||'none')
      + '\nSocials: ' + (Object.keys(p.socials||{}).join(', ')||'none')
      + '\nTech Stack: ' + ((p.techStack||[]).join(', ')||'unknown')
      + '\nSchema Rating: ' + (p.schemaRating ? p.schemaRating + ' (' + p.schemaReviewCount + ' reviews)' : 'not found')
      + '\nSchema Address: ' + (p.schemaAddress||'not found') + ' | Keywords: ' + (p.keywords||'none');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxTokens: 1600,
          messages: [{ role: 'user', content: 'Deep competitive intelligence analysis between two healthcare facilities. Cover SEO strategy, services, digital footprint, contact accessibility, brand positioning, schema signals.\n\n=== FACILITY A ===\n' + sum(profA) + '\n\n=== FACILITY B ===\n' + sum(profB) + '\n\nGive specific, actionable recommendations for Destiny Springs Healthcare to outcompete Facility B.' }],
          systemPrompt: 'You are Captain KPI -- a competitive intelligence analyst specializing in behavioral healthcare. Format with headers: ## Overall Verdict, ## SEO & Content Strategy, ## Services Coverage, ## Digital & Social Presence, ## Contact Accessibility, ## Tech Stack Insights, ## Tactical Recommendations. Use bullet points, be specific and data-driven.',
        }),
      });
      const data = await res.json();
      setCompareReport(data.reply || 'No response generated.');
    } catch (e) { setCompareReport('Could not generate comparison. Check GEMINI_API_KEY in Vercel.'); }
    setCompareReportLoading(false);
  };

  // ── Destiny Springs: one-click auto-profile fetch ────────────────────────────
  const fetchDestinyProfile = async () => {
    const gBizCreds = connections['Google Business'] || {};
    const apiKey  = gBizCreds.apiKey  || '';
    const placeId = gBizCreds.placeId || '';
    setDestinyLoading(true);
    setDestinyError('');
    // Clear stale cache so the UI shows fresh loading state, not old data
    setDestinyData(null);
    localStorage.removeItem('dmd_destiny');
    try {
      const params = new URLSearchParams();
      if (apiKey)  params.set('apiKey',  apiKey);
      if (placeId) params.set('placeId', placeId);
      const qs  = params.toString() ? '?' + params.toString() : '';
      const res = await fetch('/api/destiny' + qs);
      const data = await res.json();
      if (!data.ok) { setDestinyError(data.error || 'Sync failed'); setDestinyLoading(false); return; }
      setDestinyData(data);
      localStorage.setItem('dmd_destiny', JSON.stringify(data));
      // ── Auto-populate best available rating into overrides ─────────────────
      // Uses Google Places if key is set, otherwise falls back to Google search
      // scrape / website JSON-LD schema / Healthgrades — whichever has data first.
      const best = data.bestRating || data.google || null;
      if (best?.rating) {
        const overrides = { rating: String(best.rating), totalReviews: String(best.reviewCount || '') };
        setReviewOverrides(overrides);
        localStorage.setItem('dmd_review_overrides', JSON.stringify(overrides));
      }
      // ── Push Google Places reviews into manualData (only when API key set) ──
      if (data.google?.reviews?.length) {
        const autoReviews = data.google.reviews.map(rv => ({
          name:     rv.author || 'Anonymous',
          rating:   rv.rating,
          text:     rv.text   || '',
          date:     rv.time   ? rv.time.slice(0, 10) : '',
          platform: 'Google',
          source:   'auto-sync',
        }));
        setManualData(prev => {
          const existing = (prev.reviews || []).filter(r => r.source !== 'auto-sync');
          const updated  = { ...prev, reviews: [...autoReviews, ...existing] };
          localStorage.setItem('dmd_manual', JSON.stringify(updated));
          return updated;
        });
      }
      // ── Auto-populate reviewPlatformData from destiny sync ─────────────────
      // This makes metrics.googleScore (Overview KPI card) show real data
      // without requiring manual entry in the Integrations tab.
      setReviewPlatformData(prev => {
        const updated = { ...prev };
        const gRating = data.google?.rating ?? data.googleSearch?.rating ?? data.bestRating?.rating;
        const gCount  = data.google?.reviewCount ?? data.googleSearch?.reviewCount ?? data.bestRating?.reviewCount;
        if (gRating && gCount && Number(gCount) > 0) {
          updated.google = {
            rating:    String(gRating),
            count:     String(gCount),
            source:    data.google?.rating ? 'auto-sync' : 'auto-sync-search',
            fetchedAt: data.fetchedAt,
          };
        }
        if (data.healthgrades?.rating && data.healthgrades?.reviewCount && Number(data.healthgrades.reviewCount) > 0) {
          updated.healthgrades = {
            rating:    String(data.healthgrades.rating),
            count:     String(data.healthgrades.reviewCount),
            source:    'auto-sync',
            fetchedAt: data.fetchedAt,
          };
        }
        localStorage.setItem('dmd_review_platforms', JSON.stringify(updated));
        return updated;
      });
      // ── Feed Google Business liveData (uses best available rating source) ───
      const liveRating = data.google?.rating || best?.rating || null;
      if (liveRating || data.google) {
        setLiveData(d => ({ ...d, 'Google Business': {
          rating:      data.google?.rating      ?? best?.rating,
          reviewCount: data.google?.reviewCount ?? best?.reviewCount,
          phone:       data.google?.phone       ?? data.website?.phones?.[0],
          address:     data.google?.address,
          isOpen:      data.google?.isOpen,
          ratingSource: best?.source || 'scraped',
          fetchedAt:   data.fetchedAt,
        }}));
        const now = new Date().toLocaleString();
        setConnections(c => {
          const updated = { ...c, 'Google Business': { ...c['Google Business'], connected: true, lastSync: now } };
          localStorage.setItem('dmd_connections', JSON.stringify(updated));
          return updated;
        });
        setSyncStatus(s => ({ ...s, 'Google Business': 'ok' }));
      }
      // ── Feed social media liveData (feeds Social tab with real follower counts) ──
      if (data.instagram || data.facebook || data.tiktok) {
        setLiveData(d => {
          const prev = d['_social'] || {};
          return {
            ...d,
            ...(data.instagram && !data.instagram.error ? {
              'Meta Business Suite': { ...d['Meta Business Suite'],
                instagramFollowers: data.instagram.followers,
                instagramPosts:     data.instagram.posts,
                instagramBio:       data.instagram.bio,
              }
            } : {}),
            ...(data.facebook && !data.facebook.error ? {
              'Meta Ads Manager': { ...d['Meta Ads Manager'],
                facebookFollowers: data.facebook.followers,
                facebookLikes:     data.facebook.likes,
                facebookName:      data.facebook.name,
              }
            } : {}),
            ...(data.tiktok && !data.tiktok.error ? {
              'TikTok for Business': { ...d['TikTok for Business'],
                followers:  data.tiktok.followers,
                totalLikes: data.tiktok.likes,
                videos:     data.tiktok.videos,
              }
            } : {}),
            '_social': {
              fetchedAt: new Date().toISOString(),
              facebook:  (data.facebook  && !data.facebook.error)  ? data.facebook  : prev.facebook,
              instagram: (data.instagram && !data.instagram.error) ? data.instagram : prev.instagram,
              tiktok:    (data.tiktok    && !data.tiktok.error)    ? data.tiktok    : prev.tiktok,
              linkedin:  (data.linkedin  && !data.linkedin.error)  ? data.linkedin  : prev.linkedin,
            },
          };
        });
      }
      // ── Bridge Graph API posts ⇒ Meta Business Suite so Social tab shows real content ──
      if ((data.facebook?.posts?.length) || (data.instagram?.recentMedia?.length)) {
        setLiveData(d => ({
          ...d,
          'Meta Business Suite': {
            ...d['Meta Business Suite'],
            ...(data.facebook?.posts?.length   && { fbPosts: data.facebook.posts }),
            ...(data.instagram?.recentMedia?.length && { igPosts: data.instagram.recentMedia }),
            ...(data.facebook?.followers && { fanCount:   data.facebook.followers }),
            ...(data.facebook?.likes     && { followers:  data.facebook.likes     }),
            ...(data.instagram?.followers && { instagramFollowers: data.instagram.followers }),
          },
        }));
        const now = new Date().toLocaleString();
        setConnections(c => {
          const updated = { ...c, 'Meta Business Suite': { ...(c['Meta Business Suite'] || {}), connected: true, lastSync: now } };
          localStorage.setItem('dmd_connections', JSON.stringify(updated));
          return updated;
        });
        setSyncStatus(s => ({ ...s, 'Meta Business Suite': 'ok' }));
      }
    } catch (e) { setDestinyError(e.message); }
    setDestinyLoading(false);
  };

  // ── Competitor Intelligence fetch ─────────────────────────────────────────────
  const fetchCompetitors = async () => {
    setCompetitorLoading(true);
    try {
      const res  = await fetch('/api/competitors');
      const data = await res.json();
      if (data.ok) {
        setCompetitorData(data);
        localStorage.setItem('dmd_competitors', JSON.stringify(data));
      }
    } catch {}
    setCompetitorLoading(false);
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
      else if (name === 'Mailchimp') result = await fetchMailchimpDirect(creds);
      else if (name === 'Google Analytics') result = await fetchGoogleAnalyticsData(creds);
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
    else if (name === 'Mailchimp') testResult = await fetchMailchimpDirect(formData);
    else if (name === 'Google Analytics') testResult = await fetchGoogleAnalyticsData(formData);
    setConnectTesting(false);
    if (!testResult.success) { setConnectError(`Connection failed: ${testResult.error}`); return; }
    if (testResult.warning) { setConnectError(`⚠️ ${testResult.warning}`); }
    const syncTime = new Date().toLocaleString();
    const updated  = { ...connections, [name]: { ...formData, connected: true, lastSync: syncTime } };
    setConnections(updated);
    localStorage.setItem('dmd_connections', JSON.stringify(updated));
    if (testResult.data && Object.keys(testResult.data).length > 0) setLiveData(d => ({ ...d, [name]: testResult.data }));
    setSyncStatus(s => ({ ...s, [name]: 'ok' }));
    setLiveData(d => ({ ...d, _timestamps: { ...(d._timestamps || {}), [name]: new Date().toISOString() } }));
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
    if (h.some(x => x.includes('respondent') || x.includes('collector id'))) return 'Survey Results';
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

  const exportBackup = () => {
    const backup = {
      _dmdBackup: true,
      _exportedAt: new Date().toISOString(),
      dmd_destiny:          (() => { try { return JSON.parse(localStorage.getItem('dmd_destiny')   || 'null'); } catch { return null; } })(),
      dmd_review_platforms: (() => { try { return JSON.parse(localStorage.getItem('dmd_review_platforms') || '{}'); } catch { return {}; } })(),
      dmd_manual:           (() => { try { return JSON.parse(localStorage.getItem('dmd_manual')   || '{}'); } catch { return {}; } })(),
      dmd_connections:      (() => { try { return JSON.parse(localStorage.getItem('dmd_connections') || '{}'); } catch { return {}; } })(),
      dmd_wix:              (() => { try { return JSON.parse(localStorage.getItem('dmd_wix')       || 'null'); } catch { return null; } })(),
      dmd_livedata:         (() => { try { return JSON.parse(localStorage.getItem('dmd_livedata')  || '{}'); } catch { return {}; } })(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `dmd-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setImportNotice('Backup downloaded — import this file on any device to restore all your data.');
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
          // ── Full backup restore ──────────────────────────────────────
          if (parsed._dmdBackup === true) {
            const keys = ['dmd_destiny','dmd_review_platforms','dmd_manual','dmd_connections','dmd_wix','dmd_livedata'];
            keys.forEach(k => { if (parsed[k] != null) localStorage.setItem(k, JSON.stringify(parsed[k])); });
            // Reload state from restored localStorage
            try { if (parsed.dmd_review_platforms) setReviewPlatformData(parsed.dmd_review_platforms); } catch(_){}
            try { if (parsed.dmd_manual)           setManualData(parsed.dmd_manual); } catch(_){}
            try { if (parsed.dmd_connections)      setConnections(parsed.dmd_connections); } catch(_){}
            try { if (parsed.dmd_wix)              setWixData(parsed.dmd_wix); } catch(_){}
            try { if (parsed.dmd_destiny)          setDestinyData(parsed.dmd_destiny); } catch(_){}
            try { if (parsed.dmd_livedata)         setLiveData(parsed.dmd_livedata); } catch(_){}
            setImportNotice(`✅ Backup restored from ${file.name} — all data synced across device!`);
            return;
          }
          // ── Regular JSON import ──────────────────────────────────────
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
          const type = detectTypeFromHeaders(headers);
          const count = batchSaveToManualData(type, rows);
          setImportNotice(`Imported ${count} record${count !== 1 ? 's' : ''} from ${file.name} into ${type}`);
          setFileImportLog(prev => { const upd = [{ name: file.name, date: new Date().toLocaleString(), rows: count, type }, ...prev].slice(0, 100); localStorage.setItem('dmd_import_log', JSON.stringify(upd)); return upd; });
        } catch (_) {
          setImportNotice('Invalid JSON file.');
        }
      } else {
        // CSV / plain text — check for SurveyMonkey 2-row header format
        const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { setImportNotice('File needs at least a header row and one data row.'); return; }
        const firstCols = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        const isSurveyMonkey = firstCols[0]?.includes('respondent') || firstCols[1]?.includes('collector');
        if (isSurveyMonkey) {
          // Route to the SM parser — switch to survey mode and pre-fill paste area
          setImportMode('survey');
          setSurveyParsed(null);
          setPasteCSV(text);
          setImportNotice('SurveyMonkey file detected — click "Parse Survey" to review results before saving.');
          setFileImportLog(prev => { const upd = [{ name: file.name, date: new Date().toLocaleString(), rows: lines.length - 2, type: 'SurveyMonkey' }, ...prev].slice(0, 100); localStorage.setItem('dmd_import_log', JSON.stringify(upd)); return upd; });
          return;
        }
        const headers = firstCols.map(h => h.replace(/^"|"$/g, ''));
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
        setFileImportLog(prev => { const upd = [{ name: file.name, date: new Date().toLocaleString(), rows: count, type }, ...prev].slice(0, 100); localStorage.setItem('dmd_import_log', JSON.stringify(upd)); return upd; });
      }
    };
    reader.onerror = () => setImportNotice('Error reading file.');
    reader.readAsText(file);
  };

  // ── Wix Analytics CSV import parser ────────────────────────────────────────
  const handleWixCsvUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ({ target: { result } }) => {
      const lines = result.trim().split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { setImportNotice('CSV needs at least a header row and one data row.'); return; }
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const sessIdx   = headers.findIndex(h => h.includes('session'));
      const bounceIdx = headers.findIndex(h => h.includes('bounce'));
      const sourceIdx = headers.findIndex(h => h.includes('source') || h.includes('channel') || h.includes('traffic'));
      let totalSessions = 0, totalBounce = 0, bounceCount = 0;
      const sources = { organic: 0, social: 0, direct: 0, referral: 0 };
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (sourceIdx !== -1 && sessIdx !== -1) {
          const srcName = (cols[sourceIdx] || '').toLowerCase();
          const srcSess = parseFloat(cols[sessIdx] || '0') || 0;
          if (srcName.includes('organic') || srcName.includes('search')) sources.organic += srcSess;
          else if (srcName.includes('social')) sources.social += srcSess;
          else if (srcName.includes('direct')) sources.direct += srcSess;
          else if (srcName.includes('referral')) sources.referral += srcSess;
          totalSessions += srcSess;
        } else if (sessIdx !== -1) {
          const s = parseFloat(cols[sessIdx] || '0') || 0;
          if (s > 0) totalSessions += s;
          if (bounceIdx !== -1) {
            const b = parseFloat(cols[bounceIdx] || '0') || 0;
            if (b > 0) { totalBounce += b; bounceCount++; }
          }
        }
      }
      if (totalSessions === 0) { setImportNotice('\u26a0\ufe0f Could not find a sessions column. Try manual entry below.'); return; }
      const hasSources = Object.values(sources).some(v => v > 0);
      setWixFormVals({
        sessions:   String(Math.round(totalSessions)),
        bounceRate: bounceCount > 0 ? String(Math.round(totalBounce / bounceCount)) : '',
        organic:    hasSources ? String(Math.round(sources.organic  / totalSessions * 100)) : '',
        social:     hasSources ? String(Math.round(sources.social   / totalSessions * 100)) : '',
        direct:     hasSources ? String(Math.round(sources.direct   / totalSessions * 100)) : '',
        referral:   hasSources ? String(Math.round(sources.referral / totalSessions * 100)) : '',
      });
      setFileImportLog(prev => {
        const upd = [{ name: file.name, date: new Date().toLocaleString(), rows: lines.length - 1, type: 'Wix Analytics' }, ...prev].slice(0, 100);
        localStorage.setItem('dmd_import_log', JSON.stringify(upd));
        return upd;
      });
      setImportNotice(`\u2705 Wix CSV parsed (${lines.length - 1} rows) \u2014 review values below and click Save Wix Data`);
    };
    reader.onerror = () => setImportNotice('Error reading Wix CSV.');
    reader.readAsText(file);
  };

  // ── SurveyMonkey CSV Parser ─────────────────────────────────────────────────
  const parseSurveyMonkeyCSV = (text) => {
    if (!text.trim()) { setImportNotice('Paste your SurveyMonkey CSV export first.'); return; }

    // Robust CSV line splitter (handles quoted commas)
    const splitLine = (line) => {
      const vals = []; let cur = '', inQ = false;
      for (const c of line) {
        if (c === '"') { inQ = !inQ; }
        else if (c === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
        else cur += c;
      }
      vals.push(cur.trim());
      return vals;
    };

    const rawLines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (rawLines.length < 2) { setImportNotice('Need at least a header row and one data row.'); return; }

    // SurveyMonkey uses 2 header rows: row 1 = question text, row 2 = sub-labels/answer choices
    const row1 = splitLine(rawLines[0]);
    const isSmFormat = /respondent|collector|start.?date/i.test(row1.slice(0, 5).join(','));
    let questionRow, subRow, dataLines;
    if (isSmFormat && rawLines.length >= 3) {
      questionRow = splitLine(rawLines[0]);
      subRow      = splitLine(rawLines[1]);
      dataLines   = rawLines.slice(2);
    } else {
      questionRow = row1;
      subRow      = row1.map(() => '');
      dataLines   = rawLines.slice(1);
    }

    const cols = questionRow.map((q, i) => ({ q: q.trim(), sub: (subRow[i] || '').trim(), i }));

    // Find NPS column (recommend + 0-10 range)
    const npsCol = cols.find(c =>
      /recommend|nps|promoter/i.test(c.q + c.sub) ||
      (/0.{1,6}10|10.{1,6}0/.test(c.q) && !/time|minute|hour/i.test(c.q))
    );

    // Find satisfaction columns
    const satisfCols = cols.filter(c =>
      /satisf|experience|overall|care|staff|treatment|service/i.test(c.q + c.sub) &&
      (!npsCol || c.i !== npsCol.i)
    );

    // Skip metadata columns
    const metaRx = /respondent|collector|start date|end date|ip address|email|first name|last name|custom data/i;

    const responses = dataLines
      .map(splitLine)
      .filter(row => row.some(v => v !== ''))
      .map(row => {
        const obj = { respondentId: row[0] || '', date: row[2] || '' };
        if (npsCol != null) { const n = parseInt(row[npsCol.i]); if (!isNaN(n)) obj.npsScore = n; }
        if (satisfCols.length > 0) { const s = parseFloat(row[satisfCols[0].i]); if (!isNaN(s)) obj.satisfaction = s; }
        cols.forEach(c => { obj[`_q${c.i}`] = row[c.i] ?? ''; });
        return obj;
      });

    if (responses.length === 0) { setImportNotice('No response rows found. Make sure your export includes data rows.'); return; }

    // NPS calc
    const npsVals = responses.map(r => r.npsScore).filter(n => n != null && n >= 0 && n <= 10);
    let npsScore     = null;
    let npsBreakdown = null;
    if (npsVals.length > 0) {
      const promoters  = npsVals.filter(n => n >= 9).length;
      const passives   = npsVals.filter(n => n >= 7 && n <= 8).length;
      const detractors = npsVals.filter(n => n <= 6).length;
      npsScore     = Math.round(((promoters - detractors) / npsVals.length) * 100);
      npsBreakdown = { promoters, passives, detractors };
    }

    // Avg satisfaction
    const satisfVals = responses.map(r => r.satisfaction).filter(n => n != null && !isNaN(n) && n >= 1);
    const avgSatisfaction = satisfVals.length > 0
      ? (satisfVals.reduce((s, v) => s + v, 0) / satisfVals.length).toFixed(1)
      : null;

    // Question breakdown (skips metadata)
    const questionBreakdown = cols
      .filter(c => c.q && !metaRx.test(c.q))
      .slice(0, 12)
      .map(c => {
        const vals    = responses.map(r => r[`_q${c.i}`]).filter(v => v);
        const numVals = vals.map(v => parseFloat(v)).filter(n => !isNaN(n));
        const avg     = numVals.length > 0 ? (numVals.reduce((s, v) => s + v, 0) / numVals.length).toFixed(1) : null;
        // Top text answers (open-ended)
        const textMap = {};
        vals.filter(v => isNaN(parseFloat(v))).forEach(v => { textMap[v] = (textMap[v] || 0) + 1; });
        const topAnswers = Object.entries(textMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([answer, count]) => ({ answer, count }));
        return { question: (c.q + (c.sub ? ' — ' + c.sub : '')).slice(0, 100), responseCount: vals.length, avg, topAnswers };
      });

    setSurveyParsed({
      importedAt:      new Date().toISOString(),
      totalResponses:  responses.length,
      npsScore,
      npsBreakdown,
      avgSatisfaction,
      questionBreakdown,
      _raw: responses.slice(0, 100),
    });
  };

  const confirmSaveSurvey = () => {
    if (!surveyParsed) return;
    const entry = { ...surveyParsed, _savedAt: new Date().toLocaleString() };
    setManualData(prev => {
      const updated = { ...prev, survey_results: [entry, ...(prev.survey_results || [])] };
      localStorage.setItem('dmd_manual', JSON.stringify(updated));
      return updated;
    });
    setImportNotice(`\u2705 Survey imported — ${surveyParsed.totalResponses} responses, NPS ${surveyParsed.npsScore ?? 'n/a'}`);
    setSurveyParsed(null);
    setPasteCSV('');
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

  // ── AI data analysis — Sir Clicks-a-Lot reads your imported data ────────────
  const analyzeData = async () => {
    setAiInsightsLoading(true);
    setAiInsights('');
    const adSpend   = manualData.ad_spend    || [];
    const emails    = manualData.email_stats || [];
    const seo       = manualData.seo_rankings || [];
    const social    = manualData.social_metrics || [];
    const reviews   = manualData.reviews || [];
    const tiktok    = manualData.tiktok_posts || [];
    const totalSpend = adSpend.reduce((s, e) => s + (Number(e.spend) || 0), 0);
    const totalLeads = adSpend.reduce((s, e) => s + (Number(e.leads) || 0), 0);
    const cpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : 'N/A';
    const platformRatings = Object.entries(reviewPlatformData)
      .filter(([, p]) => p.rating && Number(p.rating) > 0)
      .map(([k, p]) => `${k}: ${p.rating}★ (${p.count || '?'} reviews)`)
      .join(', ') || 'none entered';
    const wixSess   = wixData?.sessions   || '—';
    const wixBounce = wixData?.bounceRate ? wixData.bounceRate + '%' : '—';
    const googleRating = destinyData?.bestRating?.rating || destinyData?.googleSearch?.rating || destinyData?.google?.rating || 'not yet fetched';
    const summary = [
      `Business: Destiny Springs Healthcare — mental health clinic, Scottsdale AZ`,
      `Google/auto rating: ${googleRating}`,
      `Platform ratings: ${platformRatings}`,
      `Ad spend records: ${adSpend.length} entries | total spend: $${totalSpend.toFixed(0)} | total leads: ${totalLeads} | cost per lead: $${cpl}`,
      `Email campaigns: ${emails.length} records`,
      `SEO keyword records: ${seo.length}`,
      `Social metric records: ${social.length}`,
      `Review entries: ${reviews.length}`,
      `TikTok posts tracked: ${tiktok.length}`,
      `Website sessions (Wix): ${wixSess} | Bounce rate: ${wixBounce}`,
      `Files imported: ${fileImportLog.length} uploads on record`,
    ].join('\n');
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You are Captain KPI 🫡 — a witty but sharp marketing analytics assistant for Destiny Springs Healthcare (mental health clinic, Scottsdale AZ). Analyze the dashboard data and provide 5-7 concise bullet-point insights with specific, actionable recommendations. Be direct and occasionally funny but genuinely useful. Use bullet points (•) for each insight.',
          messages: [{ role: 'user', content: `Here is the current Destiny Springs Healthcare marketing dashboard data:\n\n${summary}\n\nProvide your analysis of what's working, what needs attention, and your top action items.` }],
        }),
      });
      const { reply, error } = await r.json();
      setAiInsights(error ? `⚠️ ${error}` : reply);
    } catch {
      setAiInsights('⚠️ Could not reach AI. Make sure GEMINI_API_KEY is set in Vercel environment variables. Get a free key at aistudio.google.com');
    }
    setAiInsightsLoading(false);
  };

  // ── Sir Clicks-a-Lot chat message sender ────────────────────────────────────
  const sendChatMessage = async (prefill) => {
    const text = (prefill || chatInput).trim();
    if (!text || chatLoading) return;
    const userMsg = { role: 'user', content: text };
    const updatedMsgs = [...chatMessages, userMsg];
    setChatMessages(updatedMsgs);
    setChatInput('');
    setChatLoading(true);

    // ── Build rich context snapshot for Captain KPI ──────────────────────────
    const adSpend    = manualData.ad_spend || [];
    const totalSpend = adSpend.reduce((s, e) => s + (Number(e.spend) || 0), 0);
    const totalLeads = adSpend.reduce((s, e) => s + (Number(e.leads) || 0), 0);
    const googleRating = destinyData?.bestRating?.rating || destinyData?.googleSearch?.rating || destinyData?.google?.rating || 'unknown';

    // Live integration snapshots (computed inline because they are defined after this fn in render order)
    const _meta  = liveData['Meta Business Suite']  || {};
    const _tik   = liveData['TikTok for Business']  || {};
    const _mail  = liveData['Mailchimp']             || {};
    const _ga    = liveData['Google Analytics']      || {};
    const _wix   = (wixData?.sessions) ? wixData : (liveData['Wix Analytics'] || {});
    const _yt    = liveData['YouTube Analytics']     || {};
    const _yelp  = liveData['Yelp Reviews']          || {};
    const _gb    = liveData['Google Business']       || {};

    // Social metrics from manual data
    const socialRows = (manualData.social_metrics || []).slice(-3);

    // Wix / GA traffic sources
    const trafficSources = [
      _wix.organic   != null ? `organic search ${_wix.organic}%`  : null,
      _wix.social    != null ? `social media ${_wix.social}%`     : null,
      _wix.direct    != null ? `direct ${_wix.direct}%`           : null,
      _wix.referral  != null ? `referral ${_wix.referral}%`       : null,
    ].filter(Boolean).join(', ');

    // Competitor / referral intel
    const competitors = (competitorData?.competitors || []).slice(0, 5).map(c => c.name || c.url).join(', ');
    const savedUrlsStr = (savedUrls || []).slice(0, 8).map(u => u.url || u).join(', ');

    // Reviews breakdown
    const platformReviewStr = Object.entries(reviewPlatformData)
      .filter(([, v]) => v?.rating)
      .map(([k, v]) => `${k} ${v.rating}★ (${v.count || '?'} reviews)`)
      .join(', ');

    // Destiny Springs auto-profile data
    const dsPhone   = destinyData?.website?.phone     || destinyData?.phone     || 'not loaded';
    const dsAddr    = destinyData?.website?.address   || destinyData?.address   || 'not loaded';
    const dsServices = (destinyData?.website?.services || destinyData?.services || []).slice(0, 8).join(', ') || 'not loaded';
    const dsSocials = destinyData?.socials ? Object.entries(destinyData.socials).map(([k, v]) => `${k}: ${v}`).join(', ') : 'not loaded';
    const dsKeywords = destinyData?.website?.keywords || destinyData?.keywords  || 'not loaded';
    const dsReviews  = destinyData?.google?.reviewCount || destinyData?.bestRating?.reviewCount || 'unknown';

    // Recent news saved
    const newsStr = (newsItems || []).slice(0, 3).map(n => n.title).join(' | ');

    const systemPrompt = `You are Captain KPI 🫡 — a witty, sharp, and occasionally hilarious marketing analytics assistant built into the Destiny Springs Healthcare marketing dashboard. Destiny Springs is a behavioral health / mental health clinic in Scottsdale/Surprise AZ. Be helpful, specific, and occasionally funny but always professional. Keep responses under 250 words unless asked for more. Use bullet points for lists.

══ LIVE DASHBOARD DATA ══

BUSINESS PROFILE:
- Phone: ${dsPhone} | Address: ${dsAddr}
- Google rating: ${googleRating} (${dsReviews} reviews)
- Services offered: ${dsServices}
- Keywords tracked: ${dsKeywords}
- Social profiles: ${dsSocials}

REVIEW PLATFORM SCORES:
${platformReviewStr || 'No platform review data loaded yet — user can fetch from Reviews tab.'}

WEBSITE TRAFFIC (Wix/GA4):
- Sessions: ${_wix.sessions || _ga.sessions || '—'}
- Bounce rate: ${_wix.bounceRate || _ga.bounceRate || '—'}%
- Avg session duration: ${_ga.avgDuration || '—'}
- New users: ${_ga.newUsers || '—'}
- Traffic sources: ${trafficSources || 'not loaded — user can enter in Settings → Wix Analytics fields'}
- Conversions: ${_ga.conversions || '—'}

FACEBOOK / INSTAGRAM (Meta Business Suite):
- Page fans/likes: ${_meta.fanCount || _meta.fans || '—'}
- Instagram followers: ${_meta.instagramFollowers || '—'}
- Recent FB posts: ${(_meta.fbPosts || []).length > 0 ? `${_meta.fbPosts.length} loaded, top post ${_meta.fbPosts[0]?.likes || 0} likes` : 'not loaded'}
- Recent IG posts: ${(_meta.igPosts || []).length > 0 ? `${_meta.igPosts.length} loaded` : 'not loaded'}
- Connected: ${connections['Meta Business Suite']?.connected ? 'yes' : 'no'}

TIKTOK:
- Followers: ${_tik.followers || '—'} | Videos: ${_tik.videoCount || '—'} | Total views: ${_tik.totalViews || '—'}
- Connected: ${connections['TikTok for Business']?.connected ? 'yes' : 'no'}

EMAIL (Mailchimp):
- List: ${_mail.listName || '—'} | Subscribers: ${_mail.subscribers || '—'}
- Open rate: ${_mail.openRate || '—'} | Click rate: ${_mail.clickRate || '—'}
- Total campaigns: ${_mail.totalCampaigns || '—'}
- Connected: ${connections['Mailchimp']?.connected ? 'yes' : 'no'}

YOUTUBE: subscribers ${_yt.subscribers || '—'}, views ${_yt.totalViews || '—'}
YELP: ${_yelp.rating ? `${_yelp.rating}★ (${_yelp.reviewCount || '?'} reviews)` : 'not connected'}
GOOGLE BUSINESS: searches ${_gb.searches || '—'}, direction requests ${_gb.directionRequests || '—'}

PAID ADS: ${adSpend.length} records, total $${totalSpend.toFixed(0)} spend, ${totalLeads} leads${totalLeads > 0 ? `, CPL $${(totalSpend/totalLeads).toFixed(0)}` : ''}

CONTENT CALENDAR: ${contentItems?.length || 0} items scheduled
SOCIAL METRICS (last 3 entries): ${socialRows.length > 0 ? socialRows.map(r => `${r.platform || ''} ${r.month || ''}: followers ${r.followers || '—'}, reach ${r.reach || '—'}`).join(' | ') : 'none entered'}
COMPETITOR INTEL: ${competitors || 'not loaded'}
SAVED INTEL URLS: ${savedUrlsStr || 'none'}
RECENT NEWS: ${newsStr || 'none loaded'}

POTENTIAL REFERRAL SOURCES TO SUGGEST (even without live data):
- Primary care physicians, psychiatrists, therapists in Scottsdale/Surprise/Peoria AZ
- Employee Assistance Programs (EAPs): Aetna, UHC, CIGNA
- AZ DES / ADHS (Arizona behavioral health referrals)
- VA (veterans mental health referrals) — VA Phoenix HCS
- Schools/universities: ASU, GCU, Maricopa Community Colleges
- Hospitals: HonorHealth, Banner Health, Dignity Health in the West Valley
- Crisis lines: 988 Suicide & Crisis Lifeline — can cross-refer
- Online directories: Psychology Today, SAMHSA locator, ZocDoc, Headway
- Insurance case managers: BCBS AZ, Mercy Care, UHC Community Plan
- Faith communities, community health centers, FQHC partners in Maricopa County

Always give actionable, specific suggestions. You HAVE the data above — use it. Never say you lack access to data.`;

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: updatedMsgs.slice(-12),
        }),
      });
      const { reply, error } = await r.json();
      setChatMessages(m => [...m, { role: 'assistant', content: error ? `Oops: ${error}` : reply }]);
    } catch {
      setChatMessages(m => [...m, { role: 'assistant', content: "My circuits are jammed! 🔧 Make sure GEMINI_API_KEY is set in your Vercel project. Get a free key at aistudio.google.com — I'll be back once fed." }]);
    }
    setChatLoading(false);
  };

  const savePlatformData = (platformKey) => {
    const updated = {
      ...reviewPlatformData,
      [platformKey]: {
        ...reviewPlatformData[platformKey],
        rating: reviewPlatformForm.rating,
        count:  reviewPlatformForm.count,
        url:    reviewPlatformForm.url,
        source: 'manual',
      },
    };
    setReviewPlatformData(updated);
    localStorage.setItem('dmd_review_platforms', JSON.stringify(updated));
    setReviewPlatformForm({ editingPlatform: null, rating: '', count: '', url: '' });
  };

  const fetchPlatformReviews = async (platformKey) => {
    setReviewFetchingPlatform(platformKey);
    try {
      // Pass any stored integration credentials to the server scraper
      const params = new URLSearchParams({ platform: platformKey });
      if (platformKey === 'google') {
        const c = connections['Google Business'] || {};
        if (c.apiKey)  params.set('apiKey',   c.apiKey);
        if (c.placeId) params.set('placeId',  c.placeId);
      }
      if (platformKey === 'yelp') {
        const c = connections['Yelp Reviews'] || {};
        if (c.apiKey)     params.set('apiKey',      c.apiKey);
        if (c.businessId) params.set('businessId',  c.businessId);
      }
      if (platformKey === 'facebook') {
        const c = connections['Meta Business Suite'] || {};
        if (c.accessToken) params.set('accessToken', c.accessToken);
        if (c.pageId)      params.set('pageId',      c.pageId);
      }
      const r = await fetch(`/api/reviews?${params.toString()}`);
      const d = await r.json();
      if (!d.ok) {
        const updated = {
          ...reviewPlatformData,
          [platformKey]: {
            ...reviewPlatformData[platformKey],
            ...(d.url ? { url: d.url } : {}),
            source:     reviewPlatformData[platformKey]?.source || 'error',
            fetchedAt:  d.fetchedAt || new Date().toISOString(),
            fetchError: d.error || 'Fetch failed',
          },
        };
        setReviewPlatformData(updated);
        localStorage.setItem('dmd_review_platforms', JSON.stringify(updated));
        return;
      }
      const updated = {
        ...reviewPlatformData,
        [platformKey]: {
          ...reviewPlatformData[platformKey],
          rating:     String(d.rating ?? ''),
          count:      String(d.reviewCount ?? ''),
          url:        d.url || reviewPlatformData[platformKey]?.url || '',
          source:     'live',
          fetchedAt:  d.fetchedAt,
          fetchError: null,
        },
      };
      setReviewPlatformData(updated);
      localStorage.setItem('dmd_review_platforms', JSON.stringify(updated));
    } catch (e) {
      const updated = {
        ...reviewPlatformData,
        [platformKey]: {
          ...reviewPlatformData[platformKey],
          source:     reviewPlatformData[platformKey]?.source || 'error',
          fetchedAt:  new Date().toISOString(),
          fetchError: e.message,
        },
      };
      setReviewPlatformData(updated);
      localStorage.setItem('dmd_review_platforms', JSON.stringify(updated));
    } finally {
      setReviewFetchingPlatform(null);
    }
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

  // Auto-run Destiny Springs profile sync on load + every 60 min while tab is open
  useEffect(() => {
    const STALE_MS  = 60 * 60 * 1000; // 1 hour
    const POLL_MS   = 60 * 60 * 1000; // re-poll every 1 hour while page is open
    const existing  = (() => { try { return JSON.parse(localStorage.getItem('dmd_destiny') || 'null'); } catch { return null; } })();
    const scrapedAt = existing?.fetchedAt ? new Date(existing.fetchedAt).getTime() : 0;
    const isStale   = !scrapedAt || (Date.now() - scrapedAt) > STALE_MS;
    if (isStale) fetchDestinyProfile();
    // Keep refreshing every hour while the dashboard is open
    const timer = setInterval(fetchDestinyProfile, POLL_MS);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fetch Competitor Intelligence on load + every 2 hours
  useEffect(() => {
    const STALE_MS = 2 * 60 * 60 * 1000; // 2 hours
    const existing = (() => { try { return JSON.parse(localStorage.getItem('dmd_competitors') || 'null'); } catch { return null; } })();
    const fetchedAt = existing?.fetchedAt ? new Date(existing.fetchedAt).getTime() : 0;
    if (!fetchedAt || (Date.now() - fetchedAt) > STALE_MS) fetchCompetitors();
    const timer = setInterval(fetchCompetitors, STALE_MS);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps ─────────────────────────────────────────────────────────────
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
  const _wixLive    = (wixData && wixData.sessions) ? wixData : (liveData['Wix Analytics'] || {});
  const _tikLive    = liveData['TikTok for Business'] || {};
  const _mailLive   = liveData['Mailchimp']           || {};
  const _gaLive     = liveData['Google Analytics']    || {};
  const _socialLive = liveData['_social']             || {};
  const _fbLive     = _socialLive.facebook            || {};
  const _igLive     = _socialLive.instagram           || {};
  const _ttLive     = _socialLive.tiktok              || {};
  const _liLive     = _socialLive.linkedin            || {};
  const _platformEntries = Object.values(reviewPlatformData).filter(p => p.count && Number(p.count) > 0);
  const _totalReviewCount = _platformEntries.length
    ? _platformEntries.reduce((s, p) => s + (Number(p.count) || 0), 0)
    : _reviews.length;
  const _weightedRating = _platformEntries.length
    ? (_platformEntries.reduce((s, p) => s + (Number(p.rating) || 0) * (Number(p.count) || 0), 0) / Math.max(_totalReviewCount, 1)).toFixed(1)
    : null;
  const _avgRating = _weightedRating || (_reviews.length ? (_reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / _reviews.length).toFixed(1) : null);
  const _bestPlatform = _platformEntries.length
    ? Object.entries(reviewPlatformData).filter(([,p])=>p.count&&Number(p.count)>0).sort((a,b)=>(Number(b[1].rating)||0)-(Number(a[1].rating)||0))[0]
    : null;
  const _mostReviewsPlatform = _platformEntries.length
    ? Object.entries(reviewPlatformData).filter(([,p])=>p.count&&Number(p.count)>0).sort((a,b)=>(Number(b[1].count)||0)-(Number(a[1].count)||0))[0]
    : null;
  const _totalLeads = _adSpend.reduce((s, e) => s + (Number(e.leads) || 0), 0);
  const _totalSpend = _adSpend.reduce((s, e) => s + (Number(e.spend) || 0), 0);
  const _latestSocial = {};
  _socialMet.forEach(e => { if (!_latestSocial[e.platform] || (e.month || '') > (_latestSocial[e.platform].month || '')) _latestSocial[e.platform] = e; });
  const _latestSurvey = (manualData.survey_results || [])[0] || null;
  // Patch placeholder metrics with computed values
  Object.assign(metrics, {
    googleScore:        (() => {
      if (_avgRating) return _avgRating + ' ★';
      const dsRating = destinyData?.google?.rating ?? destinyData?.googleSearch?.rating ?? destinyData?.bestRating?.rating;
      return dsRating ? Number(dsRating).toFixed(1) + ' ★' : '—';
    })(),
    nps:                _latestSurvey?.npsScore != null ? String(_latestSurvey.npsScore) : '—',
    videoViews:         _tikLive.recentViews  ? Number(_tikLive.recentViews).toLocaleString()  : '—',
    tiktokVelocity:     (_tiktokPosts.length  || _tikLive.recentPosts) ? String(_tiktokPosts.length || _tikLive.recentPosts) : '—',
    socialPostsMonthly: _socialMet.reduce((s, e) => s + (Number(e.posts) || 0), 0) || '—',
    wixSessions:        _gaLive.sessions    ? Number(_gaLive.sessions).replace?.(/,/g,'') ? _gaLive.sessions : String(Number(_gaLive.sessions)).toLocaleString()
                      : _wixLive.sessions   ? Number(_wixLive.sessions).toLocaleString()  : '—',
    wixBounceRate:      _gaLive.bounceRate  ? _gaLive.bounceRate
                      : _wixLive.bounceRate ? _wixLive.bounceRate + '%'                   : '—',
    emailOpenRate:      _mailLive.openRate  ? _mailLive.openRate
                      : _emailStats.length  ? (_emailStats.reduce((s, e) => s + (e.sent ? Number(e.opened || 0) / Number(e.sent) : 0), 0) / _emailStats.length * 100).toFixed(1) + '%' : '—',
    costPerLead:        (_totalSpend && _totalLeads) ? '$' + (_totalSpend / _totalLeads).toFixed(0) : '—',
    totalLeads:         _totalLeads || '—',
    siteConversion:     (() => {
      const sessions = Number((_gaLive.sessions || _wixLive.sessions || '').toString().replace(/,/g, ''));
      return (sessions > 0 && _totalLeads > 0)
        ? (_totalLeads / sessions * 100).toFixed(2) + '%'
        : '—';
    })(),
  });

  // ── Monthly Trend (from ad spend + social manual entries) ────────────────────
  const _trendMap = {};
  _socialMet.forEach(e => { if (!e.month) return; if (!_trendMap[e.month]) _trendMap[e.month] = { month: e.month, sessions: 0, reach: 0, leads: 0 }; _trendMap[e.month].reach += Number(e.reach || 0); });
  _adSpend.forEach(e  => { if (!e.month) return; if (!_trendMap[e.month]) _trendMap[e.month] = { month: e.month, sessions: 0, reach: 0, leads: 0 }; _trendMap[e.month].leads += Number(e.leads || 0); });
  const monthlyTrend = Object.values(_trendMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);

  // ── Social Analytics ─────────────────────────────────────────────────────────
  const socialAnalytics = [
    { platform: 'Facebook',  color: '#1877F2', reach: Number(_latestSocial['Facebook']?.reach  || _metaLive.reach   || 0), engagement: Number(_latestSocial['Facebook']?.engagement  || 0), clicks: Number(_latestSocial['Facebook']?.clicks  || 0), followers: Number(_fbLive.followers || _latestSocial['Facebook']?.followers  || _metaLive.fanCount || 0), posts: null,  videos: null, totalLikes: Number(_fbLive.likes     || 0) },
    { platform: 'Instagram', color: '#E4405F', reach: Number(_latestSocial['Instagram']?.reach || 0),                      engagement: Number(_latestSocial['Instagram']?.engagement || 0), clicks: Number(_latestSocial['Instagram']?.clicks || 0), followers: Number(_igLive.followers || _metaLive.instagramFollowers || _latestSocial['Instagram']?.followers || 0), posts: Number(_igLive.posts || _metaLive.instagramPosts || 0), videos: null, totalLikes: null },
    { platform: 'LinkedIn',  color: '#0A66C2', reach: Number(_latestSocial['LinkedIn']?.reach  || 0),                      engagement: Number(_latestSocial['LinkedIn']?.engagement  || 0), clicks: Number(_latestSocial['LinkedIn']?.clicks  || 0), followers: Number(_liLive.followers || _latestSocial['LinkedIn']?.followers  || 0), posts: null, videos: null, totalLikes: null },
    { platform: 'TikTok',    color: '#00f2ea', reach: Number(_latestSocial['TikTok']?.reach    || _tikLive.recentViews || 0), engagement: 0, clicks: 0, followers: Number(_ttLive.followers || _tikLive.followers || _latestSocial['TikTok']?.followers || 0), posts: null, videos: Number(_ttLive.videos || _tikLive.videos || 0), totalLikes: Number(_ttLive.likes || _tikLive.totalLikes || 0) },
  ];

  // ── Weekly Engagement Trend ──────────────────────────────────────────────────
  const weeklyEngagement = [];

  // ── Wix Traffic Sources ──────────────────────────────────────────────────────
  const wixSources = [
    { name: 'Organic Search', value: Number(_wixLive.organic)  || 0, color: '#0d9488' },
    { name: 'Social Media',   value: Number(_wixLive.social)   || 0, color: '#8b5cf6' },
    { name: 'Direct',         value: Number(_wixLive.direct)   || 0, color: '#10b981' },
    { name: 'Referral',       value: Number(_wixLive.referral) || 0, color: '#f59e0b' },
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

  // ── NPS Breakdown — pulls from latest imported survey if available ───────────
  const npsData = _latestSurvey?.npsBreakdown ? [
    { name: 'Promoters',  value: _latestSurvey.npsBreakdown.promoters,  color: '#10b981' },
    { name: 'Passives',   value: _latestSurvey.npsBreakdown.passives,   color: '#f59e0b' },
    { name: 'Detractors', value: _latestSurvey.npsBreakdown.detractors, color: '#ef4444' },
  ] : [
    { name: 'Promoters',  value: 0, color: '#10b981' },
    { name: 'Passives',   value: 0, color: '#f59e0b' },
    { name: 'Detractors', value: 0, color: '#ef4444' },
  ];

  // ── Upcoming Tasks ────────────────────────────────────────────────────────────
  const pipeline = [];

  // ── My Achievements data ────────────────────────────────────────────────────
  const myStats = [
    { label: 'Blogs Written',    value: 0,                                                        icon: FileText,  color: 'text-purple-500', target: 0 },
    { label: 'TikToks Produced', value: _tiktokPosts.length,                                      icon: PlayCircle,color: 'text-pink-500',   target: 0 },
    { label: 'Social Posts',     value: _socialMet.reduce((s,e)=>s+(Number(e.posts)||0),0),       icon: Share2,    color: 'text-blue-500',   target: 0 },
    { label: 'Email Campaigns',  value: _emailStats.length,                                       icon: Mail,      color: 'text-teal-500',   target: 0 },
    { label: 'Website Updates',  value: 0,                                                        icon: Globe,     color: 'text-emerald-500',target: 0 },
    { label: 'Reviews Managed',  value: _reviews.length,                                          icon: Star,      color: 'text-amber-500',  target: 0 },
  ];

  const _ratingNum = _avgRating ? Number(_avgRating) : null;
  const milestones = [
    { title: 'Content Machine',    desc: 'Publish milestone blogs',         icon: FileText,  earned: false,                              date: 'Upcoming' },
    { title: 'TikTok Trailblazer', desc: 'Reach video view milestone',      icon: PlayCircle,earned: _tiktokPosts.length >= 4,           date: _tiktokPosts.length >= 4 ? 'Achieved' : 'Upcoming' },
    { title: 'SEO Climber',        desc: 'Rank top 5 on target keywords',   icon: Search,    earned: seoKeywords.some(k=>k.pos > 0 && k.pos <= 5), date: seoKeywords.some(k=>k.pos > 0 && k.pos <= 5) ? 'Achieved' : 'Upcoming' },
    { title: 'Lead Magnet',        desc: 'Hit monthly lead goal',           icon: Target,    earned: _totalLeads >= 50,                  date: _totalLeads >= 50 ? 'Achieved' : 'Upcoming' },
    { title: 'Review Reviver',     desc: 'Improve Google rating',           icon: Star,      earned: !!(_ratingNum && _ratingNum >= 4.0), date: (_ratingNum && _ratingNum >= 4.0) ? 'Achieved' : 'Upcoming' },
    { title: '5-Star Elite',       desc: 'Maintain 4.5+ avg 60 days',      icon: Award,     earned: !!(_ratingNum && _ratingNum >= 4.5), date: (_ratingNum && _ratingNum >= 4.5) ? 'Achieved' : 'Upcoming' },
    { title: 'Viral Moment',       desc: '50k+ video views / month',       icon: Zap,       earned: Number(_tikLive.recentViews || 0) >= 50000, date: Number(_tikLive.recentViews || 0) >= 50000 ? 'Achieved' : 'Upcoming' },
    { title: 'Growth Architect',   desc: '500+ monthly leads',             icon: TrendingUp,earned: _totalLeads >= 500,                 date: _totalLeads >= 500 ? 'Achieved' : 'Upcoming' },
  ];

  const skillRadar = [
    { skill: 'SEO',          score: Math.min(100, seoKeywords.length * 20) },
    { skill: 'Social Media', score: Math.min(100, _socialMet.length * 15 + (socialAnalytics.some(p=>p.followers>0) ? 25 : 0)) },
    { skill: 'Content',      score: Math.min(100, _tiktokPosts.length * 10) },
    { skill: 'Email Mktg',   score: Math.min(100, _emailStats.length * 20 + (_mailLive.subscribers ? 30 : 0)) },
    { skill: 'Paid Ads',     score: Math.min(100, _adSpend.length * 15) },
    { skill: 'Web Design',   score: destinyData?.website?.wordCount > 1000 ? 60 : destinyData?.website ? 30 : 0 },
    { skill: 'Analytics',    score: (_gaLive.sessions || _wixLive.sessions) ? 80 : 0 },
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
  const calendarTypes = ['All', 'Blog', 'Social', 'TikTok', 'Email'];
  const filteredContent = calFilter === 'All' ? contentItems : contentItems.filter(c => c.type === calFilter);

  // ── Calendar view helpers ─────────────────────────────────────────────────
  const parseItemDate = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr + 'T12:00:00');
    const m = dateStr.match(/(\d+)/);
    if (m) {
      const [yr, mo] = calViewDate.split('-');
      const dt = new Date(Number(yr), Number(mo) - 1, parseInt(m[1], 10), 12, 0, 0);
      return isNaN(dt.getTime()) ? null : dt;
    }
    return null;
  };
  const _calAnchor     = new Date(calViewDate + 'T12:00:00');
  const _calYear       = _calAnchor.getFullYear();
  const _calMonth      = _calAnchor.getMonth();
  const _calDaysInMonth = new Date(_calYear, _calMonth + 1, 0).getDate();
  const _calFirstDow   = new Date(_calYear, _calMonth, 1).getDay();
  const _calWeekStart  = (() => { const d = new Date(_calAnchor); d.setDate(_calAnchor.getDate() - _calAnchor.getDay()); return d; })();
  const _calWeekDays   = Array.from({ length: 7 }, (_, i) => { const d = new Date(_calWeekStart); d.setDate(_calWeekStart.getDate() + i); return d; });
  const _calToday      = (() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; })();
  const _calNavLabel   = calView === 'week'
    ? `${_calWeekDays[0].toLocaleDateString('default', { month: 'short', day: 'numeric' })} – ${_calWeekDays[6].toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : _calAnchor.toLocaleString('default', { month: 'long', year: 'numeric' });
  const navigateCal = (dir) => {
    const d = new Date(calViewDate + 'T12:00:00');
    if (calView === 'month') { d.setDate(1); d.setMonth(d.getMonth() + dir); }
    else { d.setDate(d.getDate() + dir * 7); }
    setCalViewDate(d.toISOString().slice(0, 10));
  };

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

      {/* Mobile overlay backdrop */}
      {mobileNavOpen && <div className="sidebar-overlay" onClick={() => setMobileNavOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`sidebar no-print ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileNavOpen ? 'sidebar-mobile-open' : ''}`}>

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
              onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false); }}
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
          <button className="mobile-menu-btn" onClick={() => setMobileNavOpen(o => !o)} aria-label="Open navigation">
            <Menu size={19} />
          </button>
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
            {cloudSynced === 'loading'  && <div className="topbar-live" style={{borderColor:'rgba(99,102,241,0.3)',background:'rgba(99,102,241,0.07)',color:'#818cf8'}}><RefreshCw size={10} className="animate-spin" /><span>Connecting</span></div>}
            {cloudSynced === 'ok'       && <div className="topbar-live"><div className="live-dot" /><span>Synced</span></div>}
            {cloudSynced === 'syncing'  && <div className="topbar-live" style={{borderColor:'rgba(99,102,241,0.3)',background:'rgba(99,102,241,0.07)',color:'#818cf8'}}><RefreshCw size={10} className="animate-spin" /><span>Saving…</span></div>}
            {(cloudSynced === 'error' || cloudSynced === 'offline') && (
              <button
                onClick={async () => {
                  setShowDbDiag(true);
                  setDbDiag(null);
                  setDbDiagLoading(true);
                  try {
                    const r = await fetch('/api/data?action=status');
                    const d = await r.json();
                    setDbDiag(d);
                  } catch (e) {
                    setDbDiag({ status: 'fetch_failed', error: e.message });
                  }
                  setDbDiagLoading(false);
                }}
                className="topbar-live cursor-pointer hover:opacity-80 transition-opacity"
                style={cloudSynced === 'offline'
                  ? {borderColor:'rgba(148,163,184,0.2)',background:'rgba(148,163,184,0.07)',color:'#94a3b8'}
                  : {borderColor:'rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.07)',color:'#f87171'}}
                title="Click to diagnose database connection"
              >
                <WifiOff size={10} />
                <span>{cloudSynced === 'offline' ? 'Local only' : 'Sync error'} — tap to fix</span>
              </button>
            )}
            {/* DB Diagnostic Modal */}
            {showDbDiag && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)'}} onClick={() => setShowDbDiag(false)}>
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white font-black text-lg">Database Connection</h2>
                    <button onClick={() => setShowDbDiag(false)} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                  </div>
                  {dbDiagLoading && <p className="text-slate-400 text-sm">Running diagnostics…</p>}
                  {dbDiag && (() => {
                    const connected = dbDiag.envCheck?.connected;
                    const hasKvUrl  = dbDiag.envCheck?.KV_REST_API_URL || dbDiag.envCheck?.UPSTASH_REDIS_REST_URL;
                    const hasKvTok  = dbDiag.envCheck?.KV_REST_API_TOKEN || dbDiag.envCheck?.UPSTASH_REDIS_REST_TOKEN;
                    return (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-2xl text-sm font-bold ${
                          connected ? 'bg-teal-900/40 text-teal-300 border border-teal-700/40'
                                    : 'bg-red-900/40 text-red-300 border border-red-700/40'}`}>
                          {connected ? '✅ Connected to Upstash Redis' : '❌ Not connected — env vars missing'}
                        </div>
                        <div className="space-y-2">
                          {[['KV_REST_API_URL', dbDiag.envCheck?.KV_REST_API_URL], ['KV_REST_API_TOKEN', dbDiag.envCheck?.KV_REST_API_TOKEN],
                            ['UPSTASH_REDIS_REST_URL', dbDiag.envCheck?.UPSTASH_REDIS_REST_URL], ['UPSTASH_REDIS_REST_TOKEN', dbDiag.envCheck?.UPSTASH_REDIS_REST_TOKEN]]
                            .map(([name, val]) => (
                              <div key={name} className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-mono">{name}</span>
                                <span className={val ? 'text-teal-400 font-bold' : 'text-red-400 font-bold'}>{val ? '✅ set' : '✗ missing'}</span>
                              </div>
                            ))}
                        </div>
                        {!connected && (
                          <div className="p-4 rounded-2xl bg-amber-900/30 border border-amber-700/40 text-amber-200 text-sm space-y-2">
                            <p className="font-black">How to fix:</p>
                            <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                              <li>Go to <strong>vercel.com</strong> → your project</li>
                              <li>Click <strong>Storage</strong> tab → connect your KV database</li>
                              <li>If already connected, go to <strong>Settings → Environment Variables</strong> and confirm <code>KV_REST_API_URL</code> and <code>KV_REST_API_TOKEN</code> are listed</li>
                              <li><strong>Redeploy</strong> the project so the new vars are picked up</li>
                            </ol>
                          </div>
                        )}
                        {connected && (
                          <div className="text-xs text-slate-400">
                            <p>Stored keys: {dbDiag.hash_fields?.length ? dbDiag.hash_fields.join(', ') : 'none yet'}</p>
                            <p>Legacy data: {dbDiag.legacy_exists ? 'found (will be merged on next load)' : 'none'}</p>
                            {dbDiag.resolved_url_prefix && <p className="font-mono">URL: {dbDiag.envCheck?.resolved_url_prefix}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
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
            {/* ── Destiny Springs Live Profile ─────────────────────────────── */}
            {(() => {
              const website   = destinyData?.website;
              const google    = destinyData?.google;         // Places API (needs key)
              const best      = destinyData?.bestRating;     // best available from any source
              const allRatings = destinyData?.allRatings || [];
              const hg        = destinyData?.healthgrades;
              const gSearch   = destinyData?.googleSearch;
              const fetchedAt = destinyData?.fetchedAt;
              // Best rating data to display (Google Places > Google Search > Website Schema > Healthgrades > reviewPlatformData fallback)
              const _rpFallback = (() => {
                const priority = ['google','healthgrades','yelp','zocdoc','glassdoor','indeed'];
                for (const k of priority) {
                  const p = reviewPlatformData[k];
                  if (p?.rating && Number(p.rating) > 0) return { rating: Number(p.rating), reviewCount: p.count ? Number(p.count) : null, source: k.charAt(0).toUpperCase() + k.slice(1) + ' (manual entry)' };
                }
                return null;
              })();
              const displayRating     = google?.rating      ?? best?.rating      ?? _rpFallback?.rating;
              const displayReviews    = google?.reviewCount ?? best?.reviewCount ?? _rpFallback?.reviewCount;
              const displaySource     = google ? 'Google Business (API)' : (best?.source || _rpFallback?.source || null);
              const isManualRating    = !google && !best?.rating && !!_rpFallback?.rating;
              // Inline rating editor helpers (scoped to this render)
              const saveManualRating = (ratingVal, countVal) => {
                if (!ratingVal || isNaN(Number(ratingVal))) return;
                const updated = { ...reviewPlatformData, google: { rating: ratingVal, count: countVal || '' } };
                setReviewPlatformData(updated);
                localStorage.setItem('dmd_review_platforms', JSON.stringify(updated));
              };
              const socialLinks       = website?.socialLinks || {};
              const hasSocialLinks    = Object.keys(socialLinks).length > 0;
              return (
                <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
                  <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                    <SectionHeader icon={Heart} color="text-teal-500" title="Destiny Springs Live Snapshot"
                      subtitle={fetchedAt ? `Auto-syncs hourly · last synced ${new Date(fetchedAt).toLocaleString()}` : 'Syncing automatically every hour — no setup needed'} />
                    <button
                      onClick={fetchDestinyProfile}
                      disabled={destinyLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-colors flex-shrink-0"
                    >
                      <RefreshCw size={14} className={destinyLoading ? 'animate-spin' : ''} />
                      {destinyLoading ? 'Syncing…' : 'Sync Now'}
                    </button>
                  </div>

                  {destinyError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 text-sm text-rose-600 dark:text-rose-400 flex items-center justify-between">
                      <span>{destinyError}</span>
                      <button onClick={() => setDestinyError('')}><X size={14} /></button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ── Ratings / Google column ── */}
                    <div className="space-y-3">
                      <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider flex items-center gap-1.5`}><Star size={11} className="text-amber-500" /> Ratings & Reviews</p>

                      {/* Big rating hero — shows from ANY source, no API key required */}
                      {cloudSynced === 'loading' && !displayRating ? (
                        <div className={`p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center`}>
                          <p className={`text-xs ${subtl}`}>Loading data…</p>
                        </div>
                      ) : displayRating ? (
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 relative">
                          {editingRating ? (
                            <div className="flex-1 flex flex-col items-center gap-2">
                              <p className={`text-xs font-black ${txt}`}>Update Google Rating</p>
                              <div className="flex gap-2">
                                <input value={ratingEditVal} onChange={e=>setRatingEditVal(e.target.value)} placeholder="3.1" maxLength={4}
                                  className={`w-16 text-center text-sm font-black border border-amber-300 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 ${txt}`} />
                                <input value={ratingCountVal} onChange={e=>setRatingCountVal(e.target.value)} placeholder="168" maxLength={6}
                                  className={`w-20 text-center text-sm border border-slate-300 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 ${txt}`} />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => { saveManualRating(ratingEditVal, ratingCountVal); setEditingRating(false); }}
                                  className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-lg">Save</button>
                                <button onClick={() => setEditingRating(false)}
                                  className={`px-3 py-1 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 ${txt}`}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-center flex-shrink-0">
                                <div className="text-5xl font-black text-amber-500 leading-none">{Number(displayRating).toFixed(1)}</div>
                                <div className="flex gap-0.5 justify-center mt-1">
                                  {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s<=Math.round(displayRating)?'text-amber-400 fill-amber-400':'text-slate-300 dark:text-slate-600'} />)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                {displayReviews && <p className={`text-2xl font-black ${txt}`}>{Number(displayReviews).toLocaleString()} <span className={`text-sm font-normal ${subtl}`}>reviews</span></p>}
                                {google?.name && <p className={`text-xs font-black ${txt} mt-0.5 truncate`}>{google.name}</p>}
                                {(google?.vicinity || google?.address) && <p className={`text-xs ${subtl} mt-0.5`}>📍 {google?.vicinity || google?.address}</p>}
                                {google?.phone && <p className={`text-xs ${subtl} mt-0.5`}>📞 {google.phone}</p>}
                                {displaySource && <p className={`text-[10px] ${subtl} mt-1 opacity-70`}>Source: {displaySource}</p>}
                                {google && (
                                  <span className={`inline-flex mt-1.5 items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${
                                    google.isOpen === true  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                    google.isOpen === false ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500' :
                                    'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                  }`}>{google.isOpen === true ? '● Open Now' : google.isOpen === false ? '● Closed' : '● Status Unknown'}</span>
                                )}
                              </div>
                              <button onClick={() => { setRatingEditVal(String(displayRating||'')); setRatingCountVal(String(displayReviews||'')); setEditingRating(true); }}
                                title="Update rating manually" className={`absolute top-2 right-2 p-1.5 rounded-lg ${subtl} hover:text-teal-500 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors`}>
                                <Pencil size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className={`p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50`}>
                          {(destinyLoading || cloudSynced === 'loading')
                            ? <p className={`text-xs ${subtl} text-center`}>Loading data…</p>
                            : (
                              <div>
                                <p className={`text-xs font-black ${txt} mb-1 text-center`}>No rating auto-fetched</p>
                                <p className={`text-[11px] ${subtl} mb-2 text-center`}>Enter manually from your Google Business Profile:</p>
                                <div className="flex gap-2 justify-center">
                                  <input value={ratingEditVal} onChange={e=>setRatingEditVal(e.target.value)} placeholder="3.1 (star)" maxLength={4}
                                    className={`w-24 text-center text-sm border border-slate-300 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 ${txt}`} />
                                  <input value={ratingCountVal} onChange={e=>setRatingCountVal(e.target.value)} placeholder="168 (count)" maxLength={6}
                                    className={`w-28 text-center text-sm border border-slate-300 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 ${txt}`} />
                                  <button onClick={() => saveManualRating(ratingEditVal, ratingCountVal)}
                                    className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-lg">Save</button>
                                </div>
                              </div>
                            )
                          }
                        </div>
                      )}

                      {/* Combined platform ratings — merges auto-scraped + manually-fetched scores */}
                      {(() => {
                        const fetchedScores = Object.entries(reviewPlatformData)
                          .filter(([k, p]) => k !== 'facebook' && p.rating && !isNaN(Number(p.rating)) && Number(p.rating) > 0)
                          .map(([k, p]) => ({ source: k.charAt(0).toUpperCase() + k.slice(1), rating: Number(p.rating), reviewCount: p.count ? Number(p.count) : null }));
                        const fetchedKeys = new Set(fetchedScores.map(p => p.source.toLowerCase()));
                        const autoScores = allRatings.filter(r => r.rating && !fetchedKeys.has(r.source.toLowerCase().split(' ')[0]));
                        const all = [...fetchedScores, ...autoScores];
                        if (!all.length) return null;
                        return (
                          <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50`}>
                            <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-2`}>Platform Ratings</p>
                            <div className="space-y-1.5">
                              {all.map((r, i) => (
                                <div key={i} className="flex items-center justify-between gap-2">
                                  <span className={`text-xs ${subtl} truncate`}>{r.source}</span>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className={`text-sm font-black text-amber-500`}>{Number(r.rating).toFixed(1)} ★</span>
                                    {r.reviewCount && <span className={`text-[11px] ${subtl}`}>({Number(r.reviewCount).toLocaleString()})</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Healthgrades profile link */}
                      {hg?.profileUrl && (
                        <a href={hg.profileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-400 font-black">
                          <ExternalLink size={11} /> View on Healthgrades
                        </a>
                      )}

                      {/* Hours (from Google Places API) */}
                      {google?.hours?.length > 0 && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                          <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-2`}>Business Hours</p>
                          <div className="space-y-0.5">
                            {google.hours.map((h, i) => <p key={i} className={`text-xs ${txt2}`}>{h}</p>)}
                          </div>
                        </div>
                      )}

                      {/* Recent reviews (from Google Places API) */}
                      {google?.reviews?.length > 0 && (
                        <div>
                          <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-2`}>Recent Google Reviews</p>
                          <div className="space-y-2">
                            {google.reviews.slice(0, 3).map((rv, i) => (
                              <div key={i} className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border ${brd}`}>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className={`text-xs font-black ${txt}`}>{rv.author}</span>
                                  <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={9} className={s<=rv.rating?'text-amber-400 fill-amber-400':'text-slate-300 dark:text-slate-600'} />)}
                                  </div>
                                </div>
                                <p className={`text-xs ${subtl} line-clamp-2`}>{rv.text}</p>
                                {rv.relativeTime && <p className={`text-[11px] text-slate-400 dark:text-slate-500 mt-1`}>{rv.relativeTime}</p>}
                              </div>
                            ))}
                          </div>
                          {google.googleUrl && (
                            <a href={google.googleUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 font-black">
                              <ExternalLink size={11} /> View all on Google
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Website + Social column ── */}
                    <div className="space-y-3">
                      <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider flex items-center gap-1.5`}><Globe size={11} className="text-teal-500" /> Website & Social</p>
                      {website ? (
                        <>
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <p className={`font-black text-sm ${txt} mb-1`}>{website.title}</p>
                            {website.description && <p className={`text-xs ${txt2}`}>{website.description}</p>}
                          </div>
                          {website.h1 && (
                            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800">
                              <p className={`text-[11px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1`}>H1</p>
                              <p className={`text-sm font-black text-teal-700 dark:text-teal-300`}>{website.h1}</p>
                            </div>
                          )}
                          {website.h2s?.length > 0 && (
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                              <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-2`}>Page Sections</p>
                              <ul className="space-y-1">
                                {website.h2s.slice(0,6).map((h, i) => <li key={i} className={`text-xs ${txt2}`}>• {h}</li>)}
                              </ul>
                            </div>
                          )}
                          {/* Social links found on the site */}
                          {hasSocialLinks && (
                            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
                              <p className={`text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2`}>Social Profiles Found</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(socialLinks).map(([platform, url]) => (
                                  <a key={platform} href={url} target="_blank" rel="noreferrer"
                                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 capitalize flex items-center gap-1">
                                    <ExternalLink size={9} /> {platform}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          {website.phones?.length > 0 && (
                            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                              <p className={`text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1`}>Phone on Website</p>
                              {website.phones.map((p, i) => <p key={i} className="text-sm font-black text-emerald-700 dark:text-emerald-300">{p}</p>)}
                            </div>
                          )}
                          {/* Website schema rating (when no Google API key) */}
                          {website.schemaRating?.rating && !google && (
                            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700">
                              <p className={`text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1`}>Schema Rating on Website</p>
                              <p className={`text-sm font-black text-amber-700 dark:text-amber-300`}>
                                {Number(website.schemaRating.rating).toFixed(1)} ★
                                {website.schemaRating.reviewCount && ` · ${Number(website.schemaRating.reviewCount).toLocaleString()} reviews`}
                              </p>
                            </div>
                          )}
                          {website.services?.length > 0 && (
                            <div>
                              <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-2`}>Services Detected</p>
                              <div className="flex flex-wrap gap-1.5">
                                {website.services.slice(0, 12).map((s, i) => (
                                  <span key={i} className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 capitalize">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className={`text-[11px] ${subtl}`}>{website.wordCount?.toLocaleString()} words · scraped {website.scrapedAt ? new Date(website.scrapedAt).toLocaleString() : ''}</p>
                        </>
                      ) : (
                        <div className={`p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center ${subtl} text-xs`}>
                          {destinyLoading ? 'Scraping website…' : 'Click Sync Now to pull website data'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Source Status Strip ─────────────────────────────── */}
                  {destinyData && !destinyLoading && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        { label: 'Website',      ok: !!destinyData.website,                                                                      err: destinyData.websiteError },
                        { label: 'Google Search',ok: !!(destinyData.googleSearch?.rating),                                                      err: !destinyData.googleSearch ? 'No rating found' : null },
                        { label: 'Healthgrades', ok: !!(destinyData.healthgrades?.rating),                                                      err: !destinyData.healthgrades ? 'Not found' : null },
                        { label: 'Google API',   ok: !!destinyData.google,                                                                      err: destinyData.googleSkipped ? 'No API key — add GOOGLE_PLACES_KEY in Vercel' : destinyData.googleError },
                        { label: 'Facebook',     ok: !!(destinyData.facebook?.likes ?? destinyData.facebook?.followers),                        err: destinyData.sources?.facebook?.error },
                        { label: 'Instagram',    ok: destinyData.instagram?.followers != null,                                                  err: destinyData.instagram?.followers == null ? 'Blocked — add META_APP_ID + META_APP_SECRET in Vercel' : null },
                        { label: 'TikTok',       ok: destinyData.tiktok?.followers != null,                                                     err: destinyData.tiktok?.followers == null ? 'Blocked by TikTok — no public API available' : null },
                        { label: 'LinkedIn',     ok: destinyData.linkedin?.followers != null,                                                   err: destinyData.sources?.linkedin?.error },
                      ].map(({ label, ok, err }) => (
                        <span key={label} title={err || ''} className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                          ok  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {ok ? '✓' : '–'} {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ── Social Media Stats Row ───────────────────────────── */}
                  {(destinyData || destinyLoading) && (
                    <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
                      <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-3 flex items-center gap-1.5`}>
                        <Activity size={11} className="text-purple-500" /> Social Media Profiles
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Facebook */}
                        {(() => {
                          const fb = destinyData?.facebook;
                          const fbErr = destinyData?.sources?.facebook?.error;
                          const hasFb = fb && !fb.error;
                          return (
                            <div className={`p-4 rounded-2xl ${hasFb ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0"><span className="text-white text-[10px] font-black">f</span></div>
                                <span className={`text-xs font-black ${hasFb ? 'text-blue-700 dark:text-blue-300' : subtl}`}>Facebook</span>
                              </div>
                              {destinyLoading && !fb && <p className={`text-[11px] ${subtl}`}>Fetching…</p>}
                              {hasFb ? (
                                <div className="space-y-1">
                                  {fb.name && <p className={`text-xs font-black ${txt} leading-tight`}>{fb.name}</p>}
                                  {fb.followers != null && <p className="text-xl font-black text-blue-600 dark:text-blue-400">{Number(fb.followers).toLocaleString()} <span className={`text-xs font-normal ${subtl}`}>followers</span></p>}
                                  {fb.likes != null && fb.likes !== fb.followers && <p className={`text-xs ${subtl}`}>{Number(fb.likes).toLocaleString()} likes</p>}
                                  {fb.about && <p className={`text-[11px] ${subtl} mt-1 line-clamp-2`}>{fb.about}</p>}
                                  <a href={fb.url || 'https://www.facebook.com/profile.php?id=61581511228047'} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-black text-blue-500 hover:text-blue-400 mt-1">
                                    <ExternalLink size={9} /> View Page
                                  </a>
                                </div>
                              ) : (fb?.error || fbErr) ? (
                                <div>
                                  <p className={`text-[11px] text-amber-600 dark:text-amber-400`}>Blocked by Facebook</p>
                                  <a href="https://www.facebook.com/profile.php?id=61581511228047" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-black text-blue-500 hover:text-blue-400 mt-1"><ExternalLink size={9}/> Open on Facebook</a>
                                </div>
                              ) : !destinyLoading ? (
                                <p className={`text-[11px] ${subtl}`}>Click Sync Now</p>
                              ) : null}
                            </div>
                          );
                        })()}
                        {/* Instagram */}
                        {(() => {
                          const ig = destinyData?.instagram;
                          const hasIg = ig?.followers != null;
                          return (
                            <div className={`p-4 rounded-2xl ${hasIg ? 'bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400 flex items-center justify-center flex-shrink-0"><span className="text-white text-[10px] font-black">IG</span></div>
                                <span className={`text-xs font-black ${hasIg ? 'text-pink-700 dark:text-pink-300' : subtl}`}>Instagram</span>
                              </div>
                              {destinyLoading && !ig && <p className={`text-[11px] ${subtl}`}>Fetching…</p>}
                              {hasIg ? (
                                <div className="space-y-1">
                                  {(ig.fullName || ig.username) && <p className={`text-xs font-black ${txt} leading-tight`}>{ig.fullName || '@' + ig.username}</p>}
                                  {ig.followers != null && <p className="text-xl font-black text-pink-600 dark:text-pink-400">{Number(ig.followers).toLocaleString()} <span className={`text-xs font-normal ${subtl}`}>followers</span></p>}
                                  {ig.posts    != null && <p className={`text-xs ${subtl}`}>{Number(ig.posts).toLocaleString()} posts</p>}
                                  {ig.bio && <p className={`text-[11px] ${subtl} mt-1 line-clamp-2`}>{ig.bio}</p>}
                                  {ig.isVerified && <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-blue-500 mt-1">✓ Verified</span>}
                                  <a href={ig.url || 'https://www.instagram.com/destinyspringshealthcare/'} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-black text-pink-500 hover:text-pink-400 mt-1">
                                    <ExternalLink size={9} /> View Profile
                                  </a>
                                </div>
                              ) : (ig?.error || destinyData?.sources?.instagram?.error) ? (
                                <div>
                                  <p className={`text-[11px] text-amber-600 dark:text-amber-400`}>Blocked by Instagram</p>
                                  <a href="https://www.instagram.com/destinyspringshealthcare/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-black text-pink-500 hover:text-pink-400 mt-1"><ExternalLink size={9}/> Open on Instagram</a>
                                </div>
                              ) : !destinyLoading ? (
                                <p className={`text-[11px] ${subtl}`}>Click Sync Now</p>
                              ) : null}
                            </div>
                          );
                        })()}
                        {/* TikTok */}
                        {(() => {
                          const tt = destinyData?.tiktok;
                          const hasTt = tt?.followers != null;
                          return (
                            <div className={`p-4 rounded-2xl ${hasTt ? 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center flex-shrink-0"><span className="text-white text-[9px] font-black">TT</span></div>
                                <span className={`text-xs font-black ${hasTt ? txt : subtl}`}>TikTok</span>
                              </div>
                              {destinyLoading && !tt && <p className={`text-[11px] ${subtl}`}>Fetching…</p>}
                              {hasTt ? (
                                <div className="space-y-1">
                                  {(tt.nickname || tt.username) && <p className={`text-xs font-black ${txt} leading-tight`}>{tt.nickname || '@' + tt.username}</p>}
                                  {tt.followers != null && <p className={`text-xl font-black ${txt}`}>{Number(tt.followers).toLocaleString()} <span className={`text-xs font-normal ${subtl}`}>followers</span></p>}
                                  {tt.likes    != null && <p className={`text-xs ${subtl}`}>{Number(tt.likes).toLocaleString()} total likes</p>}
                                  {tt.videos   != null && <p className={`text-xs ${subtl}`}>{tt.videos} videos</p>}
                                  {tt.bio && <p className={`text-[11px] ${subtl} mt-1 line-clamp-2`}>{tt.bio}</p>}
                                  <a href={tt.url || 'https://www.tiktok.com/@destinyspringshealthcare'} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-black hover:opacity-70 mt-1">
                                    <ExternalLink size={9} /> View Profile
                                  </a>
                                </div>
                              ) : (tt?.error || destinyData?.sources?.tiktok?.error) ? (
                                <div>
                                  <p className={`text-[11px] text-amber-600 dark:text-amber-400`}>Blocked by TikTok</p>
                                  <a href="https://www.tiktok.com/@destinyspringshealthcare" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-black text-slate-700 dark:text-slate-300 hover:opacity-70 mt-1"><ExternalLink size={9}/> Open on TikTok</a>
                                </div>
                              ) : !destinyLoading ? (
                                <p className={`text-[11px] ${subtl}`}>Click Sync Now</p>
                              ) : null}
                            </div>
                          );
                        })()}
                        {/* LinkedIn */}
                        {(() => {
                          const li = destinyData?.linkedin;
                          const liErr = destinyData?.sources?.linkedin?.error;
                          const hasLi = li && !li.error;
                          return (
                            <div className={`p-4 rounded-2xl ${hasLi ? 'bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-[#0A66C2] flex items-center justify-center flex-shrink-0"><span className="text-white text-[9px] font-black">in</span></div>
                                <span className={`text-xs font-black ${hasLi ? 'text-sky-700 dark:text-sky-300' : subtl}`}>LinkedIn</span>
                              </div>
                              {destinyLoading && !li && <p className={`text-[11px] ${subtl}`}>Fetching…</p>}
                              {hasLi ? (
                                <div className="space-y-1">
                                  {li.name && <p className={`text-xs font-black ${txt} leading-tight`}>{li.name}</p>}
                                  {li.followers != null && <p className="text-xl font-black text-sky-600 dark:text-sky-400">{Number(li.followers).toLocaleString()} <span className={`text-xs font-normal ${subtl}`}>followers</span></p>}
                                  {li.employees && <p className={`text-xs ${subtl}`}>{li.employees} employees</p>}
                                  {li.tagline && <p className={`text-[11px] ${subtl} mt-1 line-clamp-2`}>{li.tagline}</p>}
                                  <a href={li.url || 'https://www.linkedin.com/company/destiny-springs-healthcare'} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-black text-sky-600 hover:text-sky-500 mt-1">
                                    <ExternalLink size={9} /> View Page
                                  </a>
                                </div>
                              ) : (li?.error || liErr) ? (
                                <div>
                                  <p className={`text-[11px] text-amber-600 dark:text-amber-400`}>Blocked by LinkedIn</p>
                                  <a href="https://www.linkedin.com/company/destiny-springs-healthcare" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-black text-sky-600 hover:text-sky-500 mt-1"><ExternalLink size={9}/> Open on LinkedIn</a>
                                </div>
                              ) : !destinyLoading ? (
                                <p className={`text-[11px] ${subtl}`}>Click Sync Now</p>
                              ) : null}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Top KPI Row */}
            {!overviewHidden.includes('kpis') && (
            <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              <StatCard title="Google Rating"     value={metrics.googleScore}    trend={metrics.googleTrend} icon={Star}        color="bg-amber-500"   sub="Review Cleanup Performance" onClick={() => setActiveTab('reviews')} />
              <StatCard title="Monthly Sessions"  value={metrics.wixSessions}    trend={null}                icon={Layout}      color="bg-teal-600"    sub="Wix Website Traffic"        onClick={() => setActiveTab('seo')} />
              <StatCard title="Avg Read Time"     value={metrics.avgReadTime}    trend={null}                icon={Clock}       color="bg-emerald-600" sub="Blog & Education Retention"  onClick={() => setActiveTab('seo')} />
              <StatCard title="Omnichannel Reach" value={(() => { const reach = _socialMet.reduce((s,e)=>s+Number(e.reach||0),0); if (reach > 0) return reach.toLocaleString(); const audience = socialAnalytics.reduce((s,p)=>s+p.followers,0); return audience > 0 ? audience.toLocaleString() : '---'; })()} trend={null} icon={Activity} color="bg-purple-600" sub={_socialMet.reduce((s,e)=>s+Number(e.reach||0),0)>0 ? 'Combined Ad / Social' : 'Total Social Audience'} onClick={() => setActiveTab('social')} />
              </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              <StatCard title="Total Leads"       value={metrics.totalLeads}     trend={metrics.leadsGrowth} icon={Target}      color="bg-rose-500"    sub="Monthly Lead Volume"         onClick={() => setActiveTab('pipeline')} />
              <StatCard title="Cost Per Lead"     value={metrics.costPerLead}    trend={null}                icon={TrendingDown} color="bg-indigo-600" sub="Blended Paid Acquisition"    onClick={() => setActiveTab('ads')} />
              <StatCard title="Site Conversion"   value={metrics.siteConversion} trend={null}                icon={MousePointer} color="bg-teal-600"   sub="Visitor to Lead Rate"         onClick={() => setActiveTab('seo')} />
              <StatCard title="NPS Score"         value={metrics.nps}            trend={null}                icon={ThumbsUp}    color="bg-amber-600"   sub="Net Promoter Score"          onClick={() => setActiveTab('reviews')} />
            </div>
            </>
            )}

            {/* ── Brand Health Score ────────────────────────────────────── */}
            {!overviewHidden.includes('health') && (() => {
              const dsRating  = destinyData?.google?.rating ?? destinyData?.bestRating?.rating ?? null;
              const dsReviews = destinyData?.google?.reviewCount ?? destinyData?.bestRating?.reviewCount ?? null;
              const socials   = ['facebook','instagram','tiktok','linkedin'].filter(p => destinyData?.[p] && !destinyData[p].error).length;
              const wq        = destinyData?.website?.services?.length || 0;
              const wc        = destinyData?.website?.wordCount || 0;
              const comps     = competitorData?.competitors || [];
              const allR      = [...comps.map(c => c.avgRating).filter(Boolean), ...(dsRating ? [dsRating] : [])].sort((a,b) => b-a);
              const dsRank    = dsRating ? (allR.indexOf(dsRating) < 0 ? allR.findIndex(r => r <= dsRating) + 1 : allR.indexOf(dsRating) + 1) || 1 : null;
              const totalC    = allR.length;
              const breakdown = [];
              let score = 0;
              if (dsRating) { const p=Math.round((dsRating/5)*25); score+=p; breakdown.push({label:'Star Rating',pts:p,max:25,detail:`${dsRating}/5.0 ★`,color:'bg-amber-500'}); }
              if (dsReviews) { const p=Math.min(20,Math.round((Math.min(dsReviews,200)/200)*20)); score+=p; breakdown.push({label:'Review Volume',pts:p,max:20,detail:`${dsReviews.toLocaleString()} reviews`,color:'bg-blue-500'}); }
              const sp=Math.round((socials/4)*20); score+=sp; breakdown.push({label:'Social Presence',pts:sp,max:20,detail:`${socials}/4 platforms active`,color:'bg-pink-500'});
              const wp=Math.min(20,Math.round((Math.min(wq,10)/10)*15)+(wc>2000?5:Math.round((wc/2000)*5))); score+=wp; breakdown.push({label:'Website Quality',pts:wp,max:20,detail:`${wq} services detected · ${wc.toLocaleString()} words`,color:'bg-teal-500'});
              if (dsRank&&totalC>1){const p=Math.round(((totalC-dsRank)/(totalC-1))*15);score+=p;breakdown.push({label:'Competitive Rank',pts:p,max:15,detail:`#${dsRank} of ${totalC} providers`,color:'bg-purple-500'});}
              const maxPs = breakdown.reduce((s,b)=>s+b.max,0)||100;
              const healthScore = breakdown.length ? Math.min(100,Math.round((score/maxPs)*100)) : null;
              const grade = healthScore!=null ? (healthScore>=85?'A':healthScore>=70?'B':healthScore>=55?'C':healthScore>=40?'D':'F') : '—';
              const gradeColor = healthScore!=null ? (healthScore>=85?'text-emerald-500':healthScore>=70?'text-teal-500':healthScore>=55?'text-amber-500':healthScore>=40?'text-orange-500':'text-rose-500') : subtl;
              const insights = [];
              if (!dsRating) insights.push({ icon:'⚠️', text:'No rating data yet — run a Sync to pull live Google/Yelp/Healthgrades scores.' });
              else if (dsRating < 4.0)  insights.push({ icon:'📈', text:`Rating of ${dsRating} is below the 4.0 threshold for strong trust. Prioritize review recovery.` });
              else if (dsRating >= 4.5) insights.push({ icon:'⭐', text:`Excellent ${dsRating} rating. Focus on volume — more reviews = more SEO authority.` });
              if (socials < 3)          insights.push({ icon:'🔗', text:`Only ${socials}/4 social profiles scraped. Connect missing platforms in Integrations.` });
              if (wq < 5)               insights.push({ icon:'🌐', text:'Website content thin — consider adding more service pages for SEO.' });
              if (dsRank === 1 && totalC > 1) insights.push({ icon:'🏆', text:`Top-rated out of ${totalC} providers tracked. Maintain and market this position!` });
              else if (dsRank && dsRank > Math.ceil(totalC/2)) insights.push({ icon:'🔄', text:`Ranked #${dsRank} of ${totalC} locally. Primary lever: grow Google review count.` });
              return (
                <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
                  <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">
                    {/* Score circle */}
                    <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 flex-shrink-0 min-w-[140px]">
                      <span className={`text-6xl font-black ${gradeColor} leading-none`}>{grade}</span>
                      {healthScore != null && <span className={`text-2xl font-black ${gradeColor} mt-1`}>{healthScore}<span className={`text-sm font-normal ${subtl}`}>/100</span></span>}
                      <span className={`text-[11px] font-black ${subtl} uppercase tracking-wider mt-2`}>Brand Health</span>
                    </div>
                    {/* Breakdown bars */}
                    <div className="flex-1 min-w-0">
                      <SectionHeader icon={Award} color="text-amber-500" title="Brand Health Score" subtitle="Computed from ratings, reviews, social presence & competitive position" />
                      {breakdown.length === 0 ? (
                        <p className={`text-sm ${subtl} mt-2`}>Run a Sync Now to compute your brand health score.</p>
                      ) : (
                        <div className="space-y-3 mt-4">
                          {breakdown.map(b => (
                            <div key={b.label}>
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-black ${txt2}`}>{b.label}</span>
                                <span className={`text-xs font-black ${txt}`}>{b.pts}<span className={`font-normal ${subtl}`}>/{b.max}</span></span>
                              </div>
                              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${b.color}`} style={{ width: `${Math.round((b.pts/b.max)*100)}%`, transition: 'width 0.6s ease' }} />
                              </div>
                              <p className={`text-[10px] ${subtl} mt-0.5`}>{b.detail}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {insights.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-3`}>⚡ AI Insights</p>
                      {insights.map((ins, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <span className="text-base leading-none mt-0.5">{ins.icon}</span>
                          <p className={`text-[12px] ${txt2} leading-relaxed`}>{ins.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 6-Month Trend */}
            {!overviewHidden.includes('trend') && (
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
            )}

            {/* ── Competitor Intelligence ──────────────────────────────── */}
            {!overviewHidden.includes('competitors') && (() => {
              const dsRating  = destinyData?.google?.rating ?? destinyData?.bestRating?.rating ?? null;
              const dsReviews = destinyData?.google?.reviewCount ?? destinyData?.bestRating?.reviewCount ?? null;
              const comps     = competitorData?.competitors || [];
              // Build combined list: Destiny Springs + all competitors
              const allProviders = [
                {
                  id: 'destiny-springs', name: 'Destiny Springs Healthcare', isUs: true,
                  web: 'https://destinyspringshealthcare.com',
                  google:      dsRating   ? { rating: dsRating,   reviewCount: dsReviews }  : null,
                  healthgrades: destinyData?.healthgrades || null,
                  avgRating:   dsRating,
                  totalReviews: dsReviews,
                  services:    destinyData?.website?.services?.length || 0,
                },
                ...comps,
              ].sort((a, b) => {
                if (a.avgRating == null && b.avgRating == null) return 0;
                if (a.avgRating == null) return 1;
                if (b.avgRating == null) return -1;
                return b.avgRating - a.avgRating;
              });
              const starBar = (r) => {
                if (!r) return <span className={`text-[11px] ${subtl}`}>—</span>;
                const pct = Math.round((r / 5) * 100);
                return (
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs font-black ${txt}`}>{r.toFixed(1)}</span>
                  </div>
                );
              };
              return (
                <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
                  <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                    <SectionHeader icon={Scale} color="text-purple-500" title="Competitor Intelligence" subtitle={`Live ratings vs. ${comps.length} local behavioral health providers`} />
                    <button onClick={fetchCompetitors} disabled={competitorLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-colors">
                      <RefreshCw size={13} className={competitorLoading ? 'animate-spin' : ''} />
                      {competitorLoading ? 'Scanning…' : 'Refresh'}
                    </button>
                  </div>
                  {competitorLoading && !competitorData && (
                    <div className="flex items-center gap-3 py-8 justify-center">
                      <RefreshCw size={18} className="animate-spin text-purple-500" />
                      <p className={`text-sm font-bold ${subtl}`}>Scraping competitor data… this takes ~30s</p>
                    </div>
                  )}
                  {!competitorLoading && !competitorData && (
                    <p className={`text-sm ${subtl} text-center py-6`}>Auto-loads every 2 hours. Click Refresh to load now.</p>
                  )}
                  {allProviders.length > 1 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className={`border-b ${brd}`}>
                            <th className={`pb-3 text-[11px] font-black ${subtl} uppercase tracking-wider pr-4`}>#</th>
                            <th className={`pb-3 text-[11px] font-black ${subtl} uppercase tracking-wider pr-4`}>Provider</th>
                            <th className={`pb-3 text-[11px] font-black ${subtl} uppercase tracking-wider pr-4`}>Google Rating</th>
                            <th className={`pb-3 text-[11px] font-black ${subtl} uppercase tracking-wider pr-4`}>Reviews</th>
                            <th className={`pb-3 text-[11px] font-black ${subtl} uppercase tracking-wider pr-4`}>Healthgrades</th>
                            <th className={`pb-3 text-[11px] font-black ${subtl} uppercase tracking-wider`}>Services</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${divdr}`}>
                          {allProviders.map((p, idx) => (
                            <tr key={p.id} className={`${p.isUs ? 'bg-teal-50/60 dark:bg-teal-900/10' : rowCls}`}>
                              <td className={`py-3 pr-4 text-xs font-black ${p.isUs ? 'text-teal-600 dark:text-teal-400' : subtl}`}>
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`}
                              </td>
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                  {p.isUs && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">YOU</span>}
                                  <div>
                                    <p className={`text-xs font-black ${p.isUs ? 'text-teal-700 dark:text-teal-300' : txt}`}>{p.name}</p>
                                    {p.web && <a href={p.web} target="_blank" rel="noreferrer" className={`text-[10px] ${subtl} hover:text-teal-500`}>{p.web.replace(/https?:\/\//,'').replace(/\//,'')}</a>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 pr-4">{starBar(p.google?.rating || p.avgRating)}</td>
                              <td className="py-3 pr-4">
                                {p.totalReviews || p.google?.reviewCount
                                  ? <span className={`text-xs font-bold ${txt2}`}>{(p.totalReviews || p.google?.reviewCount || 0).toLocaleString()}</span>
                                  : <span className={`text-[11px] ${subtl}`}>—</span>}
                              </td>
                              <td className="py-3 pr-4">
                                {p.healthgrades?.rating
                                  ? <span className={`text-xs font-bold ${txt2}`}>{p.healthgrades.rating.toFixed(1)} ★</span>
                                  : <span className={`text-[11px] ${subtl}`}>—</span>}
                              </td>
                              <td className="py-3">
                                {(p.services || p.website?.services?.length)
                                  ? <span className={`text-xs font-bold ${txt2}`}>{p.services || p.website?.services?.length} detected</span>
                                  : <span className={`text-[11px] ${subtl}`}>—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {competitorData?.fetchedAt && <p className={`text-[10px] ${subtl} mt-3`}>Last scanned: {new Date(competitorData.fetchedAt).toLocaleString()}</p>}
                    </div>
                  )}
                </div>
              );
            })()}
            {!overviewHidden.includes('nps_wix') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              <div className={`lg:col-span-4 ${card} p-8 rounded-[2.5rem] flex flex-col`}>
                <SectionHeader icon={ThumbsUp} color="text-amber-500" title="NPS Breakdown" subtitle="Promoters / Passives / Detractors" />
                <div className="h-[200px] flex-shrink-0">
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
                <div className="h-[200px] flex-shrink-0">
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
            )}

            {/* UX Path & Content Velocity */}
            {!overviewHidden.includes('ux_content') && (<>
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

            {/* ── Sir Clicks-a-Lot AI Insights ─────────────────────────────── */}
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                <SectionHeader icon={Bot} color="text-purple-500" title="AI Data Analysis" subtitle="Captain KPI reads your imported data and delivers the hard truths" />
                <button
                  onClick={analyzeData}
                  disabled={aiInsightsLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-all flex-shrink-0 shadow-lg"
                >
                  <Bot size={14} className={aiInsightsLoading ? 'animate-spin' : ''} />
                  {aiInsightsLoading ? 'Analyzing…' : 'Analyze Now'}
                </button>
              </div>
              {aiInsights ? (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/40">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CaptainKPI size={28} />
                    </div>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Captain KPI reporting:</span>
                  </div>
                  <p className={`text-sm ${txt} whitespace-pre-wrap leading-relaxed`}>{aiInsights}</p>
                  <button onClick={() => setAiInsights('')} className={`mt-3 text-xs ${subtl} hover:text-purple-500 transition-colors`}>Clear analysis</button>
                </div>
              ) : (
                <div className={`p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4`}>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-lg p-1">
                    <CaptainKPI size={44} />
                  </div>
                  <div>
                    <p className={`text-sm font-black ${txt} mb-0.5`}>No analysis yet</p>
                    <p className={`text-xs ${subtl}`}>Hit <strong>Analyze Now</strong> and Captain KPI will crunch your imported data and tell you exactly what to do next.</p>
                  </div>
                </div>
              )}
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
            </>)}

          </>
        )}

        {/* ══════════════════ SOCIAL ══════════════════ */}
        {activeTab === 'social' && (
          <>
            {/* Live Social Snapshot */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              {socialAnalytics.map(s => {
                const hasLiveData = s.followers > 0;
                const secondaryLabel =
                  s.platform === 'Facebook'  ? (s.totalLikes > 0 ? `${s.totalLikes.toLocaleString()} page likes` : 'Page followers') :
                  s.platform === 'Instagram' ? (s.posts > 0     ? `${s.posts.toLocaleString()} posts`            : 'Profile followers') :
                  s.platform === 'TikTok'    ? (s.videos > 0    ? `${s.videos.toLocaleString()} videos`          : s.totalLikes > 0 ? `${s.totalLikes.toLocaleString()} total likes` : 'Account followers') :
                  s.reach > 0 ? `${s.reach.toLocaleString()} reach` : 'Followers';
                const tertiaryVal =
                  s.platform === 'TikTok' && s.totalLikes > 0 ? `${s.totalLikes.toLocaleString()} ❤` :
                  s.platform === 'Instagram' && s.posts > 0   ? `${s.posts.toLocaleString()} posts` :
                  s.clicks > 0 ? `${s.clicks} clicks` : null;
                return (
                  <div key={s.platform} className={`${card} p-5 rounded-2xl`}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.color + '25' }}>
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: s.color }}></div>
                    </div>
                    <p className={`text-[13px] font-black uppercase ${subtl} tracking-widest mb-1`}>{s.platform}</p>
                    <h3 className={`text-2xl font-black ${txt}`}>{s.followers > 0 ? s.followers.toLocaleString() : '—'}</h3>
                    <p className={`text-[13px] ${subtl} italic mt-1`}>{hasLiveData ? 'Followers' : 'No live data'}</p>
                    <div className={`mt-3 pt-3 border-t ${brd} flex justify-between text-[13px] font-bold`}>
                      <span className={muted}>{secondaryLabel}</span>
                      {tertiaryVal && <span className="text-teal-500">{tertiaryVal}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Social Stats — detailed breakdown per platform */}
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <div className="flex items-center justify-between mb-5">
                <SectionHeader icon={Activity} color="text-purple-500" title="Live Social Performance" subtitle="Followers, posts & engagement — synced from each platform" />
                <button
                  onClick={fetchDestinyProfile}
                  disabled={destinyLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-black transition-all shrink-0"
                >
                  <RefreshCw size={11} className={destinyLoading ? 'animate-spin' : ''} />
                  {destinyLoading ? 'Syncing…' : 'Sync Now'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Facebook */}
                {(() => {
                  const fb = (destinyData?.facebook && !destinyData.facebook.error) ? destinyData.facebook : _fbLive;
                  const hasFb = fb.followers != null || fb.likes != null || !!fb.name;
                  const mainCount = fb.followers ?? fb.likes;
                  const mainLabel = fb.followers != null ? 'Followers' : 'Page Likes';
                  return (
                    <div className={`p-5 rounded-2xl ${hasFb ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800' : `bg-slate-50 dark:bg-slate-800/50 ${brd} border`}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0"><span className="text-white text-xs font-black">f</span></div>
                        <span className={`text-sm font-black ${hasFb ? 'text-blue-700 dark:text-blue-300' : subtl}`}>Facebook</span>
                        {hasFb && <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">Live</span>}
                      </div>
                      {hasFb ? (
                        <div className="space-y-2">
                          {fb.name && <p className={`text-xs font-bold ${txt2} leading-tight`}>{fb.name}</p>}
                          {mainCount != null && (
                            <div>
                              <p className={`text-3xl font-black text-blue-600 dark:text-blue-400`}>{Number(mainCount).toLocaleString()}</p>
                              <p className={`text-xs ${subtl} mt-0.5`}>{mainLabel}</p>
                            </div>
                          )}
                          {fb.likes != null && fb.followers != null && fb.likes !== fb.followers && (
                            <div className={`flex items-center justify-between text-xs ${subtl} pt-2 border-t ${brd}`}>
                              <span>Page Likes</span><span className={`font-black ${txt}`}>{Number(fb.likes).toLocaleString()}</span>
                            </div>
                          )}
                          {fb.category && (
                            <div className={`flex items-center justify-between text-xs ${subtl} pt-1 border-t ${brd}`}>
                              <span>Category</span><span className={`font-black ${txt} text-right max-w-[60%] leading-tight`}>{fb.category}</span>
                            </div>
                          )}
                          {(destinyData?.fetchedAt || _socialLive.fetchedAt) && <p className={`text-[10px] ${subtl} mt-2`}>Synced {new Date(destinyData?.fetchedAt || _socialLive.fetchedAt).toLocaleString()}</p>}
                          <a href={fb.url || 'https://www.facebook.com/profile.php?id=61581511228047'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-black text-blue-500 hover:text-blue-400 mt-1"><ExternalLink size={9}/> View Page</a>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className={`text-xs ${subtl} mb-2`}>{destinyLoading ? 'Fetching…' : 'No live data yet'}</p>
                          {!destinyLoading && <p className={`text-[11px] ${subtl}`}>Click Sync Now to pull Facebook data</p>}
                        </div>
                      )}
                    </div>
                  );
                })()}
                {/* Instagram */}
                {(() => {
                  const ig = (destinyData?.instagram && !destinyData.instagram.error) ? destinyData.instagram : _igLive;
                  const hasIg = ig.followers != null;
                  return (
                    <div className={`p-5 rounded-2xl ${hasIg ? 'bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800' : `bg-slate-50 dark:bg-slate-800/50 ${brd} border`}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400 flex items-center justify-center flex-shrink-0"><span className="text-white text-[10px] font-black">IG</span></div>
                        <span className={`text-sm font-black ${hasIg ? 'text-pink-700 dark:text-pink-300' : subtl}`}>Instagram</span>
                        {hasIg && <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">Live</span>}
                      </div>
                      {hasIg ? (
                        <div className="space-y-2">
                          {(ig.fullName || ig.username) && <p className={`text-xs font-bold ${txt2} leading-tight`}>{ig.fullName || '@' + ig.username}</p>}
                          <div>
                            <p className={`text-3xl font-black text-pink-600 dark:text-pink-400`}>{Number(ig.followers).toLocaleString()}</p>
                            <p className={`text-xs ${subtl} mt-0.5`}>Followers</p>
                          </div>
                          {ig.posts != null && (
                            <div className={`flex items-center justify-between text-xs ${subtl} pt-2 border-t ${brd}`}>
                              <span>Posts</span><span className={`font-black ${txt}`}>{Number(ig.posts).toLocaleString()}</span>
                            </div>
                          )}
                          {ig.following != null && (
                            <div className={`flex items-center justify-between text-xs ${subtl} pt-1 border-t ${brd}`}>
                              <span>Following</span><span className={`font-black ${txt}`}>{Number(ig.following).toLocaleString()}</span>
                            </div>
                          )}
                          {ig.isVerified && <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-blue-500">✓ Verified</span>}
                          {(destinyData?.fetchedAt || _socialLive.fetchedAt) && <p className={`text-[10px] ${subtl} mt-2`}>Synced {new Date(destinyData?.fetchedAt || _socialLive.fetchedAt).toLocaleString()}</p>}
                          <a href={ig.url || 'https://www.instagram.com/destinyspringshealthcare/'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-black text-pink-500 hover:text-pink-400 mt-1"><ExternalLink size={9}/> View Profile</a>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className={`text-xs ${subtl} mb-2`}>{destinyLoading ? 'Fetching…' : 'No live data yet'}</p>
                          {!destinyLoading && <p className={`text-[11px] ${subtl}`}>Click Sync Now to pull Instagram data</p>}
                        </div>
                      )}
                    </div>
                  );
                })()}
                {/* TikTok */}
                {(() => {
                  const tt = (destinyData?.tiktok && !destinyData.tiktok.error) ? destinyData.tiktok : _ttLive;
                  const hasTt = tt.followers != null;
                  return (
                    <div className={`p-5 rounded-2xl ${hasTt ? 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600' : `bg-slate-50 dark:bg-slate-800/50 ${brd} border`}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-xl bg-black flex items-center justify-center flex-shrink-0"><span className="text-white text-[9px] font-black">TT</span></div>
                        <span className={`text-sm font-black ${hasTt ? txt : subtl}`}>TikTok</span>
                        {hasTt && <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">Live</span>}
                      </div>
                      {hasTt ? (
                        <div className="space-y-2">
                          {(tt.nickname || tt.username) && <p className={`text-xs font-bold ${txt2} leading-tight`}>{tt.nickname || '@' + tt.username}</p>}
                          <div>
                            <p className={`text-3xl font-black ${txt}`}>{Number(tt.followers).toLocaleString()}</p>
                            <p className={`text-xs ${subtl} mt-0.5`}>Followers</p>
                          </div>
                          {tt.likes != null && (
                            <div className={`flex items-center justify-between text-xs ${subtl} pt-2 border-t ${brd}`}>
                              <span>Total Likes ❤</span><span className={`font-black ${txt}`}>{Number(tt.likes).toLocaleString()}</span>
                            </div>
                          )}
                          {tt.videos != null && (
                            <div className={`flex items-center justify-between text-xs ${subtl} pt-1 border-t ${brd}`}>
                              <span>Videos Posted</span><span className={`font-black ${txt}`}>{tt.videos}</span>
                            </div>
                          )}
                          {tt.following != null && (
                            <div className={`flex items-center justify-between text-xs ${subtl} pt-1 border-t ${brd}`}>
                              <span>Following</span><span className={`font-black ${txt}`}>{Number(tt.following).toLocaleString()}</span>
                            </div>
                          )}
                          {tt.isVerified && <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-blue-500">✓ Verified</span>}
                          {(destinyData?.fetchedAt || _socialLive.fetchedAt) && <p className={`text-[10px] ${subtl} mt-2`}>Synced {new Date(destinyData?.fetchedAt || _socialLive.fetchedAt).toLocaleString()}</p>}
                          <a href={tt.url || 'https://www.tiktok.com/@destinyspringshealthcare'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-black hover:opacity-70 mt-1"><ExternalLink size={9}/> View Profile</a>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className={`text-xs ${subtl} mb-2`}>{destinyLoading ? 'Fetching…' : 'No live data yet'}</p>
                          {!destinyLoading && <p className={`text-[11px] ${subtl}`}>Click Sync Now to pull TikTok data</p>}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
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
            {/* ── Recent Content from Meta Graph API ───────────────────────── */}
            {(_metaLive.igPosts?.length > 0 || _metaLive.fbPosts?.length > 0) && (
              <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
                <SectionHeader icon={Share2} color="text-pink-500" title="Recent Content" subtitle="Latest posts pulled via Meta Graph API" />

                {/* Instagram grid */}
                {_metaLive.igPosts?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[11px] font-black text-pink-500 uppercase tracking-wider mb-3">Instagram — Latest Posts</p>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {_metaLive.igPosts.map(post => (
                        <a key={post.id} href={post.url || '#'} target="_blank" rel="noreferrer"
                          className="aspect-square rounded-xl overflow-hidden relative group block bg-pink-100 dark:bg-pink-900/30">
                          {post.image ? (
                            <img src={post.image} alt={post.caption || ''}
                              className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PlayCircle size={20} className="text-pink-400" />
                            </div>
                          )}
                          {post.type === 'VIDEO' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <PlayCircle size={18} className="text-white drop-shadow-md opacity-80" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex-col items-center justify-center gap-1 hidden group-hover:flex">
                            <span className="text-white text-[10px] font-black">❤ {post.likes.toLocaleString()}</span>
                            <span className="text-white text-[10px]">💬 {post.comments}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                    {_metaLive.igPosts.length > 0 && (
                      <p className={`text-[10px] ${subtl} mt-2`}>Media URLs expire after ~1 hour — reconnect Meta to refresh</p>
                    )}
                  </div>
                )}

                {/* Facebook posts list */}
                {_metaLive.fbPosts?.length > 0 && (
                  <div className={`${_metaLive.igPosts?.length > 0 ? 'mt-6 pt-6 border-t ' + brd : 'mt-5'}`}>
                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-wider mb-3">Facebook — Recent Posts</p>
                    {(() => {
                      const engScore = (p) => (p.likes || 0) + (p.comments || 0) * 2 + (p.shares || 0) * 3;
                      const maxEng   = Math.max(1, ..._metaLive.fbPosts.map(p => engScore(p)));
                      return (
                        <div className="space-y-3">
                          {_metaLive.fbPosts.slice(0, 5).map(post => {
                            const score = Math.round((engScore(post) / maxEng) * 100);
                            const scoreColor = score >= 75 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : score >= 40 ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-500 bg-slate-100 dark:bg-slate-800';
                            return (
                              <a key={post.id} href={post.url || '#'} target="_blank" rel="noreferrer"
                                className={`flex gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 border border-blue-100 dark:border-blue-900 transition-colors`}>
                                {post.image && (
                                  <img src={post.image} alt="" loading="lazy"
                                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className={`text-xs font-bold ${txt} leading-relaxed line-clamp-2`}>
                                    {post.message || '(No caption)'}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <span className={`text-[10px] ${subtl}`}>{new Date(post.date).toLocaleDateString()}</span>
                                    <span className="text-[10px] text-blue-500 font-black">❤ {post.likes.toLocaleString()}</span>
                                    <span className={`text-[10px] ${subtl} font-bold`}>💬 {post.comments}</span>
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${scoreColor}`}>⚡ {score}</span>
                                  </div>
                                </div>
                                <ExternalLink size={12} className={`${subtl} flex-shrink-0 mt-1`} />
                              </a>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

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
              <StatCard title="Organic Growth"  value={_wixLive.organic ? _wixLive.organic + '%' : '—'} trend={_wixLive.organic ? '+' + _wixLive.organic + '%' : null} icon={TrendingUp} color="bg-teal-600"   sub="Organic Traffic Share"   />
              <StatCard title="Avg Position"    value={seoKeywords.length ? (seoKeywords.reduce((s,k)=>s+k.pos,0)/seoKeywords.length).toFixed(1) : '—'} trend={seoKeywords.length > 1 ? null : null} icon={Search} color="bg-blue-600" sub="Google SERP Average" />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { val: metrics.tiktokVelocity, label: 'Videos / Mo',  bg: 'bg-pink-50 dark:bg-pink-900/30',   tx: 'text-pink-900 dark:text-pink-200',   sm: 'text-pink-500'   },
                  { val: metrics.videoViews,      label: 'Total Views',  bg: 'bg-rose-50 dark:bg-rose-900/30',   tx: 'text-rose-900 dark:text-rose-200',   sm: 'text-rose-500'   },
                  { val: (() => { const likes = Number(_tikLive.totalLikes || _ttLive.totalLikes || 0) + _tiktokPosts.reduce((s,e)=>s+Number(e.likes||0),0); return likes > 0 ? likes.toLocaleString() : '—'; })(), label: 'Engagements',  bg: 'bg-orange-50 dark:bg-orange-900/30',tx: 'text-orange-900 dark:text-orange-200',sm: 'text-orange-500' },
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
              <StatCard title="Avg Open Rate"  value={_mailLive.openRate  || metrics.emailOpenRate} trend={null} icon={Mail}         color="bg-teal-600"   sub={_mailLive.listName ? `${_mailLive.listName} · Mailchimp` : 'All Campaigns'} />
              <StatCard title="Subscribers"    value={_mailLive.subscribers ? Number(_mailLive.subscribers).toLocaleString() : (emailCampaigns.reduce((s,c)=>s+c.sent,0)>0 ? emailCampaigns.reduce((s,c)=>s+c.sent,0).toLocaleString() : '---')} trend={null} icon={Users} color="bg-purple-600" sub={_mailLive.subscribers ? 'Mailchimp Audience' : 'Total Emails Sent'} />
              <StatCard title="Avg Click Rate" value={_mailLive.clickRate  || (emailCampaigns.length>0 ? (emailCampaigns.reduce((s,c)=>s+c.clicked,0)/Math.max(1,emailCampaigns.reduce((s,c)=>s+c.sent,0))*100).toFixed(1)+'%' : '---')} trend={null} icon={MousePointer} color="bg-emerald-600" sub="Avg CTR" />
              <StatCard title="Total Campaigns" value={_mailLive.totalCampaigns || emailCampaigns.reduce((s,c)=>s+(c.conversions||0),0)||'---'} trend={null} icon={CheckCircle} color="bg-amber-600" sub={_mailLive.totalCampaigns ? 'Sent via Mailchimp' : 'Email-Attributed'} />
            </div>

            {/* \u2500\u2500 Live Mailchimp campaign list \u2500\u2500 */}
            {_mailLive.recentCampaigns?.length > 0 && (
              <div className={`${card} p-6 rounded-[2.5rem] mb-8`}>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <SectionHeader icon={Mail} color="text-yellow-500" title="Recent Mailchimp Campaigns" subtitle={`${_mailLive.listName || 'Audience'} \u00b7 ${_mailLive.subscribers?.toLocaleString() || 0} subscribers`} />
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => syncIntegrationWithCreds('Mailchimp', connections['Mailchimp'])} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-black transition-all">
                      <RefreshCw size={11} className={syncStatus['Mailchimp']==='syncing'?'animate-spin':''} /> Refresh
                    </button>
                    <button onClick={sendWeeklyDigest} disabled={digestSending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all disabled:opacity-40">
                      {digestSending ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />} {digestSending ? 'Creating\u2026' : 'Send Weekly Digest'}
                    </button>
                  </div>
                </div>
                {digestResult && (
                  <div className={`mb-4 px-4 py-2.5 rounded-xl text-xs font-bold ${digestResult.startsWith('\u2705') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                    {digestResult}
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`text-[13px] font-black ${subtl} uppercase tracking-widest border-b ${brd}`}>
                        {['Campaign','Sent','Open Rate','Click Rate','Date'].map(h => (
                          <th key={h} className={`${h==='Campaign'?'text-left':'text-right'} pb-3 px-3`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${divdr}`}>
                      {_mailLive.recentCampaigns.map(c => (
                        <tr key={c.id}>
                          <td className={`py-3 pr-3 text-sm font-bold ${txt} max-w-[220px] truncate`} title={c.subject}>{c.title || c.subject}</td>
                          <td className={`py-3 px-3 text-right text-sm font-bold ${txt2}`}>{c.emailsSent?.toLocaleString() || c.uniqueOpens?.toLocaleString() || '—'}</td>
                          <td className="py-3 px-3 text-right"><span className="text-sm font-bold text-blue-500">{c.openRate}</span></td>
                          <td className="py-3 px-3 text-right"><span className="text-sm font-bold text-purple-500">{c.clickRate}</span></td>
                          <td className={`py-3 pl-3 text-right text-xs ${subtl}`}>{c.sentAt ? new Date(c.sentAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
            {/* ── Toolbar: view toggle + type filter + schedule button ── */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {/* View toggle pill */}
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  {['month','week','list'].map(v => (
                    <button key={v} onClick={() => setCalView(v)}
                      className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${calView===v ? 'bg-teal-600 text-white' : `bg-white dark:bg-slate-800 ${muted} hover:text-teal-500`}`}>
                      {v}
                    </button>
                  ))}
                </div>
                {/* Type filter */}
                <div className="flex gap-1 flex-wrap">
                  {calendarTypes.map(f => (
                    <button key={f} onClick={() => setCalFilter(f)}
                      className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${calFilter===f ? 'bg-teal-600 text-white shadow-md' : `${card} ${muted} hover:border-teal-400 hover:text-teal-500`}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowAddPost(s => !s)}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-black hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/30">
                <Plus size={14} /> Schedule Post
              </button>
            </div>

            {/* ── Schedule Post form ── */}
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
                    { label: 'Date',     key: 'date',     type: 'date',   placeholder: '' },
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
                        : <input type={f.type} value={newPost[f.key]} onChange={e => setNewPost(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder}
                            className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-400`} />
                      }
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button onClick={handleAddPost}
                    className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-black hover:bg-teal-500 transition-all">
                    <Plus size={13} /> Add to Calendar
                  </button>
                  <button onClick={() => generateCaption(newPost.title, newPost.platform, newPost.type)}
                    disabled={captionGenerating || !newPost.title}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-black hover:bg-purple-500 transition-all disabled:opacity-40">
                    {captionGenerating ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />} {captionGenerating ? 'Writing…' : 'AI Caption'}
                  </button>
                  <button onClick={() => setShowAddPost(false)}
                    className={`px-6 py-2.5 ${card} ${muted} rounded-xl text-sm font-black hover:text-teal-500 transition-all border`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ── Status summary chips ── */}
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

            {/* ── Content Calendar card ── */}
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <SectionHeader icon={Calendar} color="text-teal-500" title="Content Calendar" subtitle="Upcoming Posts &amp; Deadlines" />
                {/* Month / week navigation arrows */}
                {calView !== 'list' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigateCal(-1)} className={`p-2 rounded-xl ${card} ${muted} hover:text-teal-500 transition-colors border border-slate-200 dark:border-slate-700`}>
                      <ChevronLeft size={16} />
                    </button>
                    <span className={`text-sm font-black ${txt} min-w-[200px] text-center`}>{_calNavLabel}</span>
                    <button onClick={() => navigateCal(1)} className={`p-2 rounded-xl ${card} ${muted} hover:text-teal-500 transition-colors border border-slate-200 dark:border-slate-700`}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* ──── MONTH VIEW ──── */}
              {calView === 'month' && (() => {
                const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                const cells = [];
                for (let i = 0; i < _calFirstDow; i++) cells.push(null);
                for (let d = 1; d <= _calDaysInMonth; d++) cells.push(d);
                const rows = [];
                for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
                while (rows[rows.length - 1].length < 7) rows[rows.length - 1].push(null);
                return (
                  <div>
                    <div className="grid grid-cols-7 mb-1">
                      {DAY_NAMES.map(d => (
                        <div key={d} className={`text-center text-[11px] font-black ${subtl} uppercase py-1.5`}>{d}</div>
                      ))}
                    </div>
                    {rows.map((row, ri) => (
                      <div key={ri} className="grid grid-cols-7 gap-1 mb-1">
                        {row.map((day, ci) => {
                          if (!day) return <div key={ci} className="min-h-[80px] rounded-xl opacity-0" />;
                          const isToday = new Date(_calYear, _calMonth, day, 12).toDateString() === _calToday.toDateString();
                          const dayItems = filteredContent.filter(item => {
                            const pd = parseItemDate(item.date);
                            return pd && pd.getDate() === day && pd.getMonth() === _calMonth && pd.getFullYear() === _calYear;
                          });
                          return (
                            <div key={ci} className={`min-h-[80px] p-1.5 rounded-xl border transition-colors ${isToday ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                              <div className={`text-[12px] font-black mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-teal-600 text-white' : txt}`}>{day}</div>
                              <div className="space-y-0.5">
                                {dayItems.slice(0, 3).map((item, ii) => (
                                  <div key={ii} title={`${item.title} — ${item.platform}`}
                                    className={`text-[9px] font-black px-1 py-0.5 rounded truncate leading-tight ${typeColor[item.type] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                    {item.title}
                                  </div>
                                ))}
                                {dayItems.length > 3 && (
                                  <div className={`text-[9px] font-bold ${subtl}`}>+{dayItems.length - 3} more</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ──── WEEK VIEW ──── */}
              {calView === 'week' && (() => {
                const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                return (
                  <div className="grid grid-cols-7 gap-2">
                    {_calWeekDays.map((wd, i) => {
                      const isToday = wd.toDateString() === _calToday.toDateString();
                      const dayItems = filteredContent.filter(item => {
                        const pd = parseItemDate(item.date);
                        return pd && pd.toDateString() === wd.toDateString();
                      });
                      return (
                        <div key={i} className={`rounded-2xl p-2 border ${isToday ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                          <div className="text-center mb-2">
                            <div className={`text-[11px] font-black uppercase ${subtl} mb-0.5`}>{DAY_NAMES[wd.getDay()]}</div>
                            <div className={`text-base font-black w-8 h-8 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-teal-600 text-white' : txt}`}>{wd.getDate()}</div>
                          </div>
                          <div className="space-y-1">
                            {dayItems.map((item, ii) => (
                              <div key={ii} title={`${item.title} — ${item.platform}`}
                                className={`text-[10px] font-black px-1.5 py-1 rounded-lg truncate ${typeColor[item.type] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                {item.title}
                              </div>
                            ))}
                            {dayItems.length === 0 && (
                              <div className={`text-[10px] ${subtl} text-center py-2`}>—</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* ──── LIST VIEW ──── */}
              {calView === 'list' && (
                <div className="space-y-3">
                  {filteredContent.map((item, i) => {
                    const isIso = /^\d{4}-\d{2}-\d{2}$/.test(item.date);
                    const dow   = isIso ? new Date(item.date + 'T12:00:00').toLocaleDateString('default', { weekday: 'short' }) : item.date.split(' ')[0];
                    const dom   = isIso ? new Date(item.date + 'T12:00:00').getDate() : item.date.split(' ')[1];
                    return (
                      <div key={i} className={`flex items-center gap-4 p-4 ${rowCls} rounded-2xl`}>
                        <div className={`shrink-0 text-center w-12 ${card} px-2 py-1.5 rounded-xl`}>
                          <div className={`text-[13px] font-black uppercase ${subtl}`}>{dow}</div>
                          <div className={`text-lg font-black ${txt}`}>{dom}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${txt} truncate`}>{item.title}</p>
                          <p className={`text-[13px] ${muted} font-medium mt-0.5`}>{item.platform}</p>
                          {item.notes && <p className={`text-[12px] ${subtl} mt-0.5 truncate`}>{item.notes}</p>}
                        </div>
                        <span className={`shrink-0 text-[13px] font-black px-2 py-1 rounded-full ${typeColor[item.type]||''}`}>{item.type}</span>
                        <span className={`shrink-0 text-[12px] font-black px-2 py-1 rounded-full capitalize ${statusColor[item.status]||''}`}>{item.status}</span>
                        {item.status !== 'published' && /Facebook|Instagram/i.test(item.platform) && (
                          <button
                            onClick={() => publishPost(item, i)}
                            disabled={autoPostLoading[i]}
                            title="Publish now to Facebook via Graph API"
                            className="shrink-0 flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40">
                            {autoPostLoading[i] ? <RefreshCw size={10} className="animate-spin" /> : <Send size={10} />}
                            {autoPostLoading[i] ? '…' : 'Publish'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════ REVIEWS ══════════════════ */}
        {activeTab === 'reviews' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 [&>*]:min-w-0">
              <StatCard title="Overall Rating"    value={_avgRating ? _avgRating + ' ★' : '—'} trend={null} icon={Star} color="bg-amber-500" sub={_platformEntries.length ? 'Weighted Avg — All Platforms' : 'Google Business Profile'} />
              <StatCard title="Total Reviews"     value={_totalReviewCount || '—'} trend={null} icon={MessageSquare} color="bg-teal-600" sub={_platformEntries.length ? `Across ${_platformEntries.length} platform${_platformEntries.length!==1?'s':''}` : 'All Time'} />
              <StatCard title="Best Platform"     value={_bestPlatform ? _bestPlatform[0].charAt(0).toUpperCase()+_bestPlatform[0].slice(1) : '—'} trend={null} icon={Trophy} color="bg-emerald-600" sub={_bestPlatform ? _bestPlatform[1].rating+' ★ · '+Number(_bestPlatform[1].count).toLocaleString()+' reviews' : 'No platform data'} />
              <StatCard title="Most Reviews"      value={_mostReviewsPlatform ? Number(_mostReviewsPlatform[1].count).toLocaleString() : '—'} trend={null} icon={ThumbsUp} color="bg-purple-600" sub={_mostReviewsPlatform ? _mostReviewsPlatform[0].charAt(0).toUpperCase()+_mostReviewsPlatform[0].slice(1) : 'No platform data'} />
            </div>

            {/* ── Multi-Platform Review Tracker ── */}
            <div className={`${card} p-6 rounded-[2rem] mb-8`}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl"><Star size={16} className="text-amber-500" /></div>
                  <div>
                    <p className={`text-sm font-black ${txt}`}>Live Review Scores</p>
                    <p className={`text-xs ${subtl}`}>Fetch live scores from each platform — or enter manually</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {_platformEntries.length > 0 && (
                    <span className={`text-xs font-black px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400`}>
                      {_totalReviewCount.toLocaleString()} total · {_avgRating} ★ avg
                    </span>
                  )}
                  <button
                    onClick={() => {
                      const platforms = ['google','yelp','glassdoor','indeed','healthgrades','zocdoc'];
                      platforms.forEach((p, i) => setTimeout(() => fetchPlatformReviews(p), i * 300));
                    }}
                    disabled={reviewFetchingPlatform !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-black transition-all"
                  >
                    <RefreshCw size={11} className={reviewFetchingPlatform ? 'animate-spin' : ''} />
                    Fetch All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[
                  { key: 'google',       label: 'Google',       color: 'text-red-500',     border: 'border-red-200 dark:border-red-800',         bg: 'bg-red-50 dark:bg-red-900/10'         },
                  { key: 'yelp',         label: 'Yelp',         color: 'text-orange-500',  border: 'border-orange-200 dark:border-orange-800',   bg: 'bg-orange-50 dark:bg-orange-900/10'   },
                  { key: 'glassdoor',    label: 'Glassdoor',    color: 'text-emerald-500', border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                  { key: 'indeed',       label: 'Indeed',       color: 'text-blue-500',    border: 'border-blue-200 dark:border-blue-800',       bg: 'bg-blue-50 dark:bg-blue-900/10'       },
                  { key: 'healthgrades', label: 'Healthgrades', color: 'text-teal-500',    border: 'border-teal-200 dark:border-teal-800',       bg: 'bg-teal-50 dark:bg-teal-900/10'       },
                  { key: 'zocdoc',       label: 'ZocDoc',       color: 'text-purple-500',  border: 'border-purple-200 dark:border-purple-800',   bg: 'bg-purple-50 dark:bg-purple-900/10'   },
                ].map(plat => {
                  const saved     = reviewPlatformData[plat.key] || {};
                  const editing   = reviewPlatformForm.editingPlatform === plat.key;
                  const fetching  = reviewFetchingPlatform === plat.key;
                  const isLive    = saved.source === 'live';
                  const hasError  = !!saved.fetchError;
                  const fetchAge  = saved.fetchedAt ? (() => {
                    const mins = Math.floor((Date.now() - new Date(saved.fetchedAt)) / 60000);
                    return mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : `${Math.floor(mins/60)}h ago`;
                  })() : null;
                  return (
                    <div key={plat.key} className={`p-4 rounded-2xl border ${plat.border} ${plat.bg} flex flex-col`}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-black ${plat.color}`}>{plat.label}</span>
                        <div className="flex items-center gap-1">
                          {isLive && !hasError && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">Live</span>
                          )}
                          {saved.source === 'manual' && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">Manual</span>
                          )}
                          {saved.rating && (
                            <span className="flex gap-0.5 ml-0.5">
                              {[1,2,3,4,5].map(n => <Star key={n} size={8} className={n<=Math.round(Number(saved.rating))?'text-amber-400 fill-amber-400':'text-slate-300 dark:text-slate-600'} />)}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Score */}
                      {editing ? null : (
                        <div className="flex-1">
                          {(saved.rating || saved.count) ? (
                            <div className="mb-1">
                              <span className={`text-2xl font-black ${plat.color}`}>{saved.rating || '—'}</span>
                              {saved.rating && <span className={`text-base ${plat.color} ml-0.5`}>★</span>}
                              {saved.count && <p className={`text-xs ${subtl} mt-0.5`}>{Number(saved.count).toLocaleString()} reviews</p>}
                            </div>
                          ) : (
                            <p className={`text-xs ${subtl} mb-1`}>{fetching ? 'Fetching…' : 'No data yet'}</p>
                          )}
                          {hasError && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 leading-tight mb-1 line-clamp-2" title={saved.fetchError}>
                              {saved.fetchError}
                            </p>
                          )}
                          {fetchAge && !hasError && (
                            <p className={`text-[10px] ${subtl}`}>Fetched {fetchAge}</p>
                          )}
                        </div>
                      )}
                      {/* Edit form */}
                      {editing && (
                        <div className="space-y-2 mt-1">
                          <input type="number" min="1" max="5" step="0.1" placeholder="Rating (e.g. 4.7)"
                            value={reviewPlatformForm.rating}
                            onChange={e => setReviewPlatformForm(f => ({...f, rating: e.target.value}))}
                            className={`px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${txt} text-xs w-full focus:outline-none focus:border-amber-400`}
                          />
                          <input type="number" min="0" placeholder="Review count"
                            value={reviewPlatformForm.count}
                            onChange={e => setReviewPlatformForm(f => ({...f, count: e.target.value}))}
                            className={`px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${txt} text-xs w-full focus:outline-none focus:border-amber-400`}
                          />
                          <input type="url" placeholder="Review page URL (optional)"
                            value={reviewPlatformForm.url}
                            onChange={e => setReviewPlatformForm(f => ({...f, url: e.target.value}))}
                            className={`px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${txt} text-xs w-full focus:outline-none focus:border-amber-400`}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => savePlatformData(plat.key)} className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-black rounded-lg transition-all">Save</button>
                            <button onClick={() => setReviewPlatformForm({ editingPlatform: null, rating: '', count: '', url: '' })} className={`flex-1 py-1.5 ${card} border border-slate-200 dark:border-slate-700 ${muted} text-xs font-black rounded-lg hover:text-red-400 transition-all`}>Cancel</button>
                          </div>
                        </div>
                      )}
                      {/* Actions */}
                      {!editing && (
                        <div className="flex gap-1.5 mt-3">
                          <button
                            onClick={() => fetchPlatformReviews(plat.key)}
                            disabled={fetching || reviewFetchingPlatform !== null}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-black transition-all`}
                          >
                            <RefreshCw size={10} className={fetching ? 'animate-spin' : ''} />
                            {fetching ? 'Fetching' : 'Fetch'}
                          </button>
                          <button
                            onClick={() => setReviewPlatformForm({ editingPlatform: plat.key, rating: saved.rating||'', count: saved.count||'', url: saved.url||'' })}
                            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 ${card} text-xs font-black ${muted} hover:text-amber-500 transition-all`}
                          ><Pencil size={10} /></button>
                          {saved.url && (
                            <a href={saved.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-teal-600 hover:text-white transition-all">
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
                      {reviewDrafts[i] && (
                        <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                          <p className="text-[11px] font-black text-purple-500 uppercase tracking-wider mb-1">AI Draft Response</p>
                          <p className={`text-xs ${txt2} leading-relaxed`}>{reviewDrafts[i]}</p>
                          <button onClick={() => { navigator.clipboard.writeText(reviewDrafts[i]); }} className="mt-1.5 text-[11px] font-black text-purple-500 hover:text-purple-400">Copy</button>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2 gap-2 flex-wrap">
                        <button
                          onClick={() => generateReviewResponse(r, i)}
                          disabled={reviewDraftLoading[i]}
                          className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors disabled:opacity-40">
                          {reviewDraftLoading[i] ? <RefreshCw size={9} className="animate-spin" /> : <Bot size={9} />}
                          {reviewDraftLoading[i] ? 'Writing…' : reviewDrafts[i] ? 'Regenerate' : 'AI Draft Response'}
                        </button>
                        <span className={`text-[12px] font-black px-2 py-1 rounded-full ${r.responded ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                          {r.responded ? <><CheckCircle size={9} className="inline mr-1" />Responded</> : 'Needs Response'}
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
                  <SectionHeader icon={Link2} color="text-teal-500" title="Page Intelligence Scraper" subtitle="Deep-scan any facility, save profiles, and compare head-to-head" />
                  {/* Sub-view tabs */}
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                      ['scan',    'Scan Page'],
                      ['library', 'Facility Library' + (facilityProfiles.length > 0 ? ' (' + facilityProfiles.length + ')' : '')],
                      ['compare', 'Compare'],
                    ].map(([id, lbl]) => (
                      <button key={id} onClick={() => setScraperSubView(id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${scraperSubView===id ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 ' + muted + ' hover:text-teal-500'}`}>
                        {id === 'scan' && <Globe size={11} className="inline mr-1" />}
                        {id === 'library' && <Layers size={11} className="inline mr-1" />}
                        {id === 'compare' && <Scale size={11} className="inline mr-1" />}
                        {lbl}
                      </button>
                    ))}
                  </div>

                  {/* SCAN VIEW */}
                  {scraperSubView === 'scan' && (
                    <>
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input
                          className={`flex-1 bg-slate-100 dark:bg-slate-800 ${txt} rounded-xl px-4 py-2.5 text-sm border ${brd} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          value={scraperUrl}
                          onChange={e => setScraperUrl(e.target.value)}
                          placeholder="https://competitor.com or https://destinyspringshealthcare.com"
                          onKeyDown={e => { if (e.key === 'Enter') fetchScrapeUrl(scraperUrl); }}
                        />
                        <button onClick={() => fetchScrapeUrl(scraperUrl)} disabled={scraperLoading || !scraperUrl}
                          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-black flex items-center gap-2 disabled:opacity-50">
                          {scraperLoading ? <RefreshCw size={14} className="animate-spin" /> : <Globe size={14} />}
                          {scraperLoading ? 'Scanning...' : 'Deep Scan'}
                        </button>
                      </div>
                      {scraperError && <p className="text-rose-500 text-sm mb-4">{scraperError}</p>}
                      {scraperResult && (
                        <div className="flex gap-3 mb-5 items-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                          <Tag size={14} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
                          <input className={`flex-1 bg-white dark:bg-slate-800 ${txt} rounded-lg px-3 py-1.5 text-sm border ${brd} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                            value={scraperLabel} onChange={e => setScraperLabel(e.target.value)}
                            placeholder="Name this facility (e.g. Banner Behavioral Health)" />
                          <button onClick={() => saveFacilityProfile(scraperLabel, scraperResult)}
                            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-black flex items-center gap-1 flex-shrink-0">
                            <Plus size={11} /> Save to Library
                          </button>
                        </div>
                      )}
                      {scraperResult && (
                        <div className="space-y-4">
                          {/* Quick stats bar */}
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {[
                              { lbl: 'Words',    val: (scraperResult.wordCount||0).toLocaleString(), color: 'text-teal-500' },
                              { lbl: 'Links',    val: scraperResult.linkCount||0,                    color: 'text-blue-500' },
                              { lbl: 'Phones',   val: scraperResult.phones?.length||0,               color: 'text-emerald-500' },
                              { lbl: 'Emails',   val: scraperResult.emails?.length||0,               color: 'text-violet-500' },
                              { lbl: 'Socials',  val: Object.keys(scraperResult.socials||{}).length, color: 'text-pink-500' },
                              { lbl: 'Services', val: (scraperResult.servicesFound||[]).length,      color: 'text-orange-500' },
                            ].map(s => (
                              <div key={s.lbl} className={`p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center border ${brd}`}>
                                <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                                <p className={`text-[10px] font-black ${subtl} uppercase tracking-wide`}>{s.lbl}</p>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left: SEO + Headings */}
                            <div className="space-y-3">
                              {scraperResult.image && (
                                <img src={scraperResult.image} alt="OG" className="w-full h-36 object-cover rounded-2xl"
                                  onError={e => e.currentTarget.style.display='none'} />
                              )}
                              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-3">
                                <div>
                                  <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mb-0.5`}>Page Title</p>
                                  <p className={`font-black text-sm ${txt}`}>{scraperResult.title||'—'}</p>
                                </div>
                                <div>
                                  <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mb-0.5`}>Meta Description</p>
                                  <p className={`text-xs ${txt2}`}>{scraperResult.description||'—'}</p>
                                </div>
                                {scraperResult.keywords && (
                                  <div>
                                    <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mb-0.5`}>Meta Keywords</p>
                                    <p className={`text-xs ${txt2}`}>{scraperResult.keywords}</p>
                                  </div>
                                )}
                                <div>
                                  <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mb-0.5`}>H1 Heading</p>
                                  <p className={`font-black text-sm text-teal-600 dark:text-teal-400`}>{scraperResult.h1||'—'}</p>
                                </div>
                              </div>
                              {scraperResult.h2s?.length > 0 && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                  <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mb-2`}>H2 Headings ({scraperResult.h2s.length})</p>
                                  <ul className="space-y-1">
                                    {scraperResult.h2s.map((h,i) => <li key={i} className={`text-xs ${txt2} flex gap-2`}><span className="text-teal-500 font-black">H2</span>{h}</li>)}
                                  </ul>
                                </div>
                              )}
                              {scraperResult.h3s?.length > 0 && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                  <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mb-2`}>H3 Headings ({scraperResult.h3s.length})</p>
                                  <ul className="space-y-1">
                                    {scraperResult.h3s.map((h,i) => <li key={i} className={`text-xs ${txt2} flex gap-2`}><span className="text-slate-400 font-black">H3</span>{h}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                            {/* Right: Signals */}
                            <div className="space-y-3">
                              {(scraperResult.schemaRating || scraperResult.schemaAddress || scraperResult.schemaName) && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
                                  <p className={`text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2`}>Schema.org Structured Data</p>
                                  {scraperResult.schemaName && <p className={`text-xs font-black ${txt} mb-1`}>{scraperResult.schemaName}</p>}
                                  {scraperResult.schemaRating && <p className="text-xs text-amber-600 dark:text-amber-300">&#11088; {scraperResult.schemaRating} ({scraperResult.schemaReviewCount ?? '?'} reviews)</p>}
                                  {scraperResult.schemaAddress && <p className={`text-xs ${subtl} mt-1`}>&#128205; {scraperResult.schemaAddress}</p>}
                                </div>
                              )}
                              {scraperResult.phones?.length > 0 && (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                                  <p className={`text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2`}>Phone Numbers</p>
                                  {scraperResult.phones.map((p,i) => <p key={i} className="text-sm font-black text-emerald-700 dark:text-emerald-300">{p}</p>)}
                                </div>
                              )}
                              {scraperResult.emails?.length > 0 && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl">
                                  <p className={`text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2`}>Email Addresses</p>
                                  {scraperResult.emails.map((e,i) => <p key={i} className="text-xs font-mono text-blue-700 dark:text-blue-300">{e}</p>)}
                                </div>
                              )}
                              {Object.keys(scraperResult.socials||{}).length > 0 && (
                                <div className="p-4 bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800 rounded-2xl">
                                  <p className={`text-[10px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-2`}>Social Media Presence</p>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(scraperResult.socials).map(([platform, link]) => (
                                      <a key={platform} href={link} target="_blank" rel="noreferrer"
                                        className="text-xs px-2.5 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full font-black hover:bg-pink-200 transition-colors capitalize">{platform}</a>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {scraperResult.servicesFound?.length > 0 && (
                                <div className="p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-2xl">
                                  <p className={`text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2`}>Services / Programs Detected ({scraperResult.servicesFound.length})</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {scraperResult.servicesFound.map((s,i) => (
                                      <span key={i} className="text-[11px] px-2 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-full font-black capitalize">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {scraperResult.techStack?.length > 0 && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                  <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mb-2`}>Tech Stack Detected</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {scraperResult.techStack.map((t,i) => (
                                      <span key={i} className={`text-[11px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 ${txt} rounded-full font-black`}>{t}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {!scraperResult && !scraperLoading && (
                        <div className="text-center py-12">
                          <Globe size={36} className={`${subtl} mx-auto mb-3`} />
                          <p className={`text-sm ${muted}`}>Enter any facility URL to extract a deep intelligence profile.</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* FACILITY LIBRARY VIEW */}
                  {scraperSubView === 'library' && (
                    <>
                      {facilityProfiles.length === 0 ? (
                        <div className="text-center py-16">
                          <Layers size={40} className={`${subtl} mx-auto mb-3`} />
                          <p className={`text-sm font-black ${txt} mb-1`}>No facilities saved yet</p>
                          <p className={`text-xs ${muted}`}>Scan a page and save it to build your competitor library.</p>
                          <button onClick={() => setScraperSubView('scan')} className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black">Go to Scan</button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {facilityProfiles.map((p, i) => (
                            <div key={p.id||i} className={`p-5 rounded-2xl border ${brd} bg-slate-50 dark:bg-slate-800/50 space-y-3`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  {p.image && <img src={p.image} alt="" className="w-full h-24 object-cover rounded-xl mb-2" onError={e => e.currentTarget.style.display='none'} />}
                                  <p className={`font-black text-sm ${txt} truncate`}>{p.label}</p>
                                  <a href={p.url} target="_blank" rel="noreferrer" className="text-[11px] text-teal-500 hover:underline truncate block">{p.url}</a>
                                  <p className={`text-[10px] ${subtl} mt-0.5`}>Scanned {p.savedAt}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button onClick={() => { setScraperUrl(p.url); setScraperSubView('scan'); fetchScrapeUrl(p.url); }}
                                    title="Re-scan" className="p-1.5 text-teal-500 hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors">
                                    <RefreshCw size={13} />
                                  </button>
                                  <button onClick={() => removeFacilityProfile(p.id||i)} title="Remove"
                                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="text-[10px] px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full font-black">{(p.wordCount||0).toLocaleString()} words</span>
                                <span className="text-[10px] px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full font-black">{(p.servicesFound||[]).length} services</span>
                                <span className="text-[10px] px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full font-black">{Object.keys(p.socials||{}).length} socials</span>
                                {p.schemaRating && <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-black">&#11088; {p.schemaRating}</span>}
                                {(p.techStack||[]).slice(0,2).map((t,ti) => <span key={ti} className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-black">{t}</span>)}
                              </div>
                              {p.h1 && <p className={`text-xs italic ${txt2} line-clamp-1`}>"{p.h1}"</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* COMPARE VIEW */}
                  {scraperSubView === 'compare' && (
                    <>
                      {facilityProfiles.length < 2 ? (
                        <div className="text-center py-16">
                          <Scale size={40} className={`${subtl} mx-auto mb-3`} />
                          <p className={`text-sm font-black ${txt} mb-1`}>Need at least 2 saved facilities</p>
                          <p className={`text-xs ${muted}`}>Save 2+ facility profiles in the library to compare them.</p>
                          <button onClick={() => setScraperSubView('scan')} className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black">Go to Scan</button>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {[['Facility A (You)', compareIdxA, setCompareIdxA], ['Facility B (Competitor)', compareIdxB, setCompareIdxB]].map(([lbl, val, setter]) => (
                              <div key={lbl}>
                                <p className={`text-[11px] font-black ${subtl} uppercase tracking-wider mb-1.5`}>{lbl}</p>
                                <select value={val} onChange={e => setter(Number(e.target.value))}
                                  className={`w-full bg-slate-100 dark:bg-slate-800 ${txt} rounded-xl px-3 py-2 text-sm border ${brd} focus:outline-none focus:ring-2 focus:ring-teal-500`}>
                                  {facilityProfiles.map((p,i) => <option key={i} value={i}>{p.label}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                          {(() => {
                            const a = facilityProfiles[compareIdxA];
                            const b = facilityProfiles[compareIdxB];
                            if (!a || !b) return null;
                            const rows = [
                              { label: 'Word Count',       aVal: (a.wordCount||0).toLocaleString(), bVal: (b.wordCount||0).toLocaleString(), winA: (a.wordCount||0)>(b.wordCount||0), winB: (b.wordCount||0)>(a.wordCount||0) },
                              { label: 'Total Links',      aVal: a.linkCount||0,   bVal: b.linkCount||0,   winA: (a.linkCount||0)>(b.linkCount||0), winB: (b.linkCount||0)>(a.linkCount||0) },
                              { label: 'H2 Count',         aVal: (a.h2s||[]).length, bVal: (b.h2s||[]).length, winA: (a.h2s||[]).length>(b.h2s||[]).length, winB: (b.h2s||[]).length>(a.h2s||[]).length },
                              { label: 'Services Listed',  aVal: (a.servicesFound||[]).length, bVal: (b.servicesFound||[]).length, winA: (a.servicesFound||[]).length>(b.servicesFound||[]).length, winB: (b.servicesFound||[]).length>(a.servicesFound||[]).length },
                              { label: 'Social Platforms', aVal: Object.keys(a.socials||{}).join(', ')||'none', bVal: Object.keys(b.socials||{}).join(', ')||'none', winA: Object.keys(a.socials||{}).length>Object.keys(b.socials||{}).length, winB: Object.keys(b.socials||{}).length>Object.keys(a.socials||{}).length },
                              { label: 'Phone Numbers',    aVal: (a.phones||[]).length + ' found', bVal: (b.phones||[]).length + ' found', winA: (a.phones||[]).length>(b.phones||[]).length, winB: (b.phones||[]).length>(a.phones||[]).length },
                              { label: 'Email Addresses',  aVal: (a.emails||[]).length + ' found', bVal: (b.emails||[]).length + ' found', winA: (a.emails||[]).length>(b.emails||[]).length, winB: (b.emails||[]).length>(a.emails||[]).length },
                              { label: 'Schema Rating',    aVal: a.schemaRating ? a.schemaRating + ' (' + (a.schemaReviewCount??'?') + 'r)' : 'Not found', bVal: b.schemaRating ? b.schemaRating + ' (' + (b.schemaReviewCount??'?') + 'r)' : 'Not found', winA: !!a.schemaRating && (!b.schemaRating || Number(a.schemaRating)>=Number(b.schemaRating)), winB: !!b.schemaRating && (!a.schemaRating || Number(b.schemaRating)>Number(a.schemaRating)) },
                              { label: 'Meta Description', aVal: a.description ? 'Present' : 'Missing', bVal: b.description ? 'Present' : 'Missing', winA: !!a.description && !b.description, winB: !!b.description && !a.description },
                              { label: 'Meta Keywords',    aVal: a.keywords ? 'Present' : 'Missing',    bVal: b.keywords ? 'Present' : 'Missing',    winA: !!a.keywords && !b.keywords, winB: !!b.keywords && !a.keywords },
                              { label: 'Tech Stack',       aVal: (a.techStack||[]).join(', ')||'Unknown', bVal: (b.techStack||[]).join(', ')||'Unknown', winA: false, winB: false },
                              { label: 'Meta Pixel',       aVal: (a.techStack||[]).includes('Meta Pixel') ? 'Yes' : 'No', bVal: (b.techStack||[]).includes('Meta Pixel') ? 'Yes' : 'No', winA: (a.techStack||[]).includes('Meta Pixel') && !(b.techStack||[]).includes('Meta Pixel'), winB: (b.techStack||[]).includes('Meta Pixel') && !(a.techStack||[]).includes('Meta Pixel') },
                              { label: 'Google Analytics', aVal: (a.techStack||[]).includes('Google Analytics') ? 'Yes' : 'No', bVal: (b.techStack||[]).includes('Google Analytics') ? 'Yes' : 'No', winA: false, winB: false },
                            ];
                            return (
                              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
                                <table className="w-full text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-slate-100 dark:bg-slate-800">
                                      <th className={`text-left py-3 px-4 ${subtl} font-black uppercase tracking-wider text-[10px] w-1/4`}>Signal</th>
                                      <th className="text-left py-3 px-4 text-teal-600 dark:text-teal-400 font-black uppercase tracking-wider text-[10px] w-[37.5%]">{a.label}</th>
                                      <th className="text-left py-3 px-4 text-violet-600 dark:text-violet-400 font-black uppercase tracking-wider text-[10px] w-[37.5%]">{b.label}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((row, ri) => (
                                      <tr key={ri} className={`border-t border-slate-200 dark:border-slate-700 ${ri%2===0 ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}>
                                        <td className={`py-2.5 px-4 font-black ${subtl} text-[11px]`}>{row.label}</td>
                                        <td className={`py-2.5 px-4 text-[11px] ${row.winA ? 'text-teal-600 dark:text-teal-400 font-black' : txt2}`}>
                                          {row.winA && <span className="mr-1">&#127942;</span>}{row.aVal}
                                        </td>
                                        <td className={`py-2.5 px-4 text-[11px] ${row.winB ? 'text-violet-600 dark:text-violet-400 font-black' : txt2}`}>
                                          {row.winB && <span className="mr-1">&#127942;</span>}{row.bVal}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                          <button onClick={() => generateCompareReport(facilityProfiles[compareIdxA], facilityProfiles[compareIdxB])}
                            disabled={compareReportLoading}
                            className="w-full py-3 bg-gradient-to-r from-teal-600 to-violet-600 hover:from-teal-500 hover:to-violet-500 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-60 transition-all mb-4">
                            {compareReportLoading ? <RefreshCw size={14} className="animate-spin" /> : <CaptainKPI size={20} />}
                            {compareReportLoading ? 'Captain KPI is analyzing...' : 'Generate AI Competitive Brief'}
                          </button>
                          {compareReport && (
                            <div className={`p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border ${brd}`}>
                              <div className="flex items-center gap-2 mb-3">
                                <CaptainKPI size={24} />
                                <p className={`text-xs font-black ${txt} uppercase tracking-wider`}>Captain KPI's Competitive Brief</p>
                              </div>
                              <div className="space-y-0.5">
                                {compareReport.split('\n').map((line,i) => {
                                  if (line.startsWith('## ')) return <p key={i} className="text-sm font-black text-teal-600 dark:text-teal-400 mt-4 mb-1 uppercase tracking-wide">{line.slice(3)}</p>;
                                  if (line.startsWith('### ')) return <p key={i} className={`text-xs font-black ${txt} mt-3 mb-1`}>{line.slice(4)}</p>;
                                  if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className={`text-xs ${txt2} pl-3 flex gap-1.5`}><span className="text-teal-500 flex-shrink-0">&#8226;</span><span>{line.slice(2).replace(/\*\*/g,'')}</span></p>;
                                  if (line.trim()==='') return <div key={i} className="h-1.5" />;
                                  return <p key={i} className={`text-xs ${txt2}`}>{line.replace(/\*\*/g,'')}</p>;
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

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
                      { label: 'NIMH News',        url: 'https://www.nimh.nih.gov/rss/health.rss' },
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
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
                    <div className="flex items-center gap-2 truncate mr-2">
                      <span className="truncate">Last sync: {intg.lastSync}</span>
                      {(() => {
                        const ts = liveData._timestamps?.[intg.name];
                        if (!ts) return null;
                        const diff = Date.now() - new Date(ts).getTime();
                        const label = diff < 60000 ? 'Just now' : diff < 3600000 ? `${Math.floor(diff/60000)}m ago` : diff < 86400000 ? `${Math.floor(diff/3600000)}h ago` : `${Math.floor(diff/86400000)}d ago`;
                        const fresh = diff < 3600000;
                        return <span className={`shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-full ${fresh ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{label}</span>;
                      })()}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {intg.connected && (
                        <button onClick={() => disconnectIntegration(intg.name)} className="text-rose-400 hover:text-rose-300 font-black flex items-center gap-1 text-[11px]">
                          <WifiOff size={10} /> Disconnect
                        </button>
                      )}
                      {intg.connected && (integrationFields[intg.name] || []).length > 0 && (
                        <button onClick={() => { setConnectModal(intg.name); setConnectFormData(connections[intg.name] || {}); setConnectError(null); }} className="text-amber-500 hover:text-amber-400 font-black flex items-center gap-1 text-[11px]">
                          <Pencil size={10} /> Edit
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

            {/* ── Backup & Sync card ──────────────────────────────────────── */}
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-6`}>
              <SectionHeader icon={RefreshCw} color="text-indigo-500" title="Cloud Sync" subtitle="All data syncs automatically across every device in real time" />

              {/* Cloud status banner */}
              {cloudSynced === 'offline' ? (
                <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40">
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">☁️ Cloud sync not configured yet</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mb-3">To enable automatic cross-device sync, create a free Upstash Redis database (takes ~2 min):</p>
                  <ol className="text-xs text-amber-600 dark:text-amber-500 space-y-1 list-decimal list-inside mb-3">
                    <li>Go to <strong>upstash.com</strong> → sign in → <strong>Create Database</strong> → Redis → any region → <strong>Create</strong></li>
                    <li>Open the database → <strong>REST API</strong> tab → copy <strong>UPSTASH_REDIS_REST_URL</strong> and <strong>UPSTASH_REDIS_REST_TOKEN</strong></li>
                    <li>Go to your <strong>Vercel project</strong> → <strong>Settings</strong> → <strong>Environment Variables</strong></li>
                    <li>Add both variables, then <strong>Redeploy</strong> — sync activates instantly</li>
                  </ol>
                  <p className="text-xs text-amber-500 dark:text-amber-600">Until then, use the <strong>Export Backup</strong> button below to manually move data between devices.</p>
                </div>
              ) : (
                <div className="mb-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Auto-sync active</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">Data saves automatically — open this dashboard on any device and you'll see the latest data instantly.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <p className={`text-sm font-bold ${txt} mb-1`}>Manual backup (optional fallback)</p>
                  <p className={`text-xs ${subtl}`}>Export a full JSON backup of all dashboard data. Useful for archival or restoring to a brand-new Vercel deployment.</p>
                </div>
                <button
                  onClick={exportBackup}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black transition-colors flex-shrink-0"
                >
                  <Download size={15} /> Export Backup
                </button>
              </div>
            </div>

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Upload} color="text-teal-500" title="Import Data" subtitle="Upload files, paste CSV, or enter data manually" />
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  ['upload',   <><Upload size={12} className="inline mr-1" />File Upload</>],
                  ['paste',    <><FileText size={12} className="inline mr-1" />Paste CSV</>],
                  ['manual',   <><Pencil size={12} className="inline mr-1" />Manual Entry</>],
                  ['survey',   <><ThumbsUp size={12} className="inline mr-1" />SurveyMonkey</>],
                  ['wix',      <><Globe size={12} className="inline mr-1" />Wix Analytics</>],
                ].map(([m, label]) => (
                  <button key={m} onClick={() => { setImportMode(m); setSurveyParsed(null); setPasteCSV(''); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      importMode===m
                        ? m==='survey' ? 'bg-amber-500 text-white' : 'bg-teal-600 text-white'
                        : `bg-slate-100 dark:bg-slate-800 ${muted} hover:text-teal-500`
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              {importNotice && (
                <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-sm text-teal-700 dark:text-teal-300 font-medium flex items-center justify-between">
                  <span>{importNotice}</span>
                  <button onClick={() => setImportNotice('')} className="ml-3 text-teal-500 hover:text-teal-700"><X size={14} /></button>
                </div>
              )}

              {importMode === 'upload' && (
                <>
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
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >Browse Files</button>
                    <button className={`px-6 py-2.5 ${card} ${muted} rounded-xl text-sm font-black border hover:text-teal-500 transition-all`}><Download size={13} className="inline mr-1.5" />Download Template</button>
                  </div>
                  <div className="flex gap-2 justify-center mt-5 flex-wrap">
                    {['Google Analytics', 'Meta Business', 'Mailchimp', 'Google Ads', 'TikTok', 'SurveyMonkey', 'Generic CSV'].map(fmt => (
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

              {importMode === 'survey' && (
                <div>
                  {/* Instructions */}
                  <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40">
                    <p className="text-sm font-black text-amber-700 dark:text-amber-400 mb-1">How to export from SurveyMonkey</p>
                    <ol className="text-xs text-amber-600 dark:text-amber-500 space-y-0.5 list-decimal list-inside">
                      <li>Open your survey → <strong>Analyze Results</strong> tab</li>
                      <li>Click <strong>Export All</strong> → <strong>Export File</strong></li>
                      <li>Choose <strong>All Responses Data</strong> → format <strong>CSV</strong></li>
                      <li>Paste the file contents below or drop the file onto the drop zone</li>
                    </ol>
                  </div>

                  {/* Drop zone */}
                  <div
                    className="border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-2xl p-8 text-center mb-4 cursor-pointer hover:border-amber-500 transition-colors"
                    onClick={() => surveyFileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = ev => setPasteCSV(ev.target.result);
                      reader.readAsText(f);
                    }}
                  >
                    <input type="file" ref={surveyFileRef} accept=".csv,.txt" className="hidden"
                      onChange={e => {
                        const f = e.target.files[0]; if (!f) return;
                        const reader = new FileReader();
                        reader.onload = ev => setPasteCSV(ev.target.result);
                        reader.readAsText(f);
                        e.target.value = '';
                      }}
                    />
                    <Upload size={28} className="text-amber-400 mx-auto mb-2" />
                    <p className={`text-sm font-black ${txt}`}>Drop your SurveyMonkey CSV here</p>
                    <p className={`text-xs ${subtl} mt-1`}>or click to browse</p>
                  </div>

                  {/* Paste area */}
                  <div className="mb-4">
                    <label className={`block text-[11px] font-black ${muted} uppercase tracking-wider mb-1.5`}>Or paste CSV text</label>
                    <textarea
                      value={pasteCSV}
                      onChange={e => { setPasteCSV(e.target.value); setSurveyParsed(null); }}
                      className={`w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs ${txt} font-mono h-40 resize-none focus:outline-none focus:border-amber-500`}
                      placeholder={`Respondent ID,Collector ID,Start Date,End Date,...,"How likely are you to recommend us? (0-10)","Overall satisfaction"
,,,,...,"NPS Rating","1-5"
1001,col1,2026-01-10,...,9,4
1002,col1,2026-01-11,...,7,5`}
                    />
                  </div>

                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => parseSurveyMonkeyCSV(pasteCSV)}
                      disabled={!pasteCSV.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-white rounded-xl text-sm font-black transition-colors"
                    >
                      <Search size={13} /> Parse Survey
                    </button>
                    {surveyParsed && (
                      <button
                        onClick={confirmSaveSurvey}
                        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-black transition-colors"
                      >
                        <CheckCircle size={13} /> Confirm &amp; Save
                      </button>
                    )}
                  </div>

                  {/* Parsed preview */}
                  {surveyParsed && (
                    <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-amber-700 dark:text-amber-400">Survey Preview — review before saving</p>
                        <span className={`text-[11px] font-bold ${subtl}`}>{surveyParsed.totalResponses} responses</span>
                      </div>

                      {/* Key metrics row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-800 text-center">
                          <p className={`text-2xl font-black ${ surveyParsed.npsScore == null ? subtl : surveyParsed.npsScore >= 50 ? 'text-emerald-600' : surveyParsed.npsScore >= 0 ? 'text-amber-500' : 'text-rose-500' }`}>
                            {surveyParsed.npsScore != null ? surveyParsed.npsScore : '—'}
                          </p>
                          <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mt-0.5`}>NPS Score</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-800 text-center">
                          <p className={`text-2xl font-black ${surveyParsed.avgSatisfaction ? 'text-teal-600' : subtl}`}>
                            {surveyParsed.avgSatisfaction ?? '—'}
                          </p>
                          <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mt-0.5`}>Avg Satisfaction</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-800 text-center">
                          <p className={`text-2xl font-black ${txt}`}>{surveyParsed.totalResponses}</p>
                          <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mt-0.5`}>Responses</p>
                        </div>
                      </div>

                      {/* NPS breakdown */}
                      {surveyParsed.npsBreakdown && (
                        <div className="flex gap-2">
                          {[['Promoters', surveyParsed.npsBreakdown.promoters, 'bg-emerald-500'],
                            ['Passives',  surveyParsed.npsBreakdown.passives,  'bg-amber-400'],
                            ['Detractors',surveyParsed.npsBreakdown.detractors,'bg-rose-500']].map(([label, count, color]) => (
                            <div key={label} className="flex-1 flex flex-col items-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                              <div className={`w-2.5 h-2.5 rounded-full ${color} mb-1`} />
                              <p className={`text-base font-black ${txt}`}>{count}</p>
                              <p className={`text-[9px] font-black ${subtl} uppercase tracking-wider`}>{label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Question breakdown */}
                      {surveyParsed.questionBreakdown.length > 0 && (
                        <div>
                          <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider mb-2`}>Question Results</p>
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {surveyParsed.questionBreakdown.map((q, i) => (
                              <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <p className={`text-xs font-bold ${txt} leading-snug mb-1`}>{q.question}</p>
                                <div className={`flex items-center gap-3 text-[11px] ${subtl}`}>
                                  <span>{q.responseCount} answers</span>
                                  {q.avg && <span className="font-black text-teal-500">Avg {q.avg}</span>}
                                </div>
                                {q.topAnswers.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {q.topAnswers.map((a, j) => (
                                      <span key={j} className={`text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 ${txt2}`}>
                                        {a.answer.slice(0, 40)} <span className="font-black">×{a.count}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                    onClick={() => { saveManualEntry(importDataType); setImportNotice(`Saved entry to ${importDataType}`); }}
                    className="mt-5 flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-black hover:bg-teal-500 transition-all">
                    <Plus size={13} /> Save Entry
                  </button>
                </div>
              )}

              {importMode === 'wix' && (
                <div>
                  {/* ── Instructions ── */}
                  <div className="mb-6 p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50">
                    <p className="text-[13px] font-black text-violet-700 dark:text-violet-300 mb-3 flex items-center gap-2">
                      <Globe size={14} /> How to export from Wix Analytics
                    </p>
                    <ol className="space-y-2 text-xs text-violet-600 dark:text-violet-400">
                      <li className="flex items-start gap-2">
                        <span className="font-black shrink-0 bg-violet-200 dark:bg-violet-800 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">1</span>
                        In your Wix Dashboard, go to <strong>Analytics &amp; Reports → Traffic Overview</strong>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-black shrink-0 bg-violet-200 dark:bg-violet-800 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">2</span>
                        Set your date range (e.g. last 30 days), then click <strong>Export to CSV</strong>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-black shrink-0 bg-violet-200 dark:bg-violet-800 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">3</span>
                        Optionally also export the <strong>Traffic Sources</strong> report for channel breakdowns
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-black shrink-0 bg-violet-200 dark:bg-violet-800 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">4</span>
                        Drop the downloaded file into the upload zone below — we'll auto-parse it
                      </li>
                    </ol>
                  </div>

                  {/* ── CSV upload zone ── */}
                  <div
                    className="border-2 border-dashed border-violet-300 dark:border-violet-700/50 rounded-2xl p-10 text-center hover:border-violet-500 transition-colors cursor-pointer mb-6 group"
                    onClick={() => wixFileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleWixCsvUpload(f); }}
                  >
                    <input
                      type="file"
                      ref={wixFileRef}
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={e => { if (e.target.files[0]) handleWixCsvUpload(e.target.files[0]); e.target.value = ''; }}
                    />
                    <Upload size={30} className={`${subtl} group-hover:text-violet-500 mx-auto mb-2 transition-colors`} />
                    <p className={`text-sm font-black ${txt} mb-1`}>Drop your Wix Analytics CSV here</p>
                    <p className={`text-xs ${subtl} mb-4`}>Traffic Overview or Traffic Sources export — sessions, bounce rate &amp; channels auto-detected</p>
                    <button
                      className="px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-black hover:bg-violet-500 transition-all"
                      onClick={e => { e.stopPropagation(); wixFileRef.current?.click(); }}
                    >
                      Browse File
                    </button>
                  </div>

                  {/* ── Manual entry fallback ── */}
                  <p className={`text-[11px] font-black ${muted} uppercase tracking-wider mb-3`}>Or enter manually</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                    {[
                      { key: 'sessions',   label: 'Monthly Sessions', ph: '12000' },
                      { key: 'bounceRate', label: 'Bounce Rate %',     ph: '45'   },
                      { key: 'organic',    label: 'Organic Search %',  ph: '50'   },
                      { key: 'social',     label: 'Social Media %',    ph: '20'   },
                      { key: 'direct',     label: 'Direct %',          ph: '20'   },
                      { key: 'referral',   label: 'Referral %',        ph: '10'   },
                    ].map(({ key, label, ph }) => (
                      <div key={key}>
                        <label className={`block text-[13px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>{label}</label>
                        <input
                          type="number"
                          placeholder={ph}
                          value={wixFormVals[key] || ''}
                          onChange={e => setWixFormVals(v => ({ ...v, [key]: e.target.value }))}
                          className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm ${txt} focus:outline-none focus:border-violet-500`}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      const r = await fetchWixData(wixFormVals);
                      setImportNotice(r.success ? '\u2705 Wix Analytics data saved!' : `\u26a0\ufe0f ${r.error}`);
                      if (r.success) setWixFormVals({});
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-black hover:bg-violet-500 transition-all"
                  >
                    <Plus size={13} /> Save Wix Data
                  </button>

                  {/* ── Current Wix data preview ── */}
                  {wixData?.sessions > 0 && (
                    <div className="mt-5 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <p className={`text-[11px] font-black ${muted} uppercase tracking-wider mb-3`}>Current Wix Data on Record</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { key: 'sessions',   label: 'Sessions',   unit: ''  },
                          { key: 'bounceRate', label: 'Bounce Rate', unit: '%' },
                          { key: 'organic',    label: 'Organic',    unit: '%' },
                          { key: 'social',     label: 'Social',     unit: '%' },
                          { key: 'direct',     label: 'Direct',     unit: '%' },
                          { key: 'referral',   label: 'Referral',   unit: '%' },
                        ].filter(({ key }) => wixData[key] > 0).map(({ key, label, unit }) => (
                          <div key={key} className="text-center p-2 rounded-xl bg-white dark:bg-slate-900/50">
                            <p className={`text-[11px] ${subtl} uppercase tracking-wider mb-0.5`}>{label}</p>
                            <p className="text-lg font-black text-violet-500">{Number(wixData[key]).toLocaleString()}{unit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

            {/* ── Survey Results history ──────────────────────────────────────────── */}
            {(manualData.survey_results || []).length > 0 && (
              <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-6`}>
                <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                  <SectionHeader icon={ThumbsUp} color="text-amber-500" title="Survey Results" subtitle="Patient satisfaction data imported from SurveyMonkey" />
                  <button
                    onClick={() => { setImportMode('survey'); setSurveyParsed(null); setPasteCSV(''); }}
                    className="text-xs font-black px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={11} /> Import More
                  </button>
                </div>
                <div className="space-y-4">
                  {(manualData.survey_results || []).slice(0, 5).map((survey, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${brd} ${idx === 0 ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${idx === 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 ' + subtl}`}>{idx === 0 ? 'Latest' : `#${idx + 1}`}</span>
                          <span className={`text-xs ${subtl}`}>{survey._savedAt || new Date(survey.importedAt).toLocaleString()}</span>
                        </div>
                        <span className={`text-xs font-black ${subtl}`}>{survey.totalResponses} responses</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <p className={`text-2xl font-black ${survey.npsScore == null ? subtl : survey.npsScore >= 50 ? 'text-emerald-600 dark:text-emerald-400' : survey.npsScore >= 0 ? 'text-amber-500' : 'text-rose-500'}`}>
                            {survey.npsScore != null ? survey.npsScore : '—'}
                          </p>
                          <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider`}>NPS</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-2xl font-black ${survey.avgSatisfaction ? 'text-teal-600 dark:text-teal-400' : subtl}`}>
                            {survey.avgSatisfaction ?? '—'}
                          </p>
                          <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider`}>Avg Sat.</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-2xl font-black ${txt}`}>{survey.totalResponses}</p>
                          <p className={`text-[10px] font-black ${subtl} uppercase tracking-wider`}>Responses</p>
                        </div>
                      </div>
                      {survey.npsBreakdown && (
                        <div className={`flex gap-4 mt-3 pt-3 border-t ${brd} text-xs ${subtl}`}>
                          <span>🟢 Promoters: <strong className={txt}>{survey.npsBreakdown.promoters}</strong></span>
                          <span>🟡 Passives: <strong className={txt}>{survey.npsBreakdown.passives}</strong></span>
                          <span>🔴 Detractors: <strong className={txt}>{survey.npsBreakdown.detractors}</strong></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`${card} p-6 md:p-8 rounded-[2.5rem]`}>
              <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                <SectionHeader icon={Clock} color="text-slate-500" title="Import History" subtitle="Files uploaded and manual entries" />
                {(fileImportLog.length > 0) && (
                  <button
                    onClick={() => { setFileImportLog([]); localStorage.removeItem('dmd_import_log'); }}
                    className={`text-xs font-black px-3 py-1.5 rounded-lg ${subtl} hover:text-rose-500 border ${brd} transition-colors`}
                  >Clear File Log</button>
                )}
              </div>

              {/* ── File upload log ── */}
              {fileImportLog.length > 0 && (
                <div className="mb-6">
                  <p className={`text-[11px] font-black ${muted} uppercase tracking-wider mb-2`}>Files Uploaded ({fileImportLog.length})</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className={`border-b ${brd}`}>
                          {['File Name','Date','Type','Rows'].map(h => (
                            <th key={h} className={`text-left pb-2 font-black ${muted} uppercase tracking-wider pr-4`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${divdr}`}>
                        {fileImportLog.slice(0, 20).map((entry, i) => (
                          <tr key={i} className={rowCls}>
                            <td className={`py-2 pr-4 font-bold ${txt} max-w-[180px] truncate`}>{entry.name}</td>
                            <td className={`py-2 pr-4 ${txt2} whitespace-nowrap`}>{entry.date}</td>
                            <td className={`py-2 pr-4 ${subtl}`}>{entry.type}</td>
                            <td className={`py-2 pr-4 font-bold text-teal-500`}>{entry.rows}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Manual data entries ── */}
              <p className={`text-[11px] font-black ${muted} uppercase tracking-wider mb-2`}>Manual Data Entries</p>
              {(() => {
                const allEntries = Object.entries(manualData)
                  .flatMap(([key, rows]) =>
                    (rows || []).map(row => ({
                      type: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                      savedAt: row._savedAt || '—',
                      summary: Object.entries(row).filter(([k]) => !k.startsWith('_')).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join('  ·  '),
                    }))
                  )
                  .reverse()
                  .slice(0, 25);
                if (allEntries.length === 0) return (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Download size={28} className={`${subtl} mb-2`} />
                    <p className={`text-sm font-bold ${txt} mb-1`}>No manual entries yet</p>
                    <p className={`text-xs ${subtl} max-w-sm`}>Use File Upload, Paste CSV, or Manual Entry above to add data.</p>
                  </div>
                );
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className={`border-b ${brd}`}>
                          {['Type','Saved At','Data Preview'].map(h => (
                            <th key={h} className={`text-left pb-2 font-black ${muted} uppercase tracking-wider pr-4`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${divdr}`}>
                        {allEntries.map((entry, i) => (
                          <tr key={i} className={rowCls}>
                            <td className={`py-2 pr-4 font-bold ${txt} whitespace-nowrap`}>{entry.type}</td>
                            <td className={`py-2 pr-4 ${txt2} whitespace-nowrap`}>{entry.savedAt}</td>
                            <td className={`py-2 pr-4 ${subtl} max-w-xs truncate`}>{entry.summary}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* ── Captain KPI — Import Data Analysis ── */}
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem]`}>
              <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                <SectionHeader icon={Bot} color="text-purple-500" title="AI Data Analysis" subtitle="Captain KPI reads your imported data and delivers the hard truths" />
                <button
                  onClick={analyzeData}
                  disabled={aiInsightsLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-all flex-shrink-0 shadow-lg"
                >
                  <Bot size={14} className={aiInsightsLoading ? 'animate-spin' : ''} />
                  {aiInsightsLoading ? 'Analyzing…' : 'Analyze Imported Data'}
                </button>
              </div>
              {aiInsights ? (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/40">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CaptainKPI size={28} />
                    </div>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Captain KPI reporting:</span>
                  </div>
                  <p className={`text-sm ${txt2} whitespace-pre-wrap leading-relaxed`}>{aiInsights}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <CaptainKPI size={48} />
                  <p className={`text-sm font-black ${txt} mt-3 mb-1`}>Ready to analyze your data</p>
                  <p className={`text-xs ${subtl} max-w-sm text-center`}>Import your data above, then hit Analyze — Captain KPI will break down what it means for Destiny Springs.</p>
                </div>
              )}
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

        {/* ══ CAPTAIN KPI CHATBOT ═══════════════════════════════════════════ */}
        {/* Floating toggle button */}
        <button
          onClick={() => setChatOpen(o => !o)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform no-print"
          title="Captain KPI — AI Marketing Assistant"
        >
          {chatOpen ? <X size={22} /> : <CaptainKPI size={30} />}
        </button>

        {/* Chat panel */}
        {chatOpen && (
          <div
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-3xl shadow-2xl overflow-hidden no-print"
            style={{ maxHeight: '70vh', border: darkMode ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(139,92,246,0.2)', background: darkMode ? '#1e1b4b' : '#faf5ff' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 flex-shrink-0">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 p-1">
                <CaptainKPI size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white leading-tight">Captain KPI 🫡</p>
                <p className="text-[10px] text-purple-200">AI Marketing Officer · Powered by Gemini</p>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/60 hover:text-white transition-colors flex-shrink-0"><X size={16} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0 }}>
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 bg-white/10">
                      <CaptainKPI size={22} />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-sm'
                      : darkMode ? 'bg-white/10 text-purple-100 rounded-tl-sm' : 'bg-white text-slate-800 rounded-tl-sm shadow-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 bg-white/10">
                    <CaptainKPI size={22} />
                  </div>
                  <div className={`rounded-2xl rounded-tl-sm px-3 py-2 ${darkMode ? 'bg-white/10 text-purple-300' : 'bg-white text-slate-500 shadow-sm'} text-[13px]`}>
                    Typing… ✍️
                  </div>
                </div>
              )}
              {/* Quick suggestions when fresh */}
              {chatMessages.length === 1 && !chatLoading && (
                <div className="space-y-1.5 pt-1">
                  {[
                    'What should I post this week?',
                    'Analyze my current data',
                    'How can I get more Google reviews?',
                    'What\'s my cost per lead?',
                  ].map(s => (
                    <button key={s} onClick={() => sendChatMessage(s)}
                      className={`w-full text-left text-[12px] px-3 py-2 rounded-xl border transition-colors ${darkMode ? 'border-white/10 text-purple-200 hover:bg-white/10' : 'border-purple-100 text-purple-700 hover:bg-purple-50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className={`flex gap-2 p-3 flex-shrink-0 ${darkMode ? 'border-t border-white/10 bg-indigo-950/80' : 'border-t border-purple-100 bg-white'}`}>
              <input
                className={`flex-1 rounded-xl px-3 py-2 text-[13px] outline-none border ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-purple-400' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-400'} transition-colors`}
                placeholder="Ask Captain KPI…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
              />
              <button
                onClick={() => sendChatMessage()}
                disabled={chatLoading || !chatInput.trim()}
                className="h-9 w-9 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 flex items-center justify-center text-white transition-colors flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
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
                    <h3 className={`font-black text-base ${txt}`}>{intg.connected ? 'Edit' : 'Connect'} {intg.name}</h3>
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
                    : connections[connectModal]?.connected
                      ? <><Pencil size={14} /> Save Changes</>
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
