import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  DollarSign, 
  Clock, 
  Calendar, 
  Home, 
  Utensils, 
  ShieldAlert, 
  Layers, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { PartyProfile } from '../types';

interface PartySetupModalProps {
  initialParty: PartyProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedParty: PartyProfile) => void;
  isLoading: boolean;
}

const COMMON_PARTY_TYPES = [
  'Backyard Barbecue',
  'Kids Birthday Party',
  'Taco Fiesta & Game Night',
  'Cocktail & Mocktail Mixer',
  'Game Day Tailgate',
  'Dinner Party & Soirée',
  'Bridal / Baby Shower High Tea',
  'Holiday Celebration',
];

const SPECIAL_REQUEST_SUGGESTIONS = [
  'Low mess & fast 10-minute cleanup',
  'Kid-friendly finger food',
  'Slow cooker / crockpot ready',
  'Alcohol-free mocktails & seltzers',
  'Extra ice for drink cooling tubs',
  'Pre-cut deli platters (no cook)',
  'Heavy duty leak-proof tableware',
  'Outdoor insect & sun essentials',
];

const COMMON_DIETARY_OPTIONS = [
  'Gluten-Free',
  'Vegetarian',
  'Vegan',
  'Nut-Free (Strict)',
  'Dairy-Free',
  'Halal Friendly',
  'Kosher Friendly',
  'Low Sugar / Diabetic',
  'Kid-Approved Picky Eater Friendly',
];

export const PartySetupModal: React.FC<PartySetupModalProps> = ({
  initialParty,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<PartyProfile>({
    ...initialParty,
    partyType: initialParty.partyType || 'Backyard Barbecue',
    specialRequests: initialParty.specialRequests || '',
  });
  const [customDietaryInput, setCustomDietaryInput] = useState('');
  const [customPartyTypeInput, setCustomPartyTypeInput] = useState('');

  if (!isOpen) return null;

  const handleGuestChange = (total: number, kids: number) => {
    const validTotal = Math.max(1, total);
    const validKids = Math.max(0, Math.min(kids, validTotal));
    const adults = validTotal - validKids;
    setFormData((prev) => ({
      ...prev,
      guestCount: validTotal,
      kidCount: validKids,
      adultCount: adults,
    }));
  };

  const toggleDietary = (item: string) => {
    setFormData((prev) => {
      const exists = prev.dietaryRestrictions.includes(item);
      return {
        ...prev,
        dietaryRestrictions: exists
          ? prev.dietaryRestrictions.filter((d) => d !== item)
          : [...prev.dietaryRestrictions, item],
      };
    });
  };

  const toggleSpecialRequest = (chip: string) => {
    setFormData((prev) => {
      const current = prev.specialRequests || '';
      if (current.includes(chip)) {
        const updated = current.replace(chip, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim();
        return { ...prev, specialRequests: updated };
      } else {
        const updated = current ? `${current}, ${chip}` : chip;
        return { ...prev, specialRequests: updated };
      }
    });
  };

  const handleAddCustomDietary = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!customDietaryInput.trim()) return;
    if (!formData.dietaryRestrictions.includes(customDietaryInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions, customDietaryInput.trim()],
      }));
    }
    setCustomDietaryInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">Define Event Specifications</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  CUJ Task 1
                </span>
              </div>
              <p className="text-xs text-stone-500">Party type, theme, budget, guest count, and special host requests</p>
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          {/* Party Type Select / Chips */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Party Type *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_PARTY_TYPES.map((type) => {
                const selected = formData.partyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, partyType: type })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      selected
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Or enter custom party type..."
              value={formData.partyType || ''}
              onChange={(e) => setFormData({ ...formData, partyType: e.target.value })}
              className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          {/* Party Title & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Leo's 5th Birthday, Saturday BBQ & Cornhole"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Theme / Occasion *</label>
              <input
                type="text"
                required
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                placeholder="e.g. Galaxy Astronaut, Rustic Smokehouse, Neon Glow"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Guest Breakdown & Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Total Guests *</label>
              <input
                type="number"
                min="1"
                max="200"
                value={formData.guestCount}
                onChange={(e) => handleGuestChange(Number(e.target.value), formData.kidCount)}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg bg-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Adults</label>
              <div className="px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-100 font-bold text-stone-700">
                {formData.adultCount}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Kids & Teens</label>
              <input
                type="number"
                min="0"
                max={formData.guestCount}
                value={formData.kidCount}
                onChange={(e) => handleGuestChange(formData.guestCount, Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg bg-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Duration (Hours)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.durationHours}
                onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-lg bg-white font-bold"
              />
            </div>
          </div>

          {/* Budget & Vibe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Budget ($) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-semibold">$</span>
                <input
                  type="number"
                  min="20"
                  max="10000"
                  step="10"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  className="w-full pl-7 pr-3 py-2 border border-stone-300 rounded-lg font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div className="text-[10px] text-stone-500 mt-1">
                ~${Math.round(formData.budget / Math.max(1, formData.guestCount))}/guest target
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Shopping Vibe</label>
              <select
                value={formData.vibe}
                onChange={(e) => setFormData({ ...formData, vibe: e.target.value as any })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="budget-saver">Budget-Saver (Cymbal Choice Value Hacks)</option>
                <option value="balanced">Balanced (Crowd-Pleasing & Great Value)</option>
                <option value="elevated-luxe">Elevated Luxe (Bakery Specials & Premium Decor)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Time of Day</label>
              <select
                value={formData.timeOfDay}
                onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value as any })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="morning">Morning (Brunch & Pastries)</option>
                <option value="afternoon">Afternoon (BBQ, Snacks & Games)</option>
                <option value="evening">Evening (Dinner, Drinks & Social)</option>
                <option value="night">Night (Cocktails & Music)</option>
              </select>
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Venue Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'indoor-home', label: 'Indoor Home / Apt' },
                { id: 'backyard', label: 'Backyard / Patio' },
                { id: 'park-outdoor', label: 'Park / Pavilion' },
                { id: 'rented-venue', label: 'Rented Hall / Venue' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, venue: v.id as any })}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    formData.venue === v.id
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Dietary Restrictions & Allergies
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_DIETARY_OPTIONS.map((opt) => {
                const selected = formData.dietaryRestrictions.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleDietary(opt)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      selected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 inline mr-1" />}
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Custom dietary add */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add other dietary requirement (e.g. 2 Shellfish Allergies)..."
                value={customDietaryInput}
                onChange={(e) => setCustomDietaryInput(e.target.value)}
                onKeyDown={handleAddCustomDietary}
                className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomDietary}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold border border-stone-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-stone-700">Special Host Requests</label>
              <span className="text-[10px] text-stone-400">Click chips to add quickly</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SPECIAL_REQUEST_SUGGESTIONS.map((chip) => {
                const isIncluded = (formData.specialRequests || '').includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleSpecialRequest(chip)}
                    className={`px-2 py-0.5 rounded-full text-[10.5px] transition-all border ${
                      isIncluded
                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-medium'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {isIncluded ? '✓ ' : '+ '}{chip}
                  </button>
                );
              })}
            </div>
            <textarea
              rows={2}
              value={formData.specialRequests || formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value, notes: e.target.value })}
              placeholder="e.g. Need low mess finger foods, keep grilling simple for host, provide kid juice boxes and plenty of ice..."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <span className="text-[11px] text-stone-500">
              CymbalMart AI aligns portions and aisles automatically
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Agent Curating Shopping List...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Curate Shopping List</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
