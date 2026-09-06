import React from 'react';
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingDown, 
  Beer, 
  Flame,
  Info,
  Tag,
  ArrowRight,
  Store
} from 'lucide-react';
import { PartyProfile, ShoppingItem } from '../types';
import { calculatePartyFormulas, formatCurrency } from '../utils/calculations';

interface BudgetSummaryBarProps {
  party: PartyProfile;
  items: ShoppingItem[];
  onTriggerQuickAction: (actionType: 'budget_cut' | 'allergy_safe' | 'upgrade_atmosphere') => void;
  isOptimizing: boolean;
  onSwapAllToCymbalChoice?: () => void;
  onAutoAlignBudget?: () => void;
  onOpenOptimizer?: () => void;
}

export const BudgetSummaryBar: React.FC<BudgetSummaryBarProps> = ({
  party,
  items,
  onTriggerQuickAction,
  isOptimizing,
  onSwapAllToCymbalChoice,
  onAutoAlignBudget,
  onOpenOptimizer,
}) => {
  const totalEstimated = items.reduce((acc, it) => acc + it.estimatedTotalCost, 0);
  const purchasedItems = items.filter((it) => it.isPurchased);
  const totalPurchasedCost = purchasedItems.reduce(
    (acc, it) => acc + (it.actualCost !== undefined ? it.actualCost : it.estimatedTotalCost),
    0
  );

  const budget = party.budget || 1;
  const percentageSpent = Math.min(100, Math.round((totalEstimated / budget) * 100));
  const isOverBudget = totalEstimated > budget;
  const budgetDifference = Math.abs(budget - totalEstimated);
  const costPerGuest = Math.round(totalEstimated / Math.max(1, party.guestCount));

  // Potential savings if remaining national brand items switch to Cymbal Choice
  const unswappedCymbalOptions = items.filter(
    (it) => it.cymbalChoiceOption && !it.isCymbalChoice
  );
  const potentialSavings = unswappedCymbalOptions.reduce(
    (sum, it) => sum + (it.cymbalChoiceOption?.savingsPerUnit || 0) * it.quantity,
    0
  );

  const activeCymbalSwaps = items.filter((it) => it.isCymbalChoice);
  const appliedSavings = activeCymbalSwaps.reduce(
    (sum, it) => sum + (it.cymbalChoiceOption?.savingsPerUnit || 0) * it.quantity,
    0
  );

  // Party formulas
  const formulas = calculatePartyFormulas(
    party.guestCount,
    party.adultCount,
    party.kidCount,
    party.durationHours,
    party.timeOfDay
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs mb-6">
      {/* Top row: Budget meter & primary stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Budget Progress Meter */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Task 2: Review List & Budget Alignment
              </span>
              {isOverBudget ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <AlertCircle className="w-3 h-3 text-amber-700" />
                  {formatCurrency(budgetDifference)} over target
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  {formatCurrency(budgetDifference)} under budget
                </span>
              )}
            </div>
            <div className="text-right text-xs text-stone-500">
              Host Budget: <span className="font-bold text-stone-800">{formatCurrency(budget)}</span>
            </div>
          </div>

          {/* Meter bar */}
          <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-stone-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (totalEstimated / budget) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600 pt-0.5">
            <div>
              Est. Total: <span className="font-bold text-stone-900 text-sm">{formatCurrency(totalEstimated)}</span>
            </div>
            <div>
              Per Guest: <span className="font-semibold text-stone-800">${costPerGuest}</span>
            </div>
            {appliedSavings > 0 && (
              <div className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                <Tag className="w-3 h-3" />
                <span>{formatCurrency(appliedSavings)} saved via Cymbal Choice</span>
              </div>
            )}
          </div>
        </div>

        {/* Catering & Portion Rules of Thumb */}
        <div className="lg:col-span-6 bg-stone-50/80 rounded-xl p-3.5 border border-stone-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Catering Formulas ({party.guestCount} Guests, {party.durationHours}h)</span>
            </div>
            <span className="text-[11px] text-stone-600">Built-in host safety buffers</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <div className="text-[11px] text-stone-500">Drinks Needed</div>
              <div className="text-sm font-bold text-stone-800">{formulas.drinksTotal} drinks</div>
              <div className="text-[10px] text-stone-600">{formulas.alcoholicDrinks} alc / {formulas.nonAlcoholicDrinks} non-alc</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <div className="text-[11px] text-stone-500">Party Ice</div>
              <div className="text-sm font-bold text-stone-800">{formulas.iceLbs} lbs</div>
              <div className="text-[10px] text-stone-600">~{formulas.iceBags10Lb} x 10lb bags</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <div className="text-[11px] text-stone-500">Protein / Mains</div>
              <div className="text-sm font-bold text-stone-800">{formulas.proteinLbs} lbs</div>
              <div className="text-[10px] text-stone-600">or {formulas.appetizerPieces} finger bites</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <div className="text-[11px] text-stone-500">Tableware Buffer</div>
              <div className="text-sm font-bold text-stone-800">{formulas.platesEstimate} plates</div>
              <div className="text-[10px] text-stone-600">{formulas.cupsEstimate} cups</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Agent Optimization Shortcuts & Budget Alignment */}
      <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-semibold text-stone-800">Budget Alignment Tools:</span>
          {potentialSavings > 0 && onSwapAllToCymbalChoice && (
            <button
              type="button"
              onClick={onSwapAllToCymbalChoice}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-colors"
            >
              <Tag className="w-3 h-3" />
              <span>Swap All to Cymbal Choice (Save {formatCurrency(potentialSavings)})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenOptimizer && (
            <button
              type="button"
              onClick={onOpenOptimizer}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                isOverBudget
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isOverBudget ? '⚡ Suggest Cheaper Alternatives' : 'Smart Budget Optimizer'}</span>
            </button>
          )}

          {onAutoAlignBudget && (
            <button
              type="button"
              onClick={onAutoAlignBudget}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Auto-Align</span>
            </button>
          )}

          <button
            type="button"
            disabled={isOptimizing}
            onClick={() => onTriggerQuickAction('budget_cut')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50"
          >
            <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
            <span>Trim Non-Essentials (~15%)</span>
          </button>

          <button
            type="button"
            disabled={isOptimizing}
            onClick={() => onTriggerQuickAction('allergy_safe')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Allergy / Dietary Check</span>
          </button>

          <button
            type="button"
            disabled={isOptimizing}
            onClick={() => onTriggerQuickAction('upgrade_atmosphere')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5 text-purple-600" />
            <span>Atmosphere & Decor Boost</span>
          </button>
        </div>
      </div>
    </div>
  );
};
