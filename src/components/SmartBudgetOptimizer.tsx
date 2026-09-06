import React, { useMemo, useState } from 'react';
import { 
  Sparkles, 
  TrendingDown, 
  DollarSign, 
  Tag, 
  ArrowRight, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  Package, 
  X,
  Store,
  Layers,
  HelpCircle,
  Scissors
} from 'lucide-react';
import { PartyProfile, ShoppingItem } from '../types';
import { formatCurrency } from '../utils/calculations';

export interface CheaperAlternativeSuggestion {
  id: string;
  targetItemId: string;
  originalName: string;
  originalUnitCost: number;
  originalTotalCost: number;
  quantity: number;
  unit: string;
  
  // Proposed alternative
  suggestedName: string;
  suggestedUnitCost: number;
  suggestedTotalCost: number;
  totalSavings: number;
  categoryType: 'store_brand' | 'bulk_value' | 'cheaper_substitute' | 'portion_trim';
  reason: string;
  applied?: boolean;
}

interface SmartBudgetOptimizerProps {
  party: PartyProfile;
  items: ShoppingItem[];
  isOpen: boolean;
  onClose: () => void;
  onApplySingleAlternative: (suggestion: CheaperAlternativeSuggestion) => void;
  onApplyAllAlternatives: (suggestions: CheaperAlternativeSuggestion[]) => void;
  onAutoAlignBudget: () => void;
}

