import React from 'react';
import { 
  FileText, 
  Scale, 
  ShoppingBag, 
  Check, 
  ArrowRight, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { CUJStep, PartyProfile, ShoppingItem } from '../types';
import { formatCurrency } from '../utils/calculations';

interface CUJStepGuideProps {
  currentStep: CUJStep;
  onSetStep: (step: CUJStep) => void;
  party: PartyProfile;
  items: ShoppingItem[];
  onOpenSetup: () => void;
  onOpenRefine: () => void;
  onOpenCheckout: () => void;
  onAutoAlignBudget: () => void;
}

export const CUJStepGuide: React.FC<CUJStepGuideProps> = ({
  currentStep,
  onSetStep,
  party,
  items,
  onOpenSetup,
  onOpenRefine,
  onOpenCheckout,
  onAutoAlignBudget,
}) => {
  const totalCost = items.reduce((sum, i) => sum + (i.estimatedTotalCost || 0), 0);
  const budget = party.budget || 1;
  const isOverBudget = totalCost > budget;
  const diff = Math.abs(budget - totalCost);
  const cymbalChoiceCount = items.filter((i) => i.isCymbalChoice).length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              CymbalMart Host Workflow
            </span>
            <span className="text-xs text-stone-500 font-medium">
              3-Step Guided Event Planning
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Convert intent into a curated, budget-conscious CymbalMart shopping cart ready for pickup or delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOverBudget ? (
            <button
              type="button"
              onClick={onAutoAlignBudget}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              title="Automatically trim non-essentials or swap to Cymbal Choice to fit budget"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Align to ${party.budget}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCheckout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Proceed to Checkout</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
        {/* Step 1: Define Event */}
        <div 
          onClick={() => { onSetStep('define'); onOpenSetup(); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            currentStep === 'define'
              ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20'
              : 'bg-stone-50/50 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-bold text-stone-900">Define Event</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
              Defined
            </span>
          </div>

          <p className="text-[11px] text-stone-600 line-clamp-1">
            <span className="font-semibold text-stone-800">{party.partyType || 'Party'}</span> • {party.theme}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
            <span>{party.guestCount} guests • ${party.budget} budget</span>
            <span className="text-amber-700 font-semibold hover:underline">Edit Specs →</span>
          </div>
        </div>

        {/* Step 2: Review List & Align Budget */}
        <div 
          onClick={() => onSetStep('review')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            currentStep === 'review'
              ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20'
              : 'bg-stone-50/50 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-800 text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-bold text-stone-900">Review & Align List</span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isOverBudget 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isOverBudget ? `Over by ${formatCurrency(diff)}` : `Aligned (${formatCurrency(diff)} under)`}
            </span>
          </div>

          <p className="text-[11px] text-stone-600 line-clamp-1">
            {items.length} items curated • {cymbalChoiceCount} Cymbal Choice swaps active
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
            <span className="font-bold text-stone-900">{formatCurrency(totalCost)} of ${party.budget}</span>
            <span className="text-stone-700 font-semibold hover:underline">Review Cart →</span>
          </div>
        </div>

        {/* Step 3: Refine & Checkout */}
        <div 
          onClick={() => { onSetStep('refine_checkout'); onOpenCheckout(); }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            currentStep === 'refine_checkout'
              ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20'
              : 'bg-stone-50/50 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-800 text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-bold text-stone-900">Refine & Checkout</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Finalize
            </span>
          </div>

          <p className="text-[11px] text-stone-600 line-clamp-1">
            Curbside pickup or express delivery at CymbalMart
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenRefine(); }}
              className="text-stone-700 font-semibold hover:underline flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Adjust Constraints</span>
            </button>
            <span className="text-emerald-700 font-bold hover:underline">Checkout Now →</span>
          </div>
        </div>
      </div>
    </div>
  );
};
