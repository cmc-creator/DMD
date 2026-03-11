import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

// â”€â”€â”€ Shared style helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const card  = 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm';
const txt   = 'text-slate-900 dark:text-slate-100';
const txt2  = 'text-slate-600 dark:text-slate-300';
const muted = 'text-slate-500 dark:text-slate-400';
const subtl = 'text-slate-400 dark:text-slate-500';
const rowCls= 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
const divdr = 'divide-slate-100 dark:divide-slate-800';
const brd   = 'border-slate-100 dark:border-slate-800';

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode]   = useState(true);
  const [calFilter, setCalFilter] = useState('All');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else          document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // â”€â”€ Chart theme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const grid     = darkMode ? '#1e293b' : '#f1f5f9';
  const tick     = darkMode ? '#94a3b8' : '#64748b';
  const tipStyle = {
    borderRadius: '16px', border: 'none',
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    color: darkMode ? '#f1f5f9' : '#0f172a',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
  };

  // â”€â”€ Core KPI Metrics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Monthly Trend (6 months) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const monthlyTrend = [];

  // â”€â”€ Social Analytics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const socialAnalytics = [
    { platform: 'Facebook',  reach: 0, engagement: 0, clicks: 0, followers: 0, color: '#1877F2' },
    { platform: 'Instagram', reach: 0, engagement: 0, clicks: 0, followers: 0, color: '#E4405F' },
    { platform: 'LinkedIn',  reach: 0, engagement: 0, clicks: 0, followers: 0, color: '#0A66C2' },
    { platform: 'TikTok',    reach: 0, engagement: 0, clicks: 0, followers: 0, color: '#00f2ea' },
  ];

  // â”€â”€ Weekly Engagement Trend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const weeklyEngagement = [];

  // â”€â”€ Wix Traffic Sources â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const wixSources = [
    { name: 'Organic Search', value: 0, color: '#0d9488' },
    { name: 'Social Media',   value: 0, color: '#8b5cf6' },
    { name: 'Direct',         value: 0, color: '#10b981' },
    { name: 'Referral',       value: 0, color: '#f59e0b' },
  ];

  // â”€â”€ AZ Regional Traffic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const regionalTraffic = [
    { city: 'Phoenix',        traffic: 0 },
    { city: 'Tucson',         traffic: 0 },
    { city: 'Mesa / Gilbert', traffic: 0 },
    { city: 'Scottsdale',     traffic: 0 },
    { city: 'Rest of AZ',     traffic: 0 },
  ];

  // â”€â”€ Website Video Tracing / UX Depth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pathData = [];

  // â”€â”€ SEO Keyword Rankings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const seoKeywords = [];

  // â”€â”€ Blog Performance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const blogPosts = [];

  // â”€â”€ Email Campaign Metrics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const emailCampaigns = [];

  // â”€â”€ Ad Performance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const adPerformance = [];

  // â”€â”€ NPS Breakdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const npsData = [
    { name: 'Promoters',  value: 0, color: '#10b981' },
    { name: 'Passives',   value: 0, color: '#f59e0b' },
    { name: 'Detractors', value: 0, color: '#ef4444' },
  ];

  // â”€â”€ Upcoming Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pipeline = [];

  // â”€â”€ My Achievements data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Client ROI data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const roiSpend = [];

  const roiChannels = [
    { channel: 'Organic SEO',  leads: 0, cpl: '—', roi: '—', color: '#0d9488' },
    { channel: 'Social Media', leads: 0, cpl: '—', roi: '—', color: '#8b5cf6' },
    { channel: 'Google Ads',   leads: 0, cpl: '—', roi: '—', color: '#3b82f6' },
    { channel: 'Email',        leads: 0, cpl: '—', roi: '—', color: '#10b981' },
  ];

  // â”€â”€ Content Calendar data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const contentItems = [];

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

  // â”€â”€ Review Management data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const recentReviews = [];

  const reviewTrend = [];

  const promoters = [];

  // â”€â”€ Integrations data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const integrations = [
    { name: 'Google Analytics',    sub: 'GA4 + Search Console',   icon: BarChart3,  connected: false, lastSync: 'Not connected', color: 'text-orange-500', metrics: ['Setup Required'] },
    { name: 'Google Business',     sub: 'Reviews & Rating Feed',  icon: Star,       connected: false, lastSync: 'Not connected', color: 'text-amber-500',  metrics: ['Setup Required'] },
    { name: 'Meta Business Suite', sub: 'Facebook & Instagram',   icon: Share2,     connected: false, lastSync: 'Not connected', color: 'text-blue-500',   metrics: ['Setup Required'] },
    { name: 'Wix Analytics',       sub: 'Website Traffic & CVR',  icon: Globe,      connected: false, lastSync: 'Not connected', color: 'text-teal-500',   metrics: ['Setup Required'] },
    { name: 'Mailchimp',           sub: 'Email Campaigns',        icon: Mail,       connected: false, lastSync: 'Not connected', color: 'text-yellow-500', metrics: ['Setup Required'] },
    { name: 'Google Ads',          sub: 'Paid Search Campaigns',  icon: Target,     connected: false, lastSync: 'Not connected', color: 'text-indigo-500', metrics: ['Setup Required'] },
    { name: 'Meta Ads Manager',    sub: 'FB & IG Paid Campaigns', icon: Megaphone,  connected: false, lastSync: 'Not connected', color: 'text-blue-400',   metrics: ['Setup Required'] },
    { name: 'TikTok for Business', sub: 'TikTok Analytics',       icon: PlayCircle, connected: false, lastSync: 'Not connected', color: 'text-pink-400',   metrics: ['Setup Required'] },
  ];

  // â”€â”€ Helper Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const StatCard = ({ title, value, trend, icon: Icon, color, sub, trendPositive }) => {
    const isPositive = trend && (trendPositive !== undefined ? trendPositive : trend.startsWith('+'));
    const isNeutral  = trend && trend === '0%';
    const textColor  = color.replace('bg-', 'text-');
    const iconBg     = darkMode
      ? color.replace('bg-', 'bg-').replace(/-(5|6)00$/, '-900/30')
      : color.replace('bg-', 'bg-').replace(/-(5|6)00$/, '-100');
    return (
      <div className={`${card} p-5 rounded-2xl transition-all hover:shadow-md`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className={textColor} size={24} />
          </div>
          {trend && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              isNeutral
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                : isPositive
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
            }`}>
              {trend}
            </span>
          )}
        </div>
        <p className={`${subtl} text-[10px] font-black uppercase tracking-widest mb-1`}>{title}</p>
        <h3 className={`text-2xl font-black ${txt} leading-none`}>{value}</h3>
        {sub && <p className={`text-[10px] ${subtl} mt-2 italic font-medium leading-tight`}>{sub}</p>}
      </div>
    );
  };

  const SectionHeader = ({ icon: Icon, color, title, subtitle }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
      <div>
        <h2 className={`text-xl font-black flex items-center gap-2 uppercase tracking-tight ${txt}`}>
          <Icon size={22} className={color} />
          {title}
        </h2>
        {subtitle && <p className={`text-sm ${muted} font-medium mt-0.5`}>{subtitle}</p>}
      </div>
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
    { id: 'overview',     label: 'Overview'         },
    { id: 'social',       label: 'Social'           },
    { id: 'seo',          label: 'SEO & Content'    },
    { id: 'ads',          label: 'Paid Ads'         },
    { id: 'email',        label: 'Email'            },
    { id: 'pipeline',     label: 'Pipeline'         },
    { id: 'achievements', label: 'My Achievements'  },
    { id: 'roi',          label: 'Client ROI'       },
    { id: 'calendar',     label: 'Content Calendar' },
    { id: 'reviews',      label: 'Reviews'          },
    { id: 'integrations', label: 'Integrations'     },
  ];

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors duration-300 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* â”€â”€ Header â”€â”€ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-8 rounded-xl bg-teal-600 flex items-center justify-center">
                <Heart size={16} className="text-white fill-white" />
              </div>
              <h1 className={`text-3xl font-black tracking-tight uppercase ${txt}`}>
                Destiny Springs Healthcare
              </h1>
            </div>
            <p className={`${muted} font-medium italic text-sm`}>
              Digital Marketing &amp; Business Development Portal Â· March 2026
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap no-print">
            <button
              onClick={() => window.print()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${card} ${txt2} hover:shadow-md transition-all`}
            >
              <Printer size={14} />
              Export
            </button>
            <button
              onClick={() => setDarkMode(d => !d)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-teal-600 hover:bg-teal-500 text-white shadow-md transition-all"
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className={`flex items-center gap-3 ${card} px-5 py-2 rounded-2xl`}>
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className={`text-xs font-black ${subtl} uppercase tracking-widest leading-none`}>Live Feeds</span>
            </div>
          </div>
        </div>

        {/* â”€â”€ Tabs â”€â”€ */}
        <div className="flex gap-2 mb-8 flex-wrap no-print">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-md'
                  : `${card} ${muted} hover:border-teal-400 hover:text-teal-500`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• OVERVIEW TAB â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === 'overview' && (
          <>
            {/* Top KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Google Rating"     value={metrics.googleScore}    trend={metrics.googleTrend} icon={Star}        color="bg-amber-500"   sub="Review Cleanup Performance" />
              <StatCard title="Monthly Sessions"  value={metrics.wixSessions}    trend={null}                icon={Layout}      color="bg-teal-600"    sub="Wix Website Traffic"       />
              <StatCard title="Avg Read Time"     value={metrics.avgReadTime}    trend={null}                icon={Clock}       color="bg-emerald-600" sub="Blog & Education Retention" />
              <StatCard title="Omnichannel Reach" value="—"                      trend={null}                icon={Activity}    color="bg-purple-600"  sub="Combined Ad / Social"       />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Total Leads"       value={metrics.totalLeads}     trend={metrics.leadsGrowth} icon={Target}      color="bg-rose-500"    sub="Monthly Lead Volume"        />
              <StatCard title="Cost Per Lead"     value={metrics.costPerLead}    trend={null}                icon={TrendingDown} color="bg-indigo-600" sub="Blended Paid Acquisition"   />
              <StatCard title="Site Conversion"   value={metrics.siteConversion} trend={null}                icon={MousePointer} color="bg-teal-600"   sub="Visitor â†’ Lead Rate"        />
              <StatCard title="NPS Score"         value={metrics.nps}            trend={null}                icon={ThumbsUp}    color="bg-amber-600"   sub="Net Promoter Score"         />
            </div>

            {/* 6-Month Trend */}
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={TrendingUp} color="text-teal-500" title="6-Month Growth Trend" subtitle="Sessions, Reach & Lead Volume" />
              <div className="h-72">
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
              </div>
            </div>

            {/* NPS / Wix / Regional */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              <div className={`lg:col-span-4 ${card} p-8 rounded-[2.5rem] flex flex-col`}>
                <SectionHeader icon={ThumbsUp} color="text-amber-500" title="NPS Breakdown" subtitle="Promoters / Passives / Detractors" />
                <div className="flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={npsData} innerRadius={55} outerRadius={75} paddingAngle={6} dataKey="value">
                        {npsData.map((e,i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {npsData.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className={`text-[11px] font-bold ${txt2}`}>{s.name}</span>
                      </div>
                      <span className={`text-[11px] font-black ${txt}`}>{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`lg:col-span-4 ${card} p-8 rounded-[2.5rem] flex flex-col`}>
                <SectionHeader icon={Layout} color="text-teal-500" title="Wix Analytics" subtitle="Traffic Acquisition Sources" />
                <div className="flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={wixSources} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value">
                        {wixSources.map((e,i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {wixSources.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className={`text-[11px] font-bold ${txt2}`}>{s.name}</span>
                      </div>
                      <span className={`text-[11px] font-black ${txt}`}>{s.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <span className={`text-[10px] font-black uppercase ${subtl} tracking-wider`}>Bounce Rate</span>
                    <span className="text-sm font-black text-teal-500">{metrics.wixBounceRate}</span>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-4 ${card} p-8 rounded-[2.5rem]`}>
                <SectionHeader icon={Map} color="text-rose-500" title="AZ Market Share" subtitle="Statewide Regional Breakdown" />
                <div className="space-y-4">
                  {regionalTraffic.map(item => (
                    <div key={item.city}>
                      <div className={`flex justify-between text-[10px] font-black ${subtl} uppercase mb-1`}>
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
                      <div className={`flex justify-between text-[10px] font-black ${muted} uppercase mb-1.5 tracking-wider`}>
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
                    { val: '90',                    label: 'Social Posts', bg: 'bg-teal-50 dark:bg-teal-900/30',   tx: 'text-teal-900 dark:text-teal-200',     sm: 'text-teal-500'   },
                    { val: metrics.videoViews,      label: 'Video Views',  bg: 'bg-amber-50 dark:bg-amber-900/30', tx: 'text-amber-900 dark:text-amber-200',   sm: 'text-amber-500'  },
                  ].map(s => (
                    <div key={s.label} className={`p-4 ${s.bg} rounded-3xl text-center`}>
                      <div className={`text-3xl font-black ${s.tx}`}>{s.val}</div>
                      <div className={`text-[10px] ${s.sm} font-black uppercase mt-1`}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className={`flex justify-between items-center text-[11px] font-bold`}>
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
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-black">User</div>
                ))}
                <div className="h-10 w-10 rounded-full bg-teal-600 border-2 border-slate-800 flex items-center justify-center text-[10px] font-black">0</div>
              </div>
            </div>
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• SOCIAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === 'social' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {socialAnalytics.map(s => (
                <div key={s.platform} className={`${card} p-5 rounded-2xl`}>
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.color + '25' }}>
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: s.color }}></div>
                  </div>
                  <p className={`text-[10px] font-black uppercase ${subtl} tracking-widest mb-1`}>{s.platform}</p>
                  <h3 className={`text-2xl font-black ${txt}`}>{s.reach.toLocaleString()}</h3>
                  <p className={`text-[10px] ${subtl} italic mt-1`}>Monthly Reach</p>
                  <div className={`mt-3 pt-3 border-t ${brd} flex justify-between text-[10px] font-bold`}>
                    <span className={muted}>{s.followers.toLocaleString()} Followers</span>
                    <span className="text-teal-500">{s.clicks} Clicks</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Share2} color="text-blue-500" title="Social Intelligence" subtitle="Platform Reach vs. Engagement Depth" />
              <div className="h-80">
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
              </div>
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Activity} color="text-purple-500" title="Weekly Engagement by Platform" subtitle="Last 4 Weeks" />
              <div className="h-72">
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
              </div>
            </div>
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• SEO & CONTENT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === 'seo' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                    <tr className={`text-[10px] font-black ${subtl} uppercase tracking-widest border-b ${brd}`}>
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
                            {kw.change > 0 ? `â–² ${kw.change}` : `â–¼ ${Math.abs(kw.change)}`}
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
                        <span className={`text-[10px] font-bold ${subtl}`}><Eye size={10} className="inline mr-1" />{post.views.toLocaleString()} views</span>
                        <span className={`text-[10px] font-bold ${subtl}`}><Clock size={10} className="inline mr-1" />{post.readTime}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-black ${txt}`}>{post.shares}</div>
                      <div className={`text-[9px] font-bold ${subtl} uppercase`}>Shares</div>
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
                    <div className={`text-[10px] ${s.sm} font-black uppercase mt-1`}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• PAID ADS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === 'ads' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Total Ad Spend"    value="—"      trend={null}     icon={Target}      color="bg-indigo-600" sub="Monthly Budget"      />
              <StatCard title="Total Leads"       value="—"      trend={null}     icon={Users}       color="bg-teal-600"  sub="From Paid Channels" />
              <StatCard title="Avg CPL"           value="—"      trend={null}      icon={TrendingDown} color="bg-blue-600" sub="Cost Per Lead" />
              <StatCard title="Total Impressions" value="—"      trend={null}     icon={Eye}         color="bg-amber-600" sub="Paid Visibility"     />
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={BarChart3} color="text-indigo-500" title="Paid Channel Performance" subtitle="Google, Meta & LinkedIn Ads" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-[10px] font-black ${subtl} uppercase tracking-widest border-b ${brd}`}>
                      {['Channel','Spend','Impressions','Clicks','Leads','CPL'].map(h => (
                        <th key={h} className={`${h==='Channel'?'text-left':'text-right'} pb-3 px-4`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divdr}`}>
                    {adPerformance.map(ad => (
                      <tr key={ad.channel}>
                        <td className={`py-3 pr-4 text-sm font-bold ${txt}`}>{ad.channel}</td>
                        <td className={`py-3 px-4 text-right text-sm font-bold ${txt2}`}>${ad.spend.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-right text-sm font-bold ${txt2}`}>{ad.impressions.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-right text-sm font-bold ${txt2}`}>{ad.clicks.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-black px-3 py-1 rounded-full">{ad.leads}</span>
                        </td>
                        <td className={`py-3 pl-4 text-right text-sm font-black ${txt}`}>${ad.cpl.toFixed(2)}</td>
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
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• EMAIL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === 'email' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Avg Open Rate"     value={metrics.emailOpenRate} trend={null}  icon={Mail}        color="bg-teal-600"   sub="All Campaigns"      />
              <StatCard title="Total Subscribers" value="—"                    trend={null}  icon={Users}       color="bg-purple-600" sub="Active List Size"   />
              <StatCard title="Click Rate"        value="—"                    trend={null}  icon={MousePointer}color="bg-emerald-600"sub="Avg CTR"            />
              <StatCard title="Conversions"       value="—"                    trend={null}  icon={CheckCircle} color="bg-amber-600"  sub="Email-Attributed"  />
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Mail} color="text-teal-500" title="Email Campaign Performance" subtitle="Sends, Opens, Clicks & Conversions" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-[10px] font-black ${subtl} uppercase tracking-widest border-b ${brd}`}>
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
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• PIPELINE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
                    <span className={`text-[10px] font-black uppercase ${subtl} tracking-widest`}>{p.label}</span>
                  </div>
                  <p className={`text-2xl font-black ${txt}`}>{pipeline.filter(t => t.priority === p.key).length}</p>
                  <p className={`text-[10px] ${subtl} mt-1 italic`}>{p.desc}</p>
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
                    <span className={`shrink-0 text-[10px] font-black ${subtl} uppercase`}>{item.due}</span>
                    <span className={`shrink-0 text-[9px] font-black px-2 py-1 rounded-full uppercase ${item.priority==='high'?'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400':item.priority==='medium'?'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400':'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
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
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-black">User</div>
                ))}
                <div className="h-10 w-10 rounded-full bg-teal-600 border-2 border-slate-800 flex items-center justify-center text-[10px] font-black">0</div>
              </div>
            </div>
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MY ACHIEVEMENTS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === 'achievements' && (
          <>
            <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-[2.5rem] p-8 text-white mb-8 flex flex-col md:flex-row items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Trophy size={40} className="text-amber-300" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">My Digital Marketing Achievements</h2>
                <p className="text-teal-100 mt-1 text-sm">Full-funnel Digital Marketing Â· Social Media Â· Website Management Â· Blog Writing Â· SEO Â· Paid Ads</p>
                <p className="text-teal-200 text-xs mt-2 italic">Reporting Period: Oct 2025 â€“ Mar 2026 Â· Destiny Springs Healthcare</p>
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
                      <span className={`text-[10px] font-black uppercase ${subtl} tracking-widest`}>{s.label}</span>
                    </div>
                    <div className={`text-3xl font-black ${txt} mb-1`}>{s.value}</div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className={`text-[9px] ${subtl} mt-1`}>{pct}% of target ({s.target})</div>
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
                      <div className={`text-[10px] mt-0.5 ${m.earned ? 'text-teal-600 dark:text-teal-400' : subtl}`}>{m.desc}</div>
                      <div className={`text-[9px] ${subtl} mt-1 uppercase font-bold`}>{m.date}</div>
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

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CLIENT ROI â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === 'roi' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                    <tr className={`text-[10px] font-black ${subtl} uppercase tracking-widest border-b ${brd}`}>
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
                  <div className={`text-[11px] font-black ${muted} uppercase tracking-wider mb-1`}>{s.label}</div>
                  <div className={`text-xs ${subtl} italic`}>{s.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CONTENT CALENDAR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === 'calendar' && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {calendarTypes.map(f => (
                <button key={f} onClick={() => setCalFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${calFilter===f ? 'bg-teal-600 text-white shadow-md' : `${card} ${muted} hover:border-teal-400 hover:text-teal-500`}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Scheduled',     value: contentItems.filter(c=>c.status==='scheduled').length, color: 'text-teal-500'   },
                { label: 'In Draft',      value: contentItems.filter(c=>c.status==='draft').length,     color: 'text-amber-500'  },
                { label: 'In Production', value: contentItems.filter(c=>c.status==='filming').length,   color: 'text-pink-500'   },
                { label: 'Ideas',         value: contentItems.filter(c=>c.status==='idea').length,      color: 'text-slate-400'  },
              ].map(s => (
                <div key={s.label} className={`${card} p-5 rounded-2xl text-center`}>
                  <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                  <div className={`text-[10px] font-black ${subtl} uppercase tracking-wider mt-1`}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem] mb-8`}>
              <SectionHeader icon={Calendar} color="text-teal-500" title="Content Calendar" subtitle="March 2026 Â· Upcoming Posts & Deadlines" />
              <div className="space-y-3">
                {filteredContent.map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 ${rowCls} rounded-2xl`}>
                    <div className={`shrink-0 text-center w-12 ${card} px-2 py-1.5 rounded-xl`}>
                      <div className={`text-[10px] font-black uppercase ${subtl}`}>{item.date.split(' ')[0]}</div>
                      <div className={`text-lg font-black ${txt}`}>{item.date.split(' ')[1]}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${txt} truncate`}>{item.title}</p>
                      <p className={`text-[10px] ${muted} font-medium mt-0.5`}>{item.platform}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-black px-2 py-1 rounded-full ${typeColor[item.type]||''}`}>{item.type}</span>
                    <span className={`shrink-0 text-[9px] font-black px-2 py-1 rounded-full capitalize ${statusColor[item.status]||''}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• REVIEWS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === 'reviews' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Current Rating"  value="4.2 â˜…" trend="+0.8"  icon={Star}        color="bg-amber-500"   sub="Google Business Profile" />
              <StatCard title="Total Reviews"   value="—"     trend={null}  icon={MessageSquare}color="bg-teal-600"   sub="All Time"               />
              <StatCard title="Promoters Ready" value="—"     trend={null}  icon={ThumbsUp}    color="bg-emerald-600" sub="Awaiting Outreach"      />
              <StatCard title="Response Rate"   value="—"     trend={null}  icon={Send}        color="bg-purple-600" sub="Reviews Responded To"   />
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
                          <div className="h-7 w-7 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-[10px] font-black text-teal-700 dark:text-teal-300">{r.author[0]}</div>
                          <span className={`text-xs font-black ${txt}`}>{r.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex gap-0.5">
                            {[1,2,3,4,5].map(n => <Star key={n} size={11} className={n<=r.rating?'text-amber-400 fill-amber-400':'text-slate-300 dark:text-slate-600'} />)}
                          </span>
                          <span className={`text-[9px] ${subtl}`}>{r.date}</span>
                        </div>
                      </div>
                      <p className={`text-xs ${txt2} leading-relaxed line-clamp-2`}>{r.text}</p>
                      <div className="flex justify-end mt-2">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-full ${r.responded ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                          {r.responded ? 'âœ“ Responded' : 'Needs Response'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} p-6 rounded-[2rem]`}>
                <SectionHeader icon={ThumbsUp} color="text-emerald-500" title="Promoter Outreach Pipeline" subtitle="NPS 9â€“10 Clients Ready for Google Review" />
                <div className="space-y-3">
                  {promoters.map((p, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 ${rowCls} rounded-xl`}>
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-black text-emerald-700 dark:text-emerald-300 shrink-0">{p.name[0]}</div>
                      <div className="flex-1">
                        <div className={`text-sm font-bold ${txt}`}>{p.name}</div>
                        <div className={`text-[10px] ${subtl}`}>NPS Score: {p.nps}/10</div>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full capitalize ${p.status==='reviewed'?'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400':p.status==='contacted'?'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400':'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-200 dark:border-teal-800">
                  <p className="text-xs font-black text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-1">Goal</p>
                  <p className="text-sm text-teal-600 dark:text-teal-400">Convert all pipeline promoters to 5-star reviews â†’ Push rating above 4.5 â˜…</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• INTEGRATIONS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === 'integrations' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className={`${card} p-5 rounded-2xl text-center`}>
                <div className="text-3xl font-black text-teal-500 mb-1">{integrations.filter(i=>i.connected).length}</div>
                <div className={`text-[10px] font-black ${subtl} uppercase tracking-wider`}>Active Integrations</div>
              </div>
              <div className={`${card} p-5 rounded-2xl text-center`}>
                <div className="text-3xl font-black text-amber-500 mb-1">{integrations.filter(i=>!i.connected).length}</div>
                <div className={`text-[10px] font-black ${subtl} uppercase tracking-wider`}>Pending Setup</div>
              </div>
              <div className={`${card} p-5 rounded-2xl text-center`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-3xl font-black text-emerald-500">Live</span>
                </div>
                <div className={`text-[10px] font-black ${subtl} uppercase tracking-wider`}>All Active Feeds</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {integrations.map(intg => (
                <div key={intg.name} className={`${card} p-6 rounded-[2rem] ${!intg.connected ? 'opacity-70' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${intg.connected ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <intg.icon size={20} className={intg.connected ? intg.color : subtl} />
                      </div>
                      <div>
                        <div className={`font-black text-sm ${txt}`}>{intg.name}</div>
                        <div className={`text-[10px] ${subtl}`}>{intg.sub}</div>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-full ${intg.connected ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                      {intg.connected ? <RefreshCw size={10} /> : <WifiOff size={10} />}
                      {intg.connected ? 'Connected' : 'Setup Required'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {intg.metrics.map(m => (
                      <span key={m} className={`text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 ${intg.connected ? 'text-teal-600 dark:text-teal-400' : subtl}`}>{m}</span>
                    ))}
                  </div>
                  <div className={`flex items-center justify-between text-[10px] ${subtl} border-t ${brd} pt-3`}>
                    <span>Last sync: {intg.lastSync}</span>
                    {intg.connected
                      ? <button className="text-teal-500 hover:text-teal-400 font-black flex items-center gap-1"><RefreshCw size={10} /> Sync Now</button>
                      : <button className="text-amber-500 hover:text-amber-400 font-black flex items-center gap-1"><Plug size={10} /> Connect</button>}
                  </div>
                </div>
              ))}
            </div>
            <div className={`${card} p-6 md:p-8 rounded-[2.5rem]`}>
              <SectionHeader icon={Plug} color="text-teal-500" title="Integration Setup Guide" subtitle="Steps to connect remaining platforms" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  { name: 'Meta Ads Manager',    icon: Megaphone,  step: 'Meta Business Manager â†’ Apps â†’ Generate API token â†’ Add to .env as VITE_META_ADS_TOKEN'  },
                  { name: 'TikTok for Business', icon: PlayCircle, step: 'Apply for TikTok Business API â†’ Create App â†’ Get access token â†’ Add as VITE_TIKTOK_TOKEN' },
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
                <p className="text-sm text-teal-600 dark:text-teal-400 leading-relaxed">All active integrations pull live data via their respective APIs, refreshing every 5â€“30 min depending on rate limits. Contact your developer to update API keys in the environment config.</p>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className={`mt-12 pt-6 border-t ${brd} flex flex-col md:flex-row justify-between items-center gap-3 no-print`}>
          <div className="flex items-center gap-2">
            <Heart size={13} className="text-teal-500 fill-teal-500" />
            <span className={`text-xs ${subtl} font-medium`}>Destiny Springs Healthcare Â· Digital Marketing Portal</span>
          </div>
          <span className={`text-[10px] ${subtl} uppercase tracking-wider`}>Powered by DMD Â· March 10, 2026</span>
        </div>

      </div>
    </div>
  );
};

export default App;
