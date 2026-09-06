import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Users, 
  DollarSign, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { PartyProfile, ShoppingItem } from '../types';
import { calculatePartyFormulas, formatCurrency } from '../utils/calculations';

interface RefineConstraintsModalProps {
  party: PartyProfile;
  items: ShoppingItem[];
  isOpen: boolean;
  onClose: () => void;
  onApplyConstraints: (updatedParty: PartyProfile, rebalanceStrategy: 'scale_quantities' | 'full_regenerate') => void;
  isLoading: boolean;
}

export const RefineConstraintsModal: React.FC<RefineConstraintsModalProps> = ({
  party,
  items,
  isOpen,
  onClose,
  onApplyConstraints,
  isLoading,
}) => {
  const [guestCount, setGuestCount] = useState(party.guestCount);
  const [budget, setBudget] = useState(party.budget);
  const [durationHours, setDurationHours] = useState(party.durationHours);
  const [vibe, setVibe] = useState(party.vibe);
  const [specialRequests, setSpecialRequests] = useState(party.specialRequests || '');
  const [rebalanceStrategy, setRebalanceStrategy] = useState<'scale_quantities' | 'full_regenerate'>('scale_quantities');

  if (!isOpen) return null;

  // Real-time calculation preview
  const originalTotal = items.reduce((s, it) => s + (it.estimatedTotalCost || 0), 0);
  const ratio = guestCount / Math.max(1, party.guestCount);
  const projectedEstimatedCost = Math.round(originalTotal * (0.4 + 0.6 * ratio));

  const formulas = calculatePartyFormulas(
    guestCount,
    Math.round(guestCount * (party.adultCount / Math.max(1, party.guestCount))),
    Math.round(guestCount * (party.kidCount / Math.max(1, party.guestCount))),
    durationHours,
    party.timeOfDay
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAdults = Math.round(guestCount * (party.adultCount / Math.max(1, party.guestCount)));
    const updatedKids = guestCount - updatedAdults;

    const updatedParty: PartyProfile = {
      ...party,
      guestCount,
      adultCount: updatedAdults,
      kidCount: updatedKids,
      budget,
      durationHours,
      vibe,
      specialRequests,
    };

    onApplyConstraints(updatedParty, rebalanceStrategy);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">Refine Constraints</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full">
                  CUJ Task 3
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Quickly scale headcounts, budget limits, or host requirements without starting over
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Guest Count Slider & Quick Adjusters */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Guest Count</span>
              </label>
              <span className="text-sm font-extrabold text-stone-900">{guestCount} Guests</span>
            </div>
            <input
              type="range"
              min="2"
              max="100"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex items-center justify-between gap-1.5 mt-2">
              {[-10, -5, +5, +10].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => setGuestCount((prev) => Math.max(2, Math.min(150, prev + delta)))}
                  className="px-2.5 py-1 bg-white border border-stone-200 rounded-md text-[11px] font-medium text-stone-700 hover:bg-stone-100"
                >
                  {delta > 0 ? `+${delta}` : delta} Guests
                </button>
              ))}
            </div>
          </div>

          {/* Budget Limit Slider */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-stone-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Target Shopping Budget</span>
              </label>
              <span className="text-sm font-extrabold text-stone-900">{formatCurrency(budget)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="3000"
              step="25"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex items-center justify-between gap-1.5 mt-2">
              {[-100, -50, +50, +100].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => setBudget((prev) => Math.max(50, prev + delta))}
                  className="px-2.5 py-1 bg-white border border-stone-200 rounded-md text-[11px] font-medium text-stone-700 hover:bg-stone-100"
                >
                  {delta > 0 ? `+$${delta}` : `-$${Math.abs(delta)}`}
                </button>
              ))}
            </div>
          </div>

          {/* Vibe & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Shopping Vibe</label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
              >
                <option value="budget-saver">Budget-Saver (Max Cymbal Choice)</option>
                <option value="balanced">Balanced Value</option>
                <option value="elevated-luxe">Elevated Luxe</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Event Duration</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-bold"
                />
                <span className="text-stone-500">hours</span>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Updated Host Special Requests
            </label>
            <textarea
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Add extra ice buckets, prioritize ready-to-eat platters..."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg"
            />
          </div>

          {/* Live Impact Preview */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-stone-700 space-y-1.5">
            <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Projected Impact on Supplies & Budget:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="bg-white p-1.5 rounded-lg border border-amber-200">
                <div className="text-stone-500">Drinks Needed</div>
                <div className="font-bold text-stone-800">{formulas.drinksTotal} total</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-amber-200">
                <div className="text-stone-500">Ice Required</div>
                <div className="font-bold text-stone-800">{formulas.iceLbs} lbs</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-amber-200">
                <div className="text-stone-500">Tableware</div>
                <div className="font-bold text-stone-800">{formulas.platesEstimate} plates</div>
              </div>
            </div>
          </div>

          {/* Rebalance Method */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Adjustment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRebalanceStrategy('scale_quantities')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  rebalanceStrategy === 'scale_quantities'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="font-semibold text-xs">⚡ Proportional Rescale</div>
                <div className="text-[10px] font-normal text-stone-500">
                  Instantly scales current quantities to match new guest count & budget
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRebalanceStrategy('full_regenerate')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  rebalanceStrategy === 'full_regenerate'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="font-semibold text-xs">🤖 Full AI Re-curation</div>
                <div className="text-[10px] font-normal text-stone-500">
                  Calls CymbalMart AI to regenerate complete shopping catalog
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Rebalance List</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