export const SmartBudgetOptimizer: React.FC<SmartBudgetOptimizerProps> = ({
  party,
  items,
  isOpen,
  onClose,
  onApplySingleAlternative,
  onApplyAllAlternatives,
  onAutoAlignBudget,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'store_brand' | 'cheaper_substitute' | 'bulk_value' | 'portion_trim'>('all');
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const totalEstimated = useMemo(() => {
    return items.reduce((sum, it) => sum + it.estimatedTotalCost, 0);
  }, [items]);

  const budget = party.budget || 1;
  const budgetDeficit = Math.max(0, totalEstimated - budget);
  const isOverBudget = totalEstimated > budget;

  // Generate intelligent cheaper alternatives tailored to this party and current items
  const suggestions = useMemo<CheaperAlternativeSuggestion[]>(() => {
    const list: CheaperAlternativeSuggestion[] = [];

    // 1. Store Brand Swaps (Cymbal Choice)
    items.forEach((item) => {
      if (item.cymbalChoiceOption && !item.isCymbalChoice) {
        const altUnitCost = item.cymbalChoiceOption.unitCost || (item.cymbalChoiceOption as any).unitPrice || 0;
        const altTotal = Math.round(item.quantity * altUnitCost * 100) / 100;
        const savings = Math.max(0, Math.round((item.estimatedTotalCost - altTotal) * 100) / 100);

        if (savings > 0) {
          list.push({
            id: `swap-${item.id}`,
            targetItemId: item.id,
            originalName: item.name,
            originalUnitCost: item.estimatedUnitCost,
            originalTotalCost: item.estimatedTotalCost,
            quantity: item.quantity,
            unit: item.unit,
            suggestedName: item.cymbalChoiceOption.name,
            suggestedUnitCost: altUnitCost,
            suggestedTotalCost: altTotal,
            totalSavings: savings,
            categoryType: 'store_brand',
            reason: 'Direct Cymbal Choice store-brand equivalent. 100% satisfaction guaranteed with zero taste difference.',
            applied: appliedIds.has(`swap-${item.id}`),
          });
        }
      }
    });

    // 2. Cheaper Substitutes for High-Cost Items
    items.forEach((item) => {
      const lowerName = item.name.toLowerCase();
      
      // Premium meat / steak / gourmet seafood
      if ((lowerName.includes('steak') || lowerName.includes('brisket') || lowerName.includes('tenderloin') || lowerName.includes('salmon')) && item.estimatedUnitCost > 14) {
        const cheaperUnit = Math.round(item.estimatedUnitCost * 0.65 * 100) / 100;
        const cheaperTotal = Math.round(item.quantity * cheaperUnit * 100) / 100;
        const savings = Math.round((item.estimatedTotalCost - cheaperTotal) * 100) / 100;
        list.push({
          id: `sub-${item.id}-sliders`,
          targetItemId: item.id,
          originalName: item.name,
          originalUnitCost: item.estimatedUnitCost,
          originalTotalCost: item.estimatedTotalCost,
          quantity: item.quantity,
          unit: item.unit,
          suggestedName: `Cymbal Marinated BBQ Pulled Chicken & Burger Slider Bundle`,
          suggestedUnitCost: cheaperUnit,
          suggestedTotalCost: cheaperTotal,
          totalSavings: savings,
          categoryType: 'cheaper_substitute',
          reason: 'High-volume crowd pleaser that satisfies guests at 35% lower cost per serving.',
          applied: appliedIds.has(`sub-${item.id}-sliders`),
        });
      }

      // Pre-made artisan platters / charcuterie
      if ((lowerName.includes('charcuterie') || lowerName.includes('gourmet') || lowerName.includes('artisan dip')) && item.estimatedUnitCost > 9) {
        const cheaperUnit = Math.round(item.estimatedUnitCost * 0.6 * 100) / 100;
        const cheaperTotal = Math.round(item.quantity * cheaperUnit * 100) / 100;
        const savings = Math.round((item.estimatedTotalCost - cheaperTotal) * 100) / 100;
        list.push({
          id: `sub-${item.id}-deli`,
          targetItemId: item.id,
          originalName: item.name,
          originalUnitCost: item.estimatedUnitCost,
          originalTotalCost: item.estimatedTotalCost,
          quantity: item.quantity,
          unit: item.unit,
          suggestedName: `Cymbal Deli Fresh Cheddar, Swiss & Pita Chip Platter`,
          suggestedUnitCost: cheaperUnit,
          suggestedTotalCost: cheaperTotal,
          totalSavings: savings,
          categoryType: 'cheaper_substitute',
          reason: 'Fresh store-prepped deli cheese & cracker tray with zero assembly time.',
          applied: appliedIds.has(`sub-${item.id}-deli`),
        });
      }

      // Specialty Cocktails / pre-mixed alcohol
      if ((lowerName.includes('cocktail') || lowerName.includes('ready-to-drink') || lowerName.includes('wine bottle')) && item.estimatedUnitCost > 15) {
        const cheaperUnit = Math.round(item.estimatedUnitCost * 0.55 * 100) / 100;
        const cheaperTotal = Math.round(item.quantity * cheaperUnit * 100) / 100;
        const savings = Math.round((item.estimatedTotalCost - cheaperTotal) * 100) / 100;
        list.push({
          id: `sub-${item.id}-punch`,
          targetItemId: item.id,
          originalName: item.name,
          originalUnitCost: item.estimatedUnitCost,
          originalTotalCost: item.estimatedTotalCost,
          quantity: item.quantity,
          unit: item.unit,
          suggestedName: `Cymbal Big-Batch Signature Party Punch / Sangria Kit`,
          suggestedUnitCost: cheaperUnit,
          suggestedTotalCost: cheaperTotal,
          totalSavings: savings,
          categoryType: 'cheaper_substitute',
          reason: 'Big-batch self-serve punch bowl costs half as much as individual ready-to-drink cans.',
          applied: appliedIds.has(`sub-${item.id}-punch`),
        });
      }

      // Themed Party Supplies / expensive tableware
      if (item.category === 'tableware' && item.estimatedUnitCost > 8) {
        const cheaperUnit = 4.99;
        const cheaperTotal = Math.round(item.quantity * cheaperUnit * 100) / 100;
        const savings = Math.max(0, Math.round((item.estimatedTotalCost - cheaperTotal) * 100) / 100);
        if (savings > 0) {
          list.push({
            id: `sub-${item.id}-tableware`,
            targetItemId: item.id,
            originalName: item.name,
            originalUnitCost: item.estimatedUnitCost,
            originalTotalCost: item.estimatedTotalCost,
            quantity: item.quantity,
            unit: item.unit,
            suggestedName: `Cymbal Party-Value Sturdy Eco-Plates & Cutlery Pack`,
            suggestedUnitCost: cheaperUnit,
            suggestedTotalCost: cheaperTotal,
            totalSavings: savings,
            categoryType: 'cheaper_substitute',
            reason: 'Heavy-duty commercial paper plates that resist grease without the boutique mark-up.',
            applied: appliedIds.has(`sub-${item.id}-tableware`),
          });
        }
      }
    });

    // 3. Bulk Multi-Packs / Family Sizes
    items.forEach((item) => {
      const lowerName = item.name.toLowerCase();
      if ((lowerName.includes('soda') || lowerName.includes('seltzer') || lowerName.includes('chips') || lowerName.includes('water')) && item.quantity >= 3) {
        const bulkQuantity = 1;
        const bulkUnitCost = Math.round(item.estimatedTotalCost * 0.75 * 100) / 100;
        const savings = Math.round((item.estimatedTotalCost - bulkUnitCost) * 100) / 100;
        list.push({
          id: `bulk-${item.id}`,
          targetItemId: item.id,
          originalName: item.name,
          originalUnitCost: item.estimatedUnitCost,
          originalTotalCost: item.estimatedTotalCost,
          quantity: bulkQuantity,
          unit: 'Cymbal Club Case (24pk/Bulk)',
          suggestedName: `CymbalMart Family Club Pack: ${item.name.split('(')[0].trim()}`,
          suggestedUnitCost: bulkUnitCost,
          suggestedTotalCost: bulkUnitCost,
          totalSavings: savings,
          categoryType: 'bulk_value',
          reason: 'Consolidate multiple small retail packs into 1 CymbalMart wholesale case for 25% savings.',
          applied: appliedIds.has(`bulk-${item.id}`),
        });
      }
    });

    // 4. Portion / Non-Essential Trimming
    items.forEach((item) => {
      if (!item.isEssential && item.quantity > 1 && item.category !== 'drinks') {
        const trimmedQty = Math.max(1, Math.round(item.quantity * 0.65));
        if (trimmedQty < item.quantity) {
          const trimmedTotal = Math.round(trimmedQty * item.estimatedUnitCost * 100) / 100;
          const savings = Math.round((item.estimatedTotalCost - trimmedTotal) * 100) / 100;
          list.push({
            id: `trim-${item.id}`,
            targetItemId: item.id,
            originalName: item.name,
            originalUnitCost: item.estimatedUnitCost,
            originalTotalCost: item.estimatedTotalCost,
            quantity: trimmedQty,
            unit: item.unit,
            suggestedName: `${item.name} (Trimmed Buffer: ${trimmedQty} ${item.unit})`,
            suggestedUnitCost: item.estimatedUnitCost,
            suggestedTotalCost: trimmedTotal,
            totalSavings: savings,
            categoryType: 'portion_trim',
            reason: 'Right-sized portioning for non-essential extra favors and backup snacks.',
            applied: appliedIds.has(`trim-${item.id}`),
          });
        }
      }
    });

    // Remove duplicates and sort by highest dollar savings
    const unique = new Map<string, CheaperAlternativeSuggestion>();
    list.forEach((s) => {
      if (!unique.has(s.id)) {
        unique.set(s.id, s);
      }
    });

    return Array.from(unique.values()).sort((a, b) => b.totalSavings - a.totalSavings);
  }, [items, appliedIds]);

  const filteredSuggestions = useMemo(() => {
    if (activeTab === 'all') return suggestions;
    return suggestions.filter((s) => s.categoryType === activeTab);
  }, [suggestions, activeTab]);

  const totalPotentialSavings = useMemo(() => {
    return suggestions
      .filter((s) => !appliedIds.has(s.id))
      .reduce((sum, s) => sum + s.totalSavings, 0);
  }, [suggestions, appliedIds]);

  const projectedTotal = Math.max(0, totalEstimated - totalPotentialSavings);
  const projectedRemaining = budget - projectedTotal;

  const handleApply = (suggestion: CheaperAlternativeSuggestion) => {
    setAppliedIds((prev) => new Set(prev).add(suggestion.id));
    onApplySingleAlternative(suggestion);
  };

  const handleApplyAll = () => {
    const unapplied = suggestions.filter((s) => !appliedIds.has(s.id));
    const newApplied = new Set(appliedIds);
    unapplied.forEach((s) => newApplied.add(s.id));
    setAppliedIds(newApplied);
    onApplyAllAlternatives(unapplied);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        id="smart-budget-optimizer-modal"
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Smart Budget Optimizer</h3>
                {isOverBudget ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/30 text-rose-300 border border-rose-400/30">
                    Deficit: {formatCurrency(budgetDeficit)}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                    Under Budget
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                AI-suggested cheaper alternatives, store-brand swaps, and value pack sizing to balance your party budget.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current vs Projected Impact Banner */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <div className="text-[11px] font-semibold text-stone-500">Host Budget</div>
              <div className="text-lg font-black text-stone-900">{formatCurrency(budget)}</div>
              <div className="text-[10px] text-stone-400">Target maximum</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <div className="text-[11px] font-semibold text-stone-500">Current Cart Cost</div>
              <div className={`text-lg font-black ${isOverBudget ? 'text-rose-600' : 'text-stone-900'}`}>
                {formatCurrency(totalEstimated)}
              </div>
              <div className="text-[10px] text-stone-500">
                {isOverBudget ? `Exceeds by ${formatCurrency(budgetDeficit)}` : 'Within budget target'}
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <div className="text-[11px] font-semibold text-emerald-800">Available Alternative Savings</div>
              <div className="text-lg font-black text-emerald-700">
                {formatCurrency(totalPotentialSavings)}
              </div>
              <div className="text-[10px] text-emerald-800 font-medium">
                {projectedRemaining >= 0 ? `Brings event under budget!` : `Cuts deficit significantly`}
              </div>
            </div>
          </div>

          {/* Quick 1-Click All Action */}
          {suggestions.length > 0 && totalPotentialSavings > 0 && (
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-stone-200/60">
              <span className="text-xs text-stone-600 font-medium">
                💡 Found <strong>{suggestions.length}</strong> smart alternatives to lower expenses.
              </span>
              <button
                type="button"
                id="apply-all-alternatives-btn"
                onClick={handleApplyAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Apply All Alternatives (Save {formatCurrency(totalPotentialSavings)})</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pt-3 flex items-center gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            All Suggestions ({suggestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('store_brand')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === 'store_brand'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Tag className="w-3 h-3 text-emerald-600" />
            <span>Cymbal Choice Brand ({suggestions.filter((s) => s.categoryType === 'store_brand').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cheaper_substitute')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === 'cheaper_substitute'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Cheaper Substitutes ({suggestions.filter((s) => s.categoryType === 'cheaper_substitute').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bulk_value')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === 'bulk_value'
                ? 'border-blue-600 text-blue-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Package className="w-3 h-3 text-blue-600" />
            <span>Bulk & Value Sizing ({suggestions.filter((s) => s.categoryType === 'bulk_value').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portion_trim')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === 'portion_trim'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Scissors className="w-3 h-3 text-purple-600" />
            <span>Portion Trimming ({suggestions.filter((s) => s.categoryType === 'portion_trim').length})</span>
          </button>
        </div>

        {/* Alternatives List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredSuggestions.length === 0 ? (
            <div className="py-12 text-center text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-800">No further alternatives in this category!</p>
              <p className="text-xs text-stone-500 mt-1">All available optimizations have either been applied or your list is already using the best-value options.</p>
            </div>
          ) : (
            filteredSuggestions.map((suggestion) => {
              const isApplied = appliedIds.has(suggestion.id);

              return (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isApplied
                      ? 'bg-emerald-50/50 border-emerald-200 opacity-75'
                      : 'bg-white hover:bg-stone-50/80 border-stone-200 shadow-2xs'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Save {formatCurrency(suggestion.totalSavings)}
                      </span>
                      <span className="text-[11px] font-medium text-stone-500">
                        {suggestion.categoryType === 'store_brand' && 'Store Brand Swap'}
                        {suggestion.categoryType === 'cheaper_substitute' && 'Value Ingredient Substitute'}
                        {suggestion.categoryType === 'bulk_value' && 'Wholesale Pack Sizing'}
                        {suggestion.categoryType === 'portion_trim' && 'Non-Essential Buffer Trim'}
                      </span>
                    </div>

                    {/* Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Current Item */}
                      <div className="p-2.5 rounded-lg bg-stone-100/70 border border-stone-200/80">
                        <div className="text-[10px] font-bold text-stone-400 uppercase">Current Choice</div>
                        <div className="font-semibold text-stone-800 line-clamp-1">{suggestion.originalName}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {suggestion.quantity} {suggestion.unit} • {formatCurrency(suggestion.originalTotalCost)} ({formatCurrency(suggestion.originalUnitCost)}/ea)
                        </div>
                      </div>

                      {/* Cheaper Alternative */}
                      <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200">
                        <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Cheaper Alternative
                        </div>
                        <div className="font-bold text-emerald-950 line-clamp-1">{suggestion.suggestedName}</div>
                        <div className="text-[11px] text-emerald-800 mt-0.5">
                          {suggestion.quantity} {suggestion.unit} • <span className="font-bold">{formatCurrency(suggestion.suggestedTotalCost)}</span> ({formatCurrency(suggestion.suggestedUnitCost)}/ea)
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-500 mt-2 italic">
                      "{suggestion.reason}"
                    </p>
                  </div>

                  {/* Apply Button */}
                  <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApply(suggestion)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs"
                      >
                        <span>Apply Alternative</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-stone-600">
            Current List Total: <span className="font-bold text-stone-900">{formatCurrency(totalEstimated)}</span> | Host Budget: <span className="font-bold text-stone-900">{formatCurrency(budget)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAutoAlignBudget}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Auto-Align to Budget
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
            >
              Done Reviewing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
