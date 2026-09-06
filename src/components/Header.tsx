import React from 'react';
import { Sparkles, Calendar, Plus, Share2, Clock, Flame, ChevronDown, Mic } from 'lucide-react';
import { PartyProfile } from '../types';
import { PARTY_PRESETS } from '../data/presets';

interface HeaderProps {
  party: PartyProfile;
  onOpenSetup: () => void;
  onOpenTimeline: () => void;
  onOpenExport: () => void;
  onSelectPreset: (preset: typeof PARTY_PRESETS[0]) => void;
  isLoading: boolean;
  onOpenRefine?: () => void;
  onOpenCheckout?: () => void;
  onOpenVoice?: () => void;
  onOpenOptimizer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  party,
  onOpenSetup,
  onOpenTimeline,
  onOpenExport,
  onSelectPreset,
  isLoading,
  onOpenRefine,
  onOpenCheckout,
  onOpenVoice,
  onOpenOptimizer,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = React.useState(false);

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Active Event Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs font-bold text-lg tracking-tight">
            <Sparkles className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-stone-900 leading-tight">
                CymbalMart Shopping Agent
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Agent Active
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-600 mt-0.5">
              <span className="font-semibold text-stone-800">{party.title}</span>
              <span>•</span>
              <span className="text-stone-500">{party.theme}</span>
              <span>•</span>
              <span>{party.guestCount} Guests</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Presets Dropdown */}
          <div className="relative">
            <button
              id="presets-menu-btn"
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Party Presets</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
            </button>

            {showPresetsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPresetsMenu(false)}
                />
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                    Quick Start Party Scenarios
                  </div>
                  {PARTY_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onSelectPreset(p);
                        setShowPresetsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50/70 transition-colors flex flex-col border-b border-stone-100 last:border-0"
                    >
                      <span className="font-medium text-stone-800">{p.title}</span>
                      <span className="text-[11px] text-stone-500">
                        {p.guestCount} guests • ${p.budget} budget • {p.theme}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Voice Assistant Hands-Free Button */}
          {onOpenVoice && (
            <button
              id="header-voice-btn"
              type="button"
              onClick={onOpenVoice}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300 shadow-2xs"
              title="Activate Hands-Free Voice Control"
            >
              <Mic className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>Voice Control</span>
            </button>
          )}

          {/* Timeline Run Sheet Button */}
          <button
            id="open-timeline-btn"
            type="button"
            onClick={onOpenTimeline}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-lg transition-colors border border-stone-200"
          >
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span>Shopping Timeline</span>
          </button>

          {/* Export / Share Button */}
          <button
            id="open-export-btn"
            type="button"
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-lg transition-colors border border-stone-200"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-500" />
            <span>Export & Print</span>
          </button>

          {/* Refine Constraints Button */}
          {onOpenRefine && (
            <button
              id="open-refine-btn"
              type="button"
              onClick={onOpenRefine}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
            >
              <span>Refine Constraints</span>
            </button>
          )}

          {/* Checkout & Finalize Button */}
          {onOpenCheckout && (
            <button
              id="open-checkout-btn"
              type="button"
              onClick={onOpenCheckout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <span>Checkout Order</span>
            </button>
          )}

          {/* Edit Party Brief / Plan New */}
          <button
            id="edit-party-brief-btn"
            type="button"
            onClick={onOpenSetup}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-lg transition-colors border border-stone-200"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Party Setup</span>
          </button>
        </div>
      </div>
    </header>
  );
};
