import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Legend
} from 'recharts';
import {
  TrendingUp, Users, Smartphone, Star,
  Globe, Search, Video, MousePointer,
  CheckCircle, Zap, Eye, BarChart3,
  Map, FileText, Share2, Activity,
  Facebook, Instagram, Linkedin, PlayCircle,
  Layout, ArrowUpRight, Clock, MessageSquare,
  ThumbsUp, Mail, Target, Award, Bell,
  TrendingDown, Minus
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // ── Core KPI Metrics ────────────────────────────────────────────────────────
  const metrics = {
    googleScore: '4.2',
    googleTrend: '+0.8',
    nps: 29,
    promoters: '48.1%',
    socialPostsMonthly: 90,
    blogVelocity: '12',
    tiktokVelocity: '8',
    videoViews: '18.2k',
    seoStatewideGrowth: '+24%',
    avgReadTime: '2m 14s',
    siteConversion: '4.1%',
    wixSessions: '42,800',
    wixBounceRate: '34%',
    emailOpenRate: '28.4%',
    costPerLead: '$14.20',
    totalLeads: 312,
    leadsGrowth: '+22%',
  };

  // ── Monthly Trend (6 months) ─────────────────────────────────────────────────
  const monthlyTrend = [
    { month: 'Oct', sessions: 28400, leads: 198, reach: 28000, score: 3.4 },
    { month: 'Nov', sessions: 31200, leads: 224, reach: 31500, score: 3.6 },
    { month: 'Dec', sessions: 33800, leads: 247, reach: 35200, score: 3.8 },
    { month: 'Jan', sessions: 36900, leads: 268, reach: 38400, score: 4.0 },
    { month: 'Feb', sessions: 39500, leads: 289, reach: 41800, score: 4.1 },
    { month: 'Mar', sessions: 42800, leads: 312, reach: 44700, score: 4.2 },
  ];

  // ── Social Analytics ─────────────────────────────────────────────────────────
  const socialAnalytics = [
    { platform: 'Facebook', reach: 12500, engagement: 840, clicks: 320, followers: 4820, color: '#1877F2' },
    { platform: 'Instagram', reach: 9800, engagement: 1450, clicks: 210, followers: 3610, color: '#E4405F' },
    { platform: 'LinkedIn', reach: 4200, engagement: 510, clicks: 440, followers: 1890, color: '#0A66C2' },
    { platform: 'TikTok', reach: 18200, engagement: 3200, clicks: 180, followers: 2940, color: '#010101' },
  ];

  // ── Weekly Engagement Trend ──────────────────────────────────────────────────
  const weeklyEngagement = [
    { week: 'W1', facebook: 180, instagram: 310, linkedin: 95, tiktok: 640 },
    { week: 'W2', facebook: 210, instagram: 340, linkedin: 120, tiktok: 780 },
    { week: 'W3', facebook: 195, instagram: 360, linkedin: 110, tiktok: 820 },
    { week: 'W4', facebook: 255, instagram: 440, linkedin: 185, tiktok: 960 },
  ];

  // ── Wix Traffic Sources ──────────────────────────────────────────────────────
  const wixSources = [
    { name: 'Organic Search', value: 45, color: '#3b82f6' },
    { name: 'Social Media', value: 30, color: '#8b5cf6' },
    { name: 'Direct', value: 15, color: '#10b981' },
    { name: 'Referral', value: 10, color: '#f59e0b' },
  ];

  // ── AZ Regional Traffic ──────────────────────────────────────────────────────
  const regionalTraffic = [
    { city: 'Phoenix', traffic: 45 },
    { city: 'Tucson', traffic: 22 },
    { city: 'Mesa / Gilbert', traffic: 15 },
    { city: 'Scottsdale', traffic: 10 },
    { city: 'Rest of AZ', traffic: 8 },
  ];

  // ── Website Video Tracing / UX Depth ─────────────────────────────────────────
  const pathData = [
    { name: 'Home', dropoff: 5, stay: 95 },
    { name: 'Specialized Care', dropoff: 15, stay: 85 },
    { name: 'Assessments', dropoff: 22, stay: 78 },
    { name: 'Contact / Discharge', dropoff: 10, stay: 90 },
  ];

  // ── SEO Keyword Rankings ─────────────────────────────────────────────────────
  const seoKeywords = [
    { keyword: 'AZ behavioral health', rank: 3, change: +2, volume: 1900 },
    { keyword: 'mental health Arizona', rank: 5, change: +4, volume: 2400 },
    { keyword: 'outpatient treatment Phx', rank: 2, change: +1, volume: 880 },
    { keyword: 'substance abuse Arizona', rank: 7, change: +5, volume: 1600 },
    { keyword: 'IOP program Tucson', rank: 4, change: +3, volume: 720 },
    { keyword: 'dual diagnosis AZ', rank: 6, change: +2, volume: 590 },
  ];

  // ── Blog Performance ─────────────────────────────────────────────────────────
  const blogPosts = [
    { title: 'Understanding IOP Levels of Care', views: 3840, readTime: '3m 12s', shares: 47 },
    { title: '5 Signs You Need Behavioral Support', views: 2920, readTime: '2m 48s', shares: 62 },
    { title: 'Arizona Dual Diagnosis Guide', views: 2410, readTime: '4m 05s', shares: 38 },
    { title: 'Breaking the Stigma in Rural AZ', views: 1980, readTime: '2m 31s', shares: 54 },
    { title: 'What to Expect: First 30 Days', views: 1640, readTime: '3m 44s', shares: 29 },
  ];

  // ── Email Campaign Metrics ────────────────────────────────────────────────────
  const emailCampaigns = [
    { campaign: 'Welcome Series', sent: 840, opened: 241, clicked: 98, converted: 24 },
    { campaign: 'Monthly Newsletter', sent: 2140, opened: 598, clicked: 187, converted: 41 },
    { campaign: 'Resource Downloads', sent: 620, opened: 196, clicked: 112, converted: 38 },
    { campaign: 'Re-Engagement', sent: 480, opened: 118, clicked: 52, converted: 16 },
  ];

  // ── Ad Performance ───────────────────────────────────────────────────────────
  const adPerformance = [
    { channel: 'Google Ads', spend: 1200, impressions: 48000, clicks: 1920, leads: 96, cpl: 12.50 },
    { channel: 'Meta Ads', spend: 800, impressions: 62000, clicks: 1550, leads: 74, cpl: 10.81 },
    { channel: 'LinkedIn Ads', spend: 600, impressions: 18000, clicks: 540, leads: 38, cpl: 15.79 },
  ];

  // ── NPS Breakdown ─────────────────────────────────────────────────────────────
  const npsData = [
    { name: 'Promoters', value: 48, color: '#10b981' },
    { name: 'Passives', value: 33, color: '#f59e0b' },
    { name: 'Detractors', value: 19, color: '#ef4444' },
  ];

  // ── Upcoming Tasks ────────────────────────────────────────────────────────────
  const pipeline = [
    { task: 'Google Review Outreach – 17 promoters', due: 'Mar 12', priority: 'high' },
    { task: 'Publish 3 Blog Posts (IOP, Dual Dx, Rural AZ)', due: 'Mar 14', priority: 'medium' },
    { task: 'TikTok Series: "Day in the Life"', due: 'Mar 15', priority: 'medium' },
    { task: 'Email Campaign: Spring Awareness Month', due: 'Mar 18', priority: 'high' },
    { task: 'LinkedIn Thought Leadership – CEO Article', due: 'Mar 20', priority: 'low' },
    { task: 'Wix Landing Page A/B Test Launch', due: 'Mar 22', priority: 'medium' },
  ];

  // ── Helper Components ─────────────────────────────────────────────────────────
  const StatCard = ({ title, value, trend, icon: Icon, color, sub, trendPositive }) => {
    // trendPositive overrides sign-based detection for metrics where lower is better (e.g. bounce rate, CPL)
    const isPositive = trend && (trendPositive !== undefined ? trendPositive : trend.startsWith('+'));
    const isNeutral = trend && trend === '0%';
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={color.replace('bg-', 'text-')} size={24} />
          </div>
          {trend && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isNeutral ? 'bg-slate-100 text-slate-500' : isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 leading-none">{value}</h3>
        {sub && <p className="text-[10px] text-slate-400 mt-2 italic font-medium leading-tight">{sub}</p>}
      </div>
    );
  };

  const SectionHeader = ({ icon: Icon, color, title, subtitle }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
      <div>
        <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
          <Icon size={24} className={color} />
          {title}
        </h2>
        {subtitle && <p className="text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'social', label: 'Social' },
    { id: 'seo', label: 'SEO & Content' },
    { id: 'ads', label: 'Paid Ads' },
    { id: 'email', label: 'Email' },
    { id: 'pipeline', label: 'Pipeline' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase text-slate-900">
              Statewide Digital &amp; UX Dashboard
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
              Full-Funnel Arizona Digital Marketing Analytics
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl shadow-sm border border-slate-200 self-start">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest leading-none">
              Live Feeds
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Top KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Google Rating" value={metrics.googleScore} trend={metrics.googleTrend} icon={Star} color="bg-amber-500" sub="Review Cleanup Performance" />
              <StatCard title="Monthly Sessions" value={metrics.wixSessions} trend="+18%" icon={Layout} color="bg-blue-600" sub="Wix Website Traffic" />
              <StatCard title="Avg Read Time" value={metrics.avgReadTime} trend="+12s" icon={Clock} color="bg-emerald-600" sub="Blog & Education Retention" />
              <StatCard title="Omnichannel Reach" value="44.7k" trend="+32%" icon={Activity} color="bg-purple-600" sub="Combined Ad / Social" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Total Leads" value={metrics.totalLeads} trend={metrics.leadsGrowth} icon={Target} color="bg-rose-500" sub="Monthly Lead Volume" />
              <StatCard title="Cost Per Lead" value={metrics.costPerLead} trend="-8%" trendPositive={true} icon={TrendingDown} color="bg-indigo-600" sub="Blended Paid Acquisition" />
              <StatCard title="Site Conversion" value={metrics.siteConversion} trend="+0.4%" icon={MousePointer} color="bg-teal-600" sub="Visitor → Lead Rate" />
              <StatCard title="NPS Score" value={metrics.nps} trend="+4" icon={ThumbsUp} color="bg-amber-600" sub="Net Promoter Score" />
            </div>

            {/* 6-Month Trend */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={TrendingUp} color="text-emerald-600" title="6-Month Growth Trend" subtitle="Sessions, Reach & Lead Volume" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                    <Area yAxisId="left" type="monotone" dataKey="sessions" fill="#eff6ff" stroke="#3b82f6" strokeWidth={3} name="Sessions" />
                    <Area yAxisId="left" type="monotone" dataKey="reach" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth={3} name="Reach" />
                    <Bar yAxisId="right" dataKey="leads" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} name="Leads" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              {/* NPS Breakdown */}
              <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                <SectionHeader icon={ThumbsUp} color="text-amber-500" title="NPS Breakdown" subtitle="Promoters vs. Passives vs. Detractors" />
                <div className="flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={npsData} innerRadius={55} outerRadius={75} paddingAngle={6} dataKey="value">
                        {npsData.map((entry, index) => (
                          <Cell key={`nps-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {npsData.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className="text-[11px] font-bold text-slate-600">{s.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-900">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wix Traffic Sources */}
              <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                <SectionHeader icon={Layout} color="text-blue-500" title="Wix Analytics" subtitle="Traffic Acquisition Sources" />
                <div className="flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={wixSources} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value">
                        {wixSources.map((entry, index) => (
                          <Cell key={`wix-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {wixSources.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className="text-[11px] font-bold text-slate-600">{s.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-900">{s.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bounce Rate</span>
                    <span className="text-sm font-black text-emerald-600">{metrics.wixBounceRate}</span>
                  </div>
                </div>
              </div>

              {/* AZ Market Share */}
              <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <SectionHeader icon={Map} color="text-rose-600" title="AZ Market Share" subtitle="Statewide Regional Breakdown" />
                <div className="space-y-4">
                  {regionalTraffic.map(item => (
                    <div key={item.city}>
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-1">
                        <span>{item.city}</span>
                        <span>{item.traffic}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${item.traffic}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* UX Path & Content Velocity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100">
                <SectionHeader icon={MousePointer} color="text-emerald-600" title="Video Tracing Analysis" subtitle="UX Depth & Page Retention" />
                <div className="space-y-5">
                  {pathData.map(path => (
                    <div key={path.name}>
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-1.5 tracking-wider">
                        <span>{path.name}</span>
                        <span>{path.stay}% Retention</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${path.stay}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100">
                <SectionHeader icon={FileText} color="text-purple-600" title="Content Velocity" subtitle="Monthly Production Output" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-purple-50 rounded-3xl text-center">
                    <div className="text-3xl font-black text-purple-900">{metrics.blogVelocity}</div>
                    <div className="text-[10px] text-purple-400 font-black uppercase mt-1">Blogs / Mo</div>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-3xl text-center">
                    <div className="text-3xl font-black text-pink-900">{metrics.tiktokVelocity}</div>
                    <div className="text-[10px] text-pink-400 font-black uppercase mt-1">TikToks / Mo</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-3xl text-center">
                    <div className="text-3xl font-black text-blue-900">90</div>
                    <div className="text-[10px] text-blue-400 font-black uppercase mt-1">Social Posts</div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-3xl text-center">
                    <div className="text-3xl font-black text-amber-900">{metrics.videoViews}</div>
                    <div className="text-[10px] text-amber-400 font-black uppercase mt-1">Video Views</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-400 uppercase">Statewide SEO Lift</span>
                    <span className="text-emerald-600">{metrics.seoStatewideGrowth} Organic</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[74%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Pipeline Banner */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <CheckCircle className="text-amber-400" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Google Review Pipeline</h3>
                  <p className="text-slate-400 text-sm font-medium">17 Direct Promoters identified for immediate 5-star follow-up.</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                    User
                  </div>
                ))}
                <div className="h-10 w-10 rounded-full bg-blue-600 border-2 border-slate-800 flex items-center justify-center text-[10px] font-black">
                  +13
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ SOCIAL TAB ══════════════════ */}
        {activeTab === 'social' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {socialAnalytics.map(s => (
                <div key={s.platform} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.color + '20' }}>
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: s.color }}></div>
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{s.platform}</p>
                  <h3 className="text-2xl font-black text-slate-900">{s.reach.toLocaleString()}</h3>
                  <p className="text-[10px] text-slate-400 italic mt-1">Monthly Reach</p>
                  <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">{s.followers.toLocaleString()} Followers</span>
                    <span className="text-emerald-600">{s.clicks} Clicks</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Intelligence Chart */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={Share2} color="text-blue-600" title="Social Intelligence" subtitle="Daily MarkyAI Frequency vs. Engagement Depth" />
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={socialAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                    <Bar dataKey="reach" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={50} name="Reach" />
                    <Line type="monotone" dataKey="engagement" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} name="Engagement" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Engagement Breakdown */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={Activity} color="text-purple-600" title="Weekly Engagement by Platform" subtitle="Last 4 Weeks" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyEngagement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                    <Bar dataKey="facebook" fill="#1877F2" radius={[6, 6, 0, 0]} name="Facebook" />
                    <Bar dataKey="instagram" fill="#E4405F" radius={[6, 6, 0, 0]} name="Instagram" />
                    <Bar dataKey="linkedin" fill="#0A66C2" radius={[6, 6, 0, 0]} name="LinkedIn" />
                    <Bar dataKey="tiktok" fill="#010101" radius={[6, 6, 0, 0]} name="TikTok" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ SEO & CONTENT TAB ══════════════════ */}
        {activeTab === 'seo' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Organic Growth" value="+24%" trend="+24%" icon={TrendingUp} color="bg-emerald-600" sub="Statewide SEO Lift" />
              <StatCard title="Avg Position" value="4.5" trend="+2.1" icon={Search} color="bg-blue-600" sub="Google SERP Average" />
              <StatCard title="Blog Posts / Mo" value={metrics.blogVelocity} trend="+4" icon={FileText} color="bg-purple-600" sub="Monthly Production" />
              <StatCard title="Avg Read Time" value={metrics.avgReadTime} trend="+12s" icon={Clock} color="bg-amber-600" sub="Content Engagement" />
            </div>

            {/* Keyword Rankings */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={Search} color="text-blue-600" title="Keyword Rankings" subtitle="Top AZ Healthcare Keywords" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="text-left pb-3 pr-4">Keyword</th>
                      <th className="text-center pb-3 px-4">Rank</th>
                      <th className="text-center pb-3 px-4">Change</th>
                      <th className="text-right pb-3 pl-4">Volume / Mo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {seoKeywords.map(kw => (
                      <tr key={kw.keyword}>
                        <td className="py-3 pr-4 text-sm font-bold text-slate-800">{kw.keyword}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-full">#{kw.rank}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs font-black px-2 py-1 rounded-full ${kw.change > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {kw.change > 0 ? `▲ ${kw.change}` : `▼ ${Math.abs(kw.change)}`}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right text-sm font-bold text-slate-600">{kw.volume.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Blog Performance */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={FileText} color="text-purple-600" title="Top Blog Performance" subtitle="Views, Read Time & Social Shares" />
              <div className="space-y-4">
                {blogPosts.map((post, i) => (
                  <div key={post.title} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <div className="h-8 w-8 rounded-xl bg-purple-100 flex items-center justify-center text-sm font-black text-purple-700 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{post.title}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[10px] font-bold text-slate-400"><Eye size={10} className="inline mr-1" />{post.views.toLocaleString()} views</span>
                        <span className="text-[10px] font-bold text-slate-400"><Clock size={10} className="inline mr-1" />{post.readTime}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-slate-800">{post.shares}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Shares</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TikTok Velocity */}
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={PlayCircle} color="text-pink-600" title="TikTok Velocity" subtitle="Short-Form Video Production" />
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-pink-50 rounded-3xl text-center">
                  <div className="text-3xl font-black text-pink-900">{metrics.tiktokVelocity}</div>
                  <div className="text-[10px] text-pink-400 font-black uppercase mt-1">Videos / Mo</div>
                </div>
                <div className="p-4 bg-rose-50 rounded-3xl text-center">
                  <div className="text-3xl font-black text-rose-900">{metrics.videoViews}</div>
                  <div className="text-[10px] text-rose-400 font-black uppercase mt-1">Total Views</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-3xl text-center">
                  <div className="text-3xl font-black text-orange-900">3.2k</div>
                  <div className="text-[10px] text-orange-400 font-black uppercase mt-1">Engagements</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ PAID ADS TAB ══════════════════ */}
        {activeTab === 'ads' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Total Ad Spend" value="$2,600" trend="+$200" icon={Target} color="bg-indigo-600" sub="Monthly Budget" />
              <StatCard title="Total Leads" value="208" trend="+18%" icon={Users} color="bg-emerald-600" sub="From Paid Channels" />
              <StatCard title="Avg CPL" value="$12.50" trend="-8%" trendPositive={true} icon={TrendingDown} color="bg-blue-600" sub="Cost Per Lead" />
              <StatCard title="Total Impressions" value="128k" trend="+24%" icon={Eye} color="bg-amber-600" sub="Paid Visibility" />
            </div>

            {/* Ad Performance Table */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={BarChart3} color="text-indigo-600" title="Paid Channel Performance" subtitle="Google, Meta & LinkedIn Ads" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="text-left pb-3 pr-4">Channel</th>
                      <th className="text-right pb-3 px-4">Spend</th>
                      <th className="text-right pb-3 px-4">Impressions</th>
                      <th className="text-right pb-3 px-4">Clicks</th>
                      <th className="text-right pb-3 px-4">Leads</th>
                      <th className="text-right pb-3 pl-4">CPL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {adPerformance.map(ad => (
                      <tr key={ad.channel}>
                        <td className="py-3 pr-4 text-sm font-bold text-slate-800">{ad.channel}</td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-slate-600">${ad.spend.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-slate-600">{ad.impressions.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-slate-600">{ad.clicks.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">{ad.leads}</span>
                        </td>
                        <td className="py-3 pl-4 text-right text-sm font-black text-slate-900">${ad.cpl.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leads Trend Chart */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={TrendingUp} color="text-emerald-600" title="Lead Volume Trend" subtitle="6-Month Monthly Lead Growth" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="leads" fill="#d1fae5" stroke="#10b981" strokeWidth={3} name="Leads" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ EMAIL TAB ══════════════════ */}
        {activeTab === 'email' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Avg Open Rate" value={metrics.emailOpenRate} trend="+3.2%" icon={Mail} color="bg-blue-600" sub="All Campaigns" />
              <StatCard title="Total Subscribers" value="3,080" trend="+140" icon={Users} color="bg-purple-600" sub="Active List Size" />
              <StatCard title="Click Rate" value="11.4%" trend="+1.8%" icon={MousePointer} color="bg-emerald-600" sub="Avg CTR" />
              <StatCard title="Conversions" value="119" trend="+22%" icon={CheckCircle} color="bg-amber-600" sub="Email-Attributed" />
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={Mail} color="text-blue-600" title="Email Campaign Performance" subtitle="Sends, Opens, Clicks & Conversions" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="text-left pb-3 pr-4">Campaign</th>
                      <th className="text-right pb-3 px-4">Sent</th>
                      <th className="text-right pb-3 px-4">Opened</th>
                      <th className="text-right pb-3 px-4">Clicked</th>
                      <th className="text-right pb-3 pl-4">Converted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {emailCampaigns.map(c => (
                      <tr key={c.campaign}>
                        <td className="py-3 pr-4 text-sm font-bold text-slate-800">{c.campaign}</td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-slate-600">{c.sent.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-bold text-blue-600">{c.opened} <span className="text-slate-400 text-xs">({Math.round((c.opened / c.sent) * 100)}%)</span></span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-bold text-purple-600">{c.clicked} <span className="text-slate-400 text-xs">({Math.round((c.clicked / c.sent) * 100)}%)</span></span>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">{c.converted}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Campaign Bar Chart */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={BarChart3} color="text-purple-600" title="Opens vs. Clicks by Campaign" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emailCampaigns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="campaign" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                    <Bar dataKey="opened" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Opened" />
                    <Bar dataKey="clicked" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Clicked" />
                    <Bar dataKey="converted" fill="#10b981" radius={[6, 6, 0, 0]} name="Converted" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ PIPELINE TAB ══════════════════ */}
        {activeTab === 'pipeline' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">High Priority</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{pipeline.filter(t => t.priority === 'high').length}</p>
                <p className="text-[10px] text-slate-400 mt-1 italic">Urgent action items</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Medium Priority</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{pipeline.filter(t => t.priority === 'medium').length}</p>
                <p className="text-[10px] text-slate-400 mt-1 italic">Scheduled this week</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-slate-400"></div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Low Priority</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{pipeline.filter(t => t.priority === 'low').length}</p>
                <p className="text-[10px] text-slate-400 mt-1 italic">Backlog items</p>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
              <SectionHeader icon={CheckCircle} color="text-emerald-600" title="Action Pipeline" subtitle="Upcoming Tasks & Deliverables" />
              <div className="space-y-3">
                {pipeline.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <div className={`h-3 w-3 rounded-full shrink-0 ${item.priority === 'high' ? 'bg-rose-500' : item.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{item.task}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{item.due}</span>
                    </div>
                    <div className={`shrink-0 text-[9px] font-black px-2 py-1 rounded-full uppercase ${item.priority === 'high' ? 'bg-rose-50 text-rose-600' : item.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      {item.priority}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Review Pipeline */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <CheckCircle className="text-amber-400" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Google Review Pipeline</h3>
                  <p className="text-slate-400 text-sm font-medium">17 Direct Promoters identified for immediate 5-star follow-up.</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                    User
                  </div>
                ))}
                <div className="h-10 w-10 rounded-full bg-blue-600 border-2 border-slate-800 flex items-center justify-center text-[10px] font-black">
                  +13
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default App;
