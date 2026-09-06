import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Sliders, 
  Mic, 
  Edit3, 
  Clock, 
  Home, 
  Tag
} from 'lucide-react';
import { PartyProfile, ShoppingItem } from '../types';
import { formatCurrency } from '../utils/calculations';

interface PartySummaryCardProps {
  party: PartyProfile;
  items: ShoppingItem[];
  onOpenSetup: () => void;
  onOpenRefine: () => void;
  onOpenOptimizer: () => void;
  onOpenVoice: () => void;
  onUpdateBudgetQuickly?: (newBudget: number) => void;
  onUpdateGuestsQuickly?: (newGuests: number) => void;
}

export const PartySummaryCard: React.FC<PartySummaryCardProps> = ({
  party,
  items,
  onOpenSetup,
  onOpenRefine,
  onOpenOptimizer,
  onOpenVoice,
  onUpdateBudgetQuickly,
  onUpdateGuestsQuickly,
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(party.budget.toString());
  const [isEditingGuests, setIsEditingGuests] = useState(false);
  const [guestsInput, setGuestsInput] = useState(party.guestCount.toString());

  const totalEstimated = items.reduce((sum, it) => sum + it.estimatedTotalCost, 0);
  const budget = party.budget || 1;
  const remainingBudget = budget - totalEstimated;
  const isOverBudget = remainingBudget < 0;
  const percentageSpent = Math.min(100, Math.round((totalEstimated / budget) * 100));
  const costPerGuest = Math.round((totalEstimated / Math.max(1, party.guestCount)) * 100) / 100;

  const handleSaveBudget = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(budgetInput);
    if (!isNaN(parsed) && parsed > 0 && onUpdateBudgetQuickly) {
      onUpdateBudgetQuickly(parsed);
    }
    setIsEditingBudget(false);
  };

  const handleSaveGuests = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(guestsInput, 10);
    if (!isNaN(parsed) && parsed > 0 && onUpdateGuestsQuickly) {
      onUpdateGuestsQuickly(parsed);
    }
    setIsEditingGuests(false);
  };

  return (
    <section 
      aria-label="Party Summary"
      id="party-summary-panel"
      className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-6 transition-all"
    >
      {/* Top Banner with Theme and Status */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
                Active Party Summary
              </span>
              <span className="text-xs text-stone-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {party.partyType || 'Special Celebration'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white truncate tracking-tight mt-0.5">
              {party.theme}
            </h2>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            id="summary-voice-btn"
            onClick={onOpenVoice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-stone-100 border border-white/10 transition-colors"
            title="Open Hands-Free Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Voice Control</span>
          </button>

          <button
            type="button"
            id="summary-refine-btn"
            onClick={onOpenRefine}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-stone-100 border border-white/10 transition-colors"
            title="Refine Constraints & Scaling"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-300" />
            <span>Refine</span>
          </button>

          <button
            type="button"
            id="summary-edit-brief-btn"
            onClick={onOpenSetup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-xs"
            title="Configure Event Brief"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Event</span>
          </button>
        </div>
      </div>

      {/* Main 5-Metrics Grid: Guests, Theme, Budget, Estimated Cost, Remaining Budget */}
      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 bg-stone-50/50">
        
        {/* 1. GUESTS */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              Guests
            </span>
            <button
              type="button"
              onClick={() => {
                setIsEditingGuests(!isEditingGuests);
                setGuestsInput(party.guestCount.toString());
              }}
              className="text-[11px] text-amber-700 hover:text-amber-800 font-medium underline"
            >
              {isEditingGuests ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditingGuests ? (
            <form onSubmit={handleSaveGuests} className="mt-1 flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="200"
                value={guestsInput}
                onChange={(e) => setGuestsInput(e.target.value)}
                className="w-16 px-2 py-1 text-sm font-bold border border-amber-400 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs font-bold bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                Save
              </button>
            </form>
          ) : (
            <div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                {party.guestCount}
                <span className="text-xs font-normal text-stone-500 ml-1">people</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {party.adultCount} adults, {party.kidCount} kids
              </div>
            </div>
          )}

          <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-2 pt-1 border-t border-stone-100">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{party.durationHours}h • {party.timeOfDay}</span>
          </div>
        </div>

        {/* 2. THEME & OCCASION */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Theme & Vibe
            </span>
          </div>

          <div>
            <div className="text-base font-bold text-stone-900 line-clamp-1 leading-snug">
              {party.theme}
            </div>
            <div className="mt-1 flex items-center gap-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                {party.vibe}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-0.5">
                <Home className="w-2.5 h-2.5" />
                {party.venue}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-stone-500 truncate mt-2 pt-1 border-t border-stone-100">
            {party.dietaryRestrictions.length > 0 ? (
              <span className="text-emerald-700 font-medium">
                {party.dietaryRestrictions.join(', ')}
              </span>
            ) : (
              'Standard catering plan'
            )}
          </div>
        </div>

        {/* 3. BUDGET */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-stone-500" />
              Host Budget
            </span>
            <button
              type="button"
              onClick={() => {
                setIsEditingBudget(!isEditingBudget);
                setBudgetInput(party.budget.toString());
              }}
              className="text-[11px] text-amber-700 hover:text-amber-800 font-medium underline"
            >
              {isEditingBudget ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditingBudget ? (
            <form onSubmit={handleSaveBudget} className="mt-1 flex items-center gap-1">
              <span className="text-xs font-bold text-stone-500">$</span>
              <input
                type="number"
                min="10"
                step="5"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-20 px-2 py-1 text-sm font-bold border border-amber-400 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs font-bold bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                Set
              </button>
            </form>
          ) : (
            <div>
              <div className="text-2xl font-black text-stone-900 tracking-tight">
                {formatCurrency(budget)}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Allocated maximum
              </div>
            </div>
          )}

          <div className="text-[10px] text-stone-400 mt-2 pt-1 border-t border-stone-100">
            Target per guest: ~{formatCurrency(budget / Math.max(1, party.guestCount))}
          </div>
        </div>

        {/* 4. ESTIMATED COST */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-stone-500" />
              Estimated Cost
            </span>
            <span className="text-[11px] font-medium text-stone-500">
              {items.length} items
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-stone-900 tracking-tight">
              {formatCurrency(totalEstimated)}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
              <span>{formatCurrency(costPerGuest)} / guest</span>
            </div>
          </div>

          <div className="text-[10px] text-stone-400 mt-2 pt-1 border-t border-stone-100">
            {percentageSpent}% of total budget used
          </div>
        </div>

        {/* 5. REMAINING BUDGET */}
        <div 
          className={`col-span-2 sm:col-span-1 p-3.5 rounded-xl border shadow-2xs flex flex-col justify-between transition-colors ${
            isOverBudget
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              {isOverBudget ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-rose-900">Over Budget</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-900">Remaining</span>
                </>
              )}
            </span>

            {isOverBudget && (
              <button
                type="button"
                id="party-summary-fix-budget-btn"
                onClick={onOpenOptimizer}
                className="text-[11px] font-extrabold text-rose-700 hover:text-rose-900 underline flex items-center gap-0.5"
              >
                <span>Fix with AI</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div>
            <div className={`text-2xl font-black tracking-tight ${isOverBudget ? 'text-rose-700' : 'text-emerald-700'}`}>
              {isOverBudget ? `-${formatCurrency(Math.abs(remainingBudget))}` : `+${formatCurrency(remainingBudget)}`}
            </div>
            <div className="text-[11px] font-medium opacity-80 mt-0.5">
              {isOverBudget ? 'Deficit to balance' : 'Available buffer'}
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-black/5 text-[10px] font-semibold flex items-center justify-between">
            {isOverBudget ? (
              <button
                type="button"
                onClick={onOpenOptimizer}
                className="text-rose-800 hover:text-rose-950 font-bold underline"
              >
                ⚡ View Cheaper Alternatives
              </button>
            ) : (
              <span className="text-emerald-800 font-semibold">
                ✓ Event safely funded
              </span>
            )}
            <span className="opacity-75">
              {percentageSpent}% spent
            </span>
          </div>
        </div>

      </div>

      {/* Mini Progress bar across bottom */}
      <div className="w-full bg-stone-200 h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isOverBudget ? 'bg-rose-500' : percentageSpent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(100, percentageSpent)}%` }}
        />
      </div>
    </section>
  );
};
