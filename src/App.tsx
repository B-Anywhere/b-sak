/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
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
  Maximize2,
  Download,
  WifiOff,
  Clapperboard,
  TrendingUp,
  Palette,
  Bot,
  Rocket,
  ScrollText,
  Activity,
  Table,
  Database
} from 'lucide-react';
import toolsData from './data/tools.json';
import { usePWAInstall } from './usePWAInstall';

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
  Video, Scissors, Film, Radio, Layers, Sparkles, Sliders, Globe, Play, Zap,
  Clapperboard, Smartphone, TrendingUp, Palette, Bot, Rocket, ScrollText, Activity, Table, Database
};

// --- Reusable Skeleton Loader Component for Tool Previews ---
function PreviewImageWithSkeleton({
  src,
  alt,
  className = '',
  imgClassName = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    // Fast check if already cached and pre-decoded
    const img = new window.Image();
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      img.onload = () => {
        if ('decode' in img) {
          img.decode().then(() => setIsLoaded(true)).catch(() => setIsLoaded(true));
        } else {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        setIsLoaded(true);
        setHasError(true);
      };
    }
  }, [src]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#EDF2F7] ${className}`}>
      {/* Animated Skeleton Loading State */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 flex flex-col justify-between p-3.5 bg-gradient-to-br from-[#F1F5F9] via-[#E2E8F0] to-[#E2E8F0] z-0 overflow-hidden"
          aria-hidden="true"
        >
          {/* Skeleton Top Window Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
              <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
              <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
            </div>
            <div className="h-2 w-14 bg-[#CBD5E1]/80 rounded-full" />
          </div>

          {/* Skeleton Center Simulated Interface Content */}
          <div className="my-auto space-y-2.5 px-2">
            <div className="h-10 sm:h-14 w-full rounded-xl bg-[#CBD5E1]/60 flex items-center justify-center">
              <div className="w-6 h-6 rounded-lg bg-[#94A3B8]/20 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full border-2 border-[#00617F]/40 border-t-transparent animate-spin" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-3/5 bg-[#CBD5E1] rounded-full" />
              <div className="h-2 w-1/4 bg-[#CBD5E1]/70 rounded-full" />
            </div>
          </div>

          {/* Skeleton Bottom Toolbar */}
          <div className="flex items-center justify-between pt-1">
            <div className="h-2 w-16 bg-[#CBD5E1] rounded-full" />
            <div className="h-2 w-10 bg-[#CBD5E1] rounded-full" />
          </div>

          {/* Shimmer Light Streak Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
        </div>
      )}

      {/* Actual Tool Preview Image */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'low'}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsLoaded(true);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoaded && !hasError ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
        } ${imgClassName}`}
      />

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#F8FAFC] text-[#64748B] text-center">
          <Monitor size={22} className="mb-1.5 text-[#94A3B8]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#475569]">Preview Loading</span>
        </div>
      )}
    </div>
  );
}

// --- Quick View Dialog in Bayer Light Theme ---
function QuickViewDialog({ 
  tool, 
  onClose, 
  viewMode 
}: { 
  tool: ToolItem; 
  onClose: () => void; 
  viewMode: 'desktop' | 'mobile';
}) {
  const Icon = ICON_MAP[tool.iconType] || Video;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Esc key listener & focus management
  useEffect(() => {
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#10384F]/50 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
    >
      <motion.div
        ref={dialogRef}
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        className="relative w-full max-w-4xl bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-2xl text-[#10384F] focus:outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close Button with Esc indicator */}
        <button 
          ref={closeBtnRef}
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#10384F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00BCFF] flex items-center gap-1.5"
          aria-label="Close dialog (Escape)"
          title="Press Esc to close"
        >
          <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#475569] shadow-xs">ESC</span>
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
          {/* Preview Image Frame with Skeleton: adapts to 9:16 in mobile view */}
          <div className={`w-full md:w-1/2 bg-[#F8FAFC] border-b md:border-b-0 md:border-r border-[#E2E8F0] overflow-hidden relative flex items-center justify-center transition-all ${
            viewMode === 'mobile' 
              ? 'aspect-[9/16] max-h-[500px] md:max-h-none' 
              : 'aspect-video md:aspect-auto min-h-[220px]'
          }`}>
            <PreviewImageWithSkeleton 
              src={viewMode === 'mobile' ? tool.mobileImg : tool.desktopImg} 
              alt={`${tool.title} preview`} 
            />
            <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-white/95 border border-[#CBD5E1] text-[9px] font-mono font-bold text-[#10384F] shadow-xs z-10">
              {viewMode.toUpperCase()} ({viewMode === 'mobile' ? '9:16' : '16:9'})
            </div>
          </div>

          {/* Details Content */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md" 
                style={{ backgroundColor: tool.color }}
              >
                <Icon size={24} />
              </div>
              <div>
                <h2 id="quickview-title" className="text-2xl font-black tracking-tight text-[#10384F]">
                  {tool.title}
                </h2>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00617F]">
                  {tool.category}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] mb-1.5">Overview</h3>
                <p className="text-[#334155] leading-relaxed italic border-l-2 border-[#00BCFF] pl-3 text-sm bg-[#F0F9FF] py-2 rounded-r-lg">
                  "{tool.description}"
                </p>
              </div>

              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] mb-1.5">Capabilities</h3>
                <p className="text-[#475569] text-sm leading-relaxed">
                  {tool.detailedDescription || `${tool.title} is an enterprise-grade ${tool.category.toLowerCase()} web application built for the modern Bayer digital ecosystem.`}
                </p>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button 
                onClick={() => window.open(tool.url, '_blank')} 
                className="w-full py-3.5 bg-[#10384F] hover:bg-[#00617F] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00BCFF] shadow-lg shadow-[#10384F]/20"
              >
                <span>OPEN APPLICATION</span> 
                <ExternalLink size={16} />
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono px-1">
                <span className="truncate max-w-[200px]">{tool.url.replace('https://', '')}</span>
                <span className="flex items-center gap-1">Press <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[#10384F]">Esc</kbd> to exit</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- In-App PWA Install Component with Guided Modal for iOS Safari ---
function PWAInstallHeaderButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-2 bg-[#00BCFF]/15 hover:bg-[#00BCFF]/25 text-[#00617F] text-xs font-black rounded-full border border-[#00BCFF]/40 transition-all active:scale-95"
        title="Install B-Anywhere for instant 0ms offline launch"
      >
        <Download size={13} />
        <span className="hidden md:inline">INSTALL APP</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#00BCFF]/15 hover:bg-[#00BCFF]/25 text-[#00617F] text-xs font-black rounded-full border border-[#00BCFF]/40 transition-all active:scale-95"
          title="Install on iPhone / iPad"
        >
          <Download size={13} />
          <span className="hidden md:inline">INSTALL</span>
        </button>
        {showIOSModal && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#10384F]/60 backdrop-blur-sm p-4" 
            onClick={() => setShowIOSModal(false)}
          >
            <div 
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#CBD5E1] text-[#10384F]" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-black text-[#10384F]">Install B-Anywhere on iOS</h3>
                <button onClick={() => setShowIOSModal(false)} className="text-[#64748B] hover:text-[#10384F]">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                1. Tap the <strong className="text-[#10384F]">Share</strong> button in Safari's toolbar.<br />
                2. Scroll down and tap <strong className="text-[#10384F]">Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full rounded-xl bg-[#10384F] py-2.5 text-xs font-black text-white hover:bg-[#00617F] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

// --- Memoized ToolCard with Bayer Light Theme & Content-Visibility Performance ---
const ToolCard = React.memo(function ToolCard({ 
  tool, 
  globalIndex,
  isFocused,
  viewMode, 
  onQuickView,
  onCardFocus,
  cardRef
}: { 
  tool: ToolItem;
  globalIndex: number;
  isFocused: boolean;
  viewMode: 'desktop' | 'mobile'; 
  onQuickView: (tool: ToolItem) => void;
  onCardFocus: (index: number) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const Icon = ICON_MAP[tool.iconType] || Video;
  
  return (
    <div 
      id={`tool-${tool.id}`}
      ref={cardRef}
      tabIndex={0}
      role="article"
      aria-label={`${tool.title}, ${tool.category}. Click or press Enter for Quick View.`}
      onClick={() => onQuickView(tool)}
      onFocus={() => onCardFocus(globalIndex)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onQuickView(tool);
        }
      }}
      className={`tool-card-container group relative flex flex-col bg-white border rounded-2xl overflow-hidden h-full transition-all duration-300 outline-none cursor-pointer ${
        isFocused 
          ? 'border-[#00BCFF] ring-2 ring-[#00BCFF] ring-offset-2 ring-offset-[#F8FAFC] shadow-xl shadow-[#00BCFF]/15 -translate-y-1' 
          : 'border-[#E2E8F0] shadow-xs hover:border-[#00BCFF]/60 hover:shadow-xl hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#00BCFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]'
      }`}
    >
      {/* Preview Frame: switches to 9:16 in mobile view mode, 16:9 in desktop mode */}
      <div className={`relative w-full overflow-hidden bg-[#F1F5F9] border-b border-[#E2E8F0] transition-all duration-300 ${
        viewMode === 'mobile' ? 'aspect-[9/16]' : 'aspect-video'
      }`}>
        <PreviewImageWithSkeleton
          src={viewMode === 'mobile' ? tool.mobileImg : tool.desktopImg}
          alt={`${tool.title} preview`}
          priority={globalIndex < 6}
          imgClassName="transition-transform duration-700 group-hover:scale-105"
        />

        {/* Hover/Focus Action Overlay */}
        <div className={`absolute inset-0 z-10 bg-[#10384F]/65 backdrop-blur-xs transition-opacity flex items-center justify-center gap-2 ${
          isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
        }`}>
          <button 
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(tool);
            }} 
            className="bg-white text-[#10384F] hover:bg-[#F8FAFC] px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            title="Press Enter"
          >
            <span>QUICK VIEW</span>
            <Maximize2 size={12} />
          </button>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#10384F] border border-white/30 transition-all shadow-lg"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Corner View Tag */}
        <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded bg-white/90 backdrop-blur-md text-[8px] font-mono font-bold text-[#10384F] border border-[#CBD5E1] shadow-xs pointer-events-none">
          {viewMode.toUpperCase()} {viewMode === 'mobile' ? '9:16' : '16:9'}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-2.5">
          <div 
            className="p-1.5 rounded-lg text-white shrink-0 shadow-xs" 
            style={{ backgroundColor: tool.color }}
          >
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-sm tracking-tight truncate text-[#10384F]">
              {tool.title}
            </h3>
            <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00617F]">
              {tool.category}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[#475569] line-clamp-2 leading-relaxed mb-4">
          {tool.description}
        </p>

        {/* Card Footer */}
        <div className="mt-auto pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-[10px]">
          <span className="text-[#64748B] font-mono flex items-center gap-1">
            <kbd className="px-1 py-0.2 bg-[#F1F5F9] rounded border border-[#E2E8F0] text-[#10384F] text-[9px]">Enter</kbd> View
          </span>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open(tool.url, '_blank');
            }} 
            className="font-black text-[#00617F] hover:text-[#00BCFF] transition-colors flex items-center gap-1 group/btn"
          >
            <span>LAUNCH</span> 
            <ExternalLink size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
});

// --- URL Parameter & Hash Tag Routing Helpers ---
const ALL_CATEGORIES = ['ALL', ...Array.from(new Set((toolsData as ToolItem[]).map(t => t.category)))];

function getCategoryFromUrl(): string {
  if (typeof window === 'undefined') return 'ALL';
  try {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (!cat) return 'ALL';
    const found = ALL_CATEGORIES.find(c => c.toLowerCase() === cat.trim().toLowerCase());
    return found || 'ALL';
  } catch {
    return 'ALL';
  }
}

function getToolFromHash(): ToolItem | null {
  if (typeof window === 'undefined') return null;
  try {
    const hash = window.location.hash.replace(/^#/, '').trim().toLowerCase();
    if (!hash) return null;
    const tool = (toolsData as ToolItem[]).find(t => t.id.toLowerCase() === hash);
    return tool || null;
  } catch {
    return null;
  }
}

// --- Main Application Component in Bayer Light Theme ---
export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auto-detect mobile viewport on load (<768px -> mobile mode with 9:16 ratio)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'desktop';
  });
  const userManuallyToggledRef = useRef(false);

  // Auto-sync when viewport changes between desktop and mobile screen sizes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleViewportChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (!userManuallyToggledRef.current) {
        setViewMode(e.matches ? 'mobile' : 'desktop');
      }
    };

    handleViewportChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleViewportChange);
      return () => mediaQuery.removeEventListener('change', handleViewportChange);
    } else {
      mediaQuery.addListener(handleViewportChange);
      return () => mediaQuery.removeListener(handleViewportChange);
    }
  }, []);

  // Hydrate initial category from URL param (?category=...) and selected tool from URL hash (#app-id)
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(getToolFromHash);
  const [activeCategory, setActiveCategory] = useState<string>(getCategoryFromUrl);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Online/Offline status detection for PWA
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // In-Memory Pre-warming & Off-Thread Image Decoding for instantaneous paint
  useEffect(() => {
    const prewarm = () => {
      ['./assets/images/placeholder_desktop.jpg', './assets/images/placeholder_mobile.jpg'].forEach((url) => {
        const img = new Image();
        img.src = url;
        if ('decode' in img) {
          img.decode().catch(() => {});
        }
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prewarm);
    } else {
      setTimeout(prewarm, 150);
    }
  }, []);

  // Scroll Progress Bar Tracker (GPU-accelerated, zero-layout reflow)
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Category List
  const categories = ALL_CATEGORIES;

  // Total tools count per category for badge display
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: toolsData.length,
    };
    (toolsData as ToolItem[]).forEach((tool) => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered Tools Array
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let data = toolsData as ToolItem[];
    if (q) {
      data = data.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'ALL' && !q) {
      data = data.filter(t => t.category === activeCategory);
    }
    return data;
  }, [searchQuery, activeCategory]);

  // Grouped Tools by Category
  const groupedTools = useMemo(() => {
    if (searchQuery) return { "Search Results": filteredData };
    if (activeCategory !== 'ALL') return { [activeCategory]: filteredData };
    
    return filteredData.reduce((acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, ToolItem[]>);
  }, [filteredData, searchQuery, activeCategory]);

  // Reset focus array size when filtered data changes
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, filteredData.length);
    if (focusedIndex !== null && focusedIndex >= filteredData.length) {
      setFocusedIndex(filteredData.length > 0 ? 0 : null);
    }
  }, [filteredData.length, focusedIndex]);

  // Handle Focus Card & Smooth Scroll
  const focusCard = useCallback((index: number) => {
    if (index >= 0 && index < filteredData.length) {
      setFocusedIndex(index);
      const el = cardRefs.current[index];
      if (el) {
        el.focus();
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [filteredData.length]);

  // Dynamic category URL updater (category in URL param, preserved across F5 refresh)
  const handleSelectCategory = useCallback((cat: string) => {
    setActiveCategory(cat);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (cat === 'ALL') {
          url.searchParams.set('category', 'ALL');
        } else {
          url.searchParams.set('category', cat);
        }
        window.history.pushState({ category: cat }, '', url.toString());
      } catch (err) {
        console.error('Failed to update URL category param:', err);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => focusCard(0), 100);
  }, [focusCard]);

  // Open Quick View modal and update URL hash tag with app ID
  const handleOpenQuickView = useCallback((tool: ToolItem) => {
    setSelectedTool(tool);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.hash = tool.id;
        window.history.pushState({ toolId: tool.id }, '', url.toString());
      } catch (err) {
        console.error('Failed to update URL hash:', err);
      }
    }
  }, []);

  // Close Quick View modal and remove URL hash tag while preserving category param
  const handleCloseQuickView = useCallback(() => {
    setSelectedTool(null);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.hash) {
          url.hash = '';
          const newPath = url.pathname + (url.search ? url.search : '');
          window.history.pushState(null, '', newPath);
        }
      } catch (err) {
        console.error('Failed to remove URL hash:', err);
      }
    }
    if (focusedIndex !== null) {
      cardRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Synchronize state when user navigates using browser Back/Forward (popstate/hashchange)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLocationChange = () => {
      const urlCat = getCategoryFromUrl();
      setActiveCategory(urlCat);
      const urlTool = getToolFromHash();
      setSelectedTool(urlTool);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Global Keyboard Navigation (Arrow Keys, Enter, Esc, Slash to Search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. If modal is currently open, let QuickViewDialog handle Esc
      if (selectedTool) {
        return;
      }

      const activeEl = document.activeElement;
      const isInput = activeEl === searchInputRef.current;

      // 2. Escape key handling
      if (e.key === 'Escape') {
        if (isInput) {
          searchInputRef.current?.blur();
        } else if (focusedIndex !== null) {
          cardRefs.current[focusedIndex]?.blur();
          setFocusedIndex(null);
        }
        return;
      }

      // 3. Forward slash ('/') or Cmd+K / Ctrl+K to jump to search
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // 4. Down Arrow / Enter from search input jumps to first card
      if (isInput && (e.key === 'ArrowDown' || e.key === 'Enter')) {
        if (filteredData.length > 0) {
          e.preventDefault();
          searchInputRef.current?.blur();
          focusCard(0);
        }
        return;
      }

      // 5. If typing inside an input, don't trigger arrow navigation between cards
      if (isInput) {
        return;
      }

      // 6. Arrow key grid navigation
      const isArrowKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key);
      if (isArrowKey) {
        e.preventDefault();

        if (filteredData.length === 0) return;

        // If no card currently focused, focus first card
        if (focusedIndex === null) {
          focusCard(0);
          return;
        }

        // Determine column count based on viewport width
        const w = window.innerWidth;
        const cols = w >= 1024 ? 3 : w >= 640 ? 2 : 1;
        let nextIndex = focusedIndex;

        switch (e.key) {
          case 'ArrowRight':
            nextIndex = (focusedIndex + 1) % filteredData.length;
            break;
          case 'ArrowLeft':
            nextIndex = (focusedIndex - 1 + filteredData.length) % filteredData.length;
            break;
          case 'ArrowDown':
            nextIndex = Math.min(focusedIndex + cols, filteredData.length - 1);
            break;
          case 'ArrowUp':
            nextIndex = Math.max(focusedIndex - cols, 0);
            break;
        }

        focusCard(nextIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool, focusedIndex, filteredData.length, focusCard]);

  // Global index tracking across grouped sections
  let runningIndex = 0;

  return (
    <div 
      className="relative w-full min-h-screen text-[#10384F] font-sans selection:bg-[#00BCFF]/20 pb-28" 
      style={{ 
        background: 'linear-gradient(133.25deg, rgba(0, 188, 255, 0.07) 10%, rgba(137, 211, 41, 0.05) 45%, rgba(0, 97, 127, 0.06) 85%), #F8FAFC' 
      }}
    >
      {/* Top Header */}
      <header className="sticky top-0 z-[60] w-full p-4 sm:p-5 bg-white/85 backdrop-blur-xl border-b border-[#E2E8F0] shadow-xs relative">
        {/* Bayer Linear Scroll Progress Bar */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00BCFF] via-[#00617F] to-[#89D329] origin-left z-20 shadow-[0_1px_6px_rgba(0,188,255,0.4)]"
          style={{ scaleX }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand Lockup */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => {
              setSearchQuery('');
              handleSelectCategory('ALL');
              focusCard(0);
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00BCFF] via-[#00617F] to-[#89D329] p-[1.5px] shadow-sm">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <img src="./icon.svg" alt="" width={22} height={16} className="w-[22px] h-auto" draggable={false} />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#10384F]">
                B-Anywhere
              </span>
              {/*<span className="hidden sm:inline-block ml-2 text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#00617F] border border-[#BAE6FD] uppercase">
                Creator Suite
              </span>*/}
            </div>
          </div>

          {/* Search & Device Toggles */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search suite... (press /)" 
                className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-full py-2 pl-10 pr-12 text-sm outline-none focus:border-[#00BCFF] focus:bg-white focus:ring-2 focus:ring-[#00BCFF]/20 transition-all text-[#10384F] placeholder:text-[#64748B]" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="text-[#64748B] hover:text-[#10384F]"
                    title="Clear search (Esc)"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white border border-[#CBD5E1] text-[10px] font-mono font-bold text-[#64748B] shadow-xs pointer-events-none">
                    /
                  </kbd>
                )}
              </div>
            </div>

            {/* Desktop (16:9) / Mobile (9:16) Preview Ratio Toggle */}
            <div className="flex bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
              <button 
                onClick={() => {
                  userManuallyToggledRef.current = true;
                  setViewMode('desktop');
                }} 
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-xs ${
                  viewMode === 'desktop' 
                    ? 'bg-[#10384F] text-white shadow-xs font-bold' 
                    : 'text-[#64748B] hover:text-[#10384F]'
                }`}
                title="Desktop 16:9 Ratio"
              >
                <Monitor size={14} />
                <span className="hidden lg:inline text-[10px] font-mono">16:9</span>
              </button>
              <button 
                onClick={() => {
                  userManuallyToggledRef.current = true;
                  setViewMode('mobile');
                }} 
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-xs ${
                  viewMode === 'mobile' 
                    ? 'bg-[#10384F] text-white shadow-xs font-bold' 
                    : 'text-[#64748B] hover:text-[#10384F]'
                }`}
                title="Mobile 9:16 Ratio"
              >
                <Smartphone size={14} />
                <span className="hidden lg:inline text-[10px] font-mono">9:16</span>
              </button>
            </div>

            {/* PWA In-App Install Prompt */}
            {/*<PWAInstallHeaderButton />*/}

            {/* External Suite Link */}
            {/*<a 
              href="https://creator.b-anywhere.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#10384F] hover:bg-[#00617F] text-white text-xs font-black rounded-full transition-all shadow-sm active:scale-95"
            >
              <span>JOIN SUITE</span>
              <ExternalLink size={12} />
            </a>*/}
          </div>
        </div>

        {/* Offline notification badge if disconnected */}
        {!isOnline && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1 rounded-full bg-[#10384F] text-[#00BCFF] text-[11px] font-mono border border-[#00BCFF]/40 shadow-lg animate-pulse">
            <WifiOff size={12} />
            <span>Offline Mode Active — Cached assets running instantly</span>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#89D329]" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#00617F]">
            Bayer/DNV - B-Anywhere Ecosystem
          </span>
        </div>

        <h1 className="text-5xl sm:text-8xl font-black tracking-tighter leading-[0.88] text-[#10384F] mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00617F] via-[#00BCFF] to-[#89D329]">
            B-ANYWHERE
          </span>
        </h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
          <p className="text-[#475569] text-xs font-bold tracking-[0.2em] uppercase">
            Swiss Army Knifes • {filteredData.length} Tools Available
          </p>

          {/* Accessible Keyboard Navigation Guide Pill */}
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#CBD5E1] text-[11px] font-mono text-[#475569] shadow-xs">
            <span className="text-[#00617F] font-bold">KEYS:</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#10384F]">↑↓←→</kbd> Focus</span>
            <span>·</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#10384F]">Enter</kbd> Quick View</span>
            <span>·</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#10384F]">Esc</kbd> Close</span>
          </div>
        </div>
      </div>

      {/* Main Tools Grid grouped by category */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {Object.entries(groupedTools).map(([category, tools]) => {
          return (
            <section key={category} aria-labelledby={`category-${category}`}>
              <div className="flex items-center gap-4 mb-5">
                <h2 
                  id={`category-${category}`}
                  className="text-xs sm:text-sm font-black tracking-widest text-[#00617F] uppercase shrink-0"
                >
                  {category}
                </h2>
                <div className="h-px w-full bg-[#E2E8F0]" />
                <span className="text-[10px] font-mono font-bold text-[#64748B] shrink-0">
                  {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map(tool => {
                  const currentIndex = runningIndex++;
                  return (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      globalIndex={currentIndex}
                      isFocused={focusedIndex === currentIndex}
                      viewMode={viewMode} 
                      onQuickView={handleOpenQuickView}
                      onCardFocus={(idx) => setFocusedIndex(idx)}
                      cardRef={(el) => { cardRefs.current[currentIndex] = el; }}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {filteredData.length === 0 && (
          <div className="py-20 text-center bg-white border border-dashed border-[#CBD5E1] rounded-3xl shadow-xs">
            <Search size={36} className="mx-auto mb-3 text-[#94A3B8]" />
            <p className="font-bold tracking-widest uppercase text-xs text-[#475569] mb-2">No matching tools found</p>
            <button
              onClick={() => { setSearchQuery(''); handleSelectCategory('ALL'); }}
              className="px-4 py-2 bg-[#10384F] hover:bg-[#00617F] text-white rounded-full text-xs font-bold transition-colors shadow-sm"
            >
              Reset Search & Filters
            </button>
          </div>
        )}
      </main>

      {/* Sticky Bottom Category Bar */}
      <nav 
        aria-label="Category Filter Navigation"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-1.5 bg-white/90 backdrop-blur-xl border border-[#CBD5E1] rounded-2xl shadow-xl flex items-center gap-1.5 max-w-[95vw] overflow-x-auto no-scrollbar"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const count = categoryCounts[cat] ?? 0;
          return (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00BCFF] ${
                isActive 
                  ? 'bg-[#10384F] text-white shadow-sm font-black' 
                  : 'text-[#475569] hover:text-[#10384F] hover:bg-[#F1F5F9]'
              }`}
            >
              <span>{cat}</span>
              <sup
                className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-full inline-flex items-center justify-center min-w-[16px] h-3.5 -top-1 relative leading-none transition-colors ${
                  isActive
                    ? 'bg-[#00BCFF] text-[#10384F]'
                    : 'bg-[#E2E8F0] text-[#00617F] group-hover:bg-[#CBD5E1]'
                }`}
                aria-label={`${count} tools in ${cat}`}
              >
                {count}
              </sup>
            </button>
          );
        })}
      </nav>

      {/* Quick View Modal Dialog */}
      <AnimatePresence>
        {selectedTool && (
          <QuickViewDialog 
            tool={selectedTool} 
            viewMode={viewMode} 
            onClose={handleCloseQuickView} 
          />
        )}
      </AnimatePresence>
      
      {/* Background Atmosphere Tint */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-40">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#00BCFF]/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#89D329]/10 blur-[180px] rounded-full" />
      </div>
    </div>
  );
}
