import React, { useState } from "react";
import { 
  BarChart3, 
  CheckCircle2, 
  UserPlus, 
  Zap, 
  ChevronDown, 
  Calendar,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Filter,
  Info
} from "lucide-react";

export default function AutomationOverview() {
  const [triggerType, setTriggerType] = useState("Trigger Type");
  const [isTriggerDropdownOpen, setIsTriggerDropdownOpen] = useState(false);

  const stats = [
    { label: "Total Workflows", value: "64", icon: BarChart3, color: "text-gray-900", accent: "bg-primary-500" },
    { label: "Published Workflows", value: "16", icon: CheckCircle2, color: "text-gray-900", accent: "bg-emerald-500" },
    { label: "Total Enrollments", value: "2,482", icon: UserPlus, color: "text-gray-900", accent: "bg-purple-500", info: true },
  ];

  const conversionStats = [
    { label: "Attempted Enrollments", value: "914", sub: "Calculated from all active workflow evaluating contacts in the last 30 days.", icon: UserPlus, color: "text-gray-400" },
    { label: "Matched Enrollments", value: "21", sub: "Successfully triggered steps based on the defined enrollment criteria.", icon: CheckCircle2, color: "text-primary-600" },
    { label: "Unmatched Enrollments", value: "893", sub: "Contacts that did not meet the specific trigger or filter requirements.", icon: AlertCircle, color: "text-gray-300" },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Stats Grid - High Density Professional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-gray-200 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                {stat.info && <Info className="w-3 h-3 text-gray-300" />}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{stat.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${stat.accent} shadow-lg shadow-black/5`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row: Chart & High-Density Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Enrollment Performance</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-100 uppercase tracking-tighter cursor-default">
              Last 7 Weeks
            </div>
          </div>
          
          <div className="h-[200px] w-full relative">
            <svg viewBox="0 0 800 200" className="w-full h-full preserve-3d">
              <path 
                d="M0,160 L100,140 L200,60 L300,120 L400,160 L500,140 L600,130 L700,150 L800,155" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                className="drop-shadow-sm"
              />
              <path 
                d="M0,160 L100,140 L200,60 L300,120 L400,160 L500,140 L600,130 L700,150 L800,155 L800,200 L0,200 Z" 
                fill="url(#fadeGradient)" 
              />
              <defs>
                <linearGradient id="fadeGradient" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                  <stop offset="0" stopColor="#6366f1" stopOpacity="0.08" />
                  <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
               <span>Week 1</span>
               <span>Week 2</span>
               <span>Week 3</span>
               <span>Week 4</span>
               <span>Week 5</span>
               <span>Week 6</span>
               <span>Current</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Quality Score</h3>
          <div className="flex-1 flex flex-col items-center justify-center py-6">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                   <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
                   <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={60} className="text-primary-500" />
                </svg>
                <div className="absolute flex flex-col items-center">
                   <span className="text-3xl font-black text-gray-900">98%</span>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Healthy</span>
                </div>
             </div>
             <p className="text-[11px] text-gray-400 font-medium mt-4 text-center px-4 leading-relaxed">Your workflows are performing within optimal system limits.</p>
          </div>
        </div>
      </div>

      {/* High-Density Filtering Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-6 px-6 py-4 border-b border-gray-50 bg-gray-50/30">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contextual Data Filters</p>
        </div>
        
        <div className="p-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase">Analysis Of</span>
            <div className="relative">
              <button 
                onClick={() => setIsTriggerDropdownOpen(!isTriggerDropdownOpen)}
                className="flex items-center gap-3 pl-4 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-primary-500 transition-all"
              >
                {triggerType}
                <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
              </button>
              
              {isTriggerDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[180px] bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1 overflow-hidden">
                  {['Workflow', 'Contact', 'Form', 'Survey'].map(item => (
                    <button 
                      key={item}
                      onClick={() => { setTriggerType(item); setIsTriggerDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-between"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-gray-100" />

          <div className="flex items-center gap-3">
             <Calendar className="w-4 h-4 text-gray-300" />
             <div className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                <span>Mar 11, 2026</span>
                <span className="text-gray-300">—</span>
                <span>Apr 10, 2026</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Metrics - Clean Professional Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {conversionStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:border-gray-200 transition-all">
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 ${stat.color}`}>
                 <stat.icon className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Info Banner */}
      <div className="flex items-center gap-2.5 bg-gray-50 p-4 rounded-xl w-fit border border-gray-100">
        <Info className="w-4 h-4 text-gray-400" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Trigger Analysis data is available upto last 30 days</p>
      </div>
    </div>
  );
}
