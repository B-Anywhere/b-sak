/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ExternalLink, 
  Video, 
  Scissors, 
  Film, 
  Search, 
  X, 
  Monitor, 
  Smartphone, 
  Sliders,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Play,
  Maximize2
} from 'lucide-react';
import toolsData from './data/tools.json';

// --- Types ---
export interface ToolItem {
  id: string;
  title: string;
  category: string;
  description: string;
  detailedDescription?: string;
  url: string;
  desktopImg: string;
  mobileImg: string;
  color: string;
  iconType: string;
}

const ICON_MAP: Record<string, any> = {
  Video, Scissors, Film, Radio, Layers, Sparkles, Sliders, Globe, Play, Zap
};

function QuickViewDialog({ tool, onClose, viewMode }: { tool: ToolItem, onClose: () => void, viewMode: 'desktop' | 'mobile' }) {
  const Icon = ICON_MAP[tool.iconType] || Video;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
          <div className="w-full md:w-1/2 aspect-video md:aspect-auto bg-black border-b md:border-b-0 md:border-r border-white/5 overflow-hidden">
            <img src={viewMode === 'mobile' ? tool.mobileImg : tool.desktopImg} alt={tool.title} className="w-full h-full object-cover" />
          </div>
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: tool.color }}><Icon size={24} /></div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{tool.title}</h2>
                <p className="text-xs text-white/40 uppercase font-bold tracking-[0.2em]">{tool.category}</p>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed italic border-l-2 border-white/10 pl-4 mb-6">"{tool.description}"</p>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              {tool.detailedDescription || `${tool.title} is a professional ${tool.category.toLowerCase()} solution optimized for the modern creative web ecosystem.`}
            </p>
            <div className="mt-auto">
              <button onClick={() => window.open(tool.url, '_blank')} className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-white/90 transition-all">
                LAUNCH TOOL <ExternalLink size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ToolCard({ tool, viewMode, onQuickView }: { tool: ToolItem, viewMode: 'desktop' | 'mobile', onQuickView: (tool: ToolItem) => void }) {
  const Icon = ICON_MAP[tool.iconType] || Video;
  
  return (
    <div className="group relative flex flex-col bg-black/40 border border-white/5 rounded-2xl overflow-hidden h-full hover:border-white/20 transition-all duration-300">
      <div className="relative aspect-video w-full overflow-hidden bg-white/5">
        <img src={viewMode === 'mobile' ? tool.mobileImg : tool.desktopImg} alt={tool.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
           <button onClick={() => onQuickView(tool)} className="bg-white text-black px-4 py-2 rounded-full text-xs font-black flex items-center gap-2">VIEW <Maximize2 size={12} /></button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-1.5 rounded-lg text-white" style={{ backgroundColor: tool.color }}><Icon size={16} /></div>
          <div className="min-w-0">
            <h3 className="font-black text-sm tracking-tight truncate">{tool.title}</h3>
            <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">{tool.category}</p>
          </div>
        </div>
        <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed mb-4">{tool.description}</p>
        <button onClick={() => window.open(tool.url, '_blank')} className="mt-auto text-[10px] font-black text-white/40 hover:text-white transition-colors flex items-center justify-between group/btn">
          OPEN TOOL <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [activeCategory, setActiveIndex] = useState('ALL');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(toolsData.map(t => t.category)));
    return ['ALL', ...cats];
  }, []);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let data = toolsData as ToolItem[];
    if (q) {
      data = data.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    if (activeCategory !== 'ALL' && !q) {
      data = data.filter(t => t.category === activeCategory);
    }
    return data;
  }, [searchQuery, activeCategory]);

  const groupedTools = useMemo(() => {
    if (searchQuery) return { "Search Results": filteredData };
    if (activeCategory !== 'ALL') return { [activeCategory]: filteredData };
    
    return filteredData.reduce((acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, ToolItem[]>);
  }, [filteredData, searchQuery, activeCategory]);

  return (
    <div className="relative w-full min-h-screen text-white font-sans selection:bg-white/20 pb-20" style={{ background: 'linear-gradient(133.25deg, rgba(67, 184, 234, 0.18) 17.487%, rgba(126, 195, 65, 0.11) 39.465%, rgba(67, 184, 234, 0.15) 85.078%), #050505' }}>
      
      {/* Header */}
      <header className="sticky top-0 z-[60] w-full p-4 sm:p-6 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic">B</div>
            <span className="text-xl font-black tracking-tighter">B-Anywhere</span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input type="text" placeholder="Search suite..." className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-white/20 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"><X size={14} /></button>}
            </div>
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button onClick={() => setViewMode('desktop')} className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white text-black shadow-lg' : 'text-white/20 hover:text-white'}`}><Monitor size={14} /></button>
              <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white text-black shadow-lg' : 'text-white/20 hover:text-white'}`}><Smartphone size={14} /></button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <h1 className="text-5xl sm:text-8xl font-black tracking-tighter leading-[0.8] mb-4">CRAFT<br /><span className="text-white/10" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>B-ANYWHERE</span></h1>
        <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase">Unified Production Ecosystem • 2026 Batch</p>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {Object.entries(groupedTools).map(([category, tools]) => (
          <section key={category}>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-sm font-black tracking-widest text-white/20 uppercase shrink-0">{category}</h2>
              <div className="h-px w-full bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map(tool => (
                <ToolCard key={tool.id} tool={tool} viewMode={viewMode} onQuickView={setSelectedTool} />
              ))}
            </div>
          </section>
        ))}
        {filteredData.length === 0 && (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl opacity-40">
             <Search size={40} className="mx-auto mb-4" />
             <p className="font-bold tracking-widest uppercase text-xs">No matching tools found</p>
          </div>
        )}
      </main>

      {/* Persistent Navigation Control */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-1.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex items-center gap-1 max-w-[95vw] overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setActiveIndex(cat);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
          >
            {cat}
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {selectedTool && <QuickViewDialog tool={selectedTool} viewMode={viewMode} onClose={() => setSelectedTool(null)} />}
      </AnimatePresence>
      
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 blur-[180px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 blur-[180px] rounded-full" />
      </div>
    </div>
  );
}
