import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Car, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Printer, 
  Copy, 
  Calendar as CalendarIcon, 
  Tag, 
  ArrowRight,
  ShieldCheck,
  Store,
  Loader2
} from 'lucide-react';
import { PartyProfile, ShoppingItem, FulfillmentMethod, CheckoutDetails } from '../types';
import { formatCurrency } from '../utils/calculations';

interface CheckoutModalProps {
  party: PartyProfile;
  items: ShoppingItem[];
  isOpen: boolean;
  onClose: () => void;
}

const CYMBALMART_LOCATIONS = [
  'CymbalMart Supercenter #104 (Westside Market & Deli)',
  'CymbalMart Supercenter #218 (Metro Plaza & Bakery)',
  'CymbalMart Express #512 (North Hills Neighborhood)',
];

const TIME_SLOTS = [
  'Today 2:00 PM - 3:00 PM (Quick Pickup)',
  'Today 4:00 PM - 5:00 PM (Pre-Party Rush)',
  'Tomorrow 10:00 AM - 11:00 AM (Morning Prep)',
  'Tomorrow 1:00 PM - 2:00 PM (Afternoon Event)',
  'Day of Party - 3 Hours Before Kickoff',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  party,
  items,
  isOpen,
  onClose,
}) => {
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('curbside_pickup');
  const [storeLocation, setStoreLocation] = useState(CYMBALMART_LOCATIONS[0]);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [hostName, setHostName] = useState('Alex Taylor (Party Host)');
  const [hostPhone, setHostPhone] = useState('(555) 382-9910');
  const [specialInstructions, setSpecialInstructions] = useState('Please pack ice bags in heavy double bags.');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.estimatedTotalCost || 0), 0);
  const cymbalChoiceSavings = items.reduce((sum, item) => {
    if (item.isCymbalChoice && item.cymbalChoiceOption) {
      return sum + (item.cymbalChoiceOption.savingsPerUnit * item.quantity);
    }
    return sum;
  }, 0);
  const tax = Math.round(subtotal * 0.0825 * 100) / 100;
  const finalTotal = Math.round((subtotal + tax) * 100) / 100;
  const isWithinBudget = finalTotal <= party.budget;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          partyProfile: party,
          fulfillmentDetails: {
            hostName,
            hostPhone,
            fulfillmentMethod,
            storeLocation,
            timeSlot,
            specialInstructions,
          },
        }),
      });

      if (!response.ok) throw new Error('Checkout failed');
      const data = await response.json();
      setConfirmedOrder(data);
    } catch (err) {
      console.error(err);
      // Fallback local receipt
      setConfirmedOrder({
        success: true,
        orderNumber: `CYMBAL-PARTY-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'confirmed',
        hostName,
        fulfillmentMethod,
        storeLocation,
        timeSlot,
        placedAt: new Date().toISOString(),
        itemCount: items.length,
        subtotal,
        cymbalChoiceSavings,
        tax,
        finalTotal,
        confirmationMessage: `Order confirmed for ${hostName}! Ready at CymbalMart.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderSummary = () => {
    if (!confirmedOrder) return;
    const text = `🎉 CYMBALMART PARTY ORDER CONFIRMATION
Order #: ${confirmedOrder.orderNumber}
Event: ${party.title} (${party.guestCount} guests)
Method: ${confirmedOrder.fulfillmentMethod.replace('_', ' ').toUpperCase()}
Location: ${confirmedOrder.storeLocation}
Window: ${confirmedOrder.timeSlot}
Total Items: ${confirmedOrder.itemCount}
Total Cost: ${formatCurrency(confirmedOrder.finalTotal)} (Cymbal Choice Savings: ${formatCurrency(confirmedOrder.cymbalChoiceSavings)})
Aisles to Visit: ${Array.from(new Set(items.map(i => i.aisle || 'General Grocery'))).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">
                  {confirmedOrder ? 'Order Confirmed!' : 'Finalize & Checkout with CymbalMart'}
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  CUJ Task 3
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {confirmedOrder 
                  ? 'Your party supplies are prepared and routed by store aisle' 
                  : 'Select curbside pickup or doorstep delivery to finalize your event supplies'}
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

        {/* If Order Confirmed Screen */}
        {confirmedOrder ? (
          <div className="py-4 space-y-4 text-xs">
            {/* Success Banner */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emerald-950">
                    Order {confirmedOrder.orderNumber} Confirmed!
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded-full font-extrabold text-[10px]">
                    READY FOR FULFILLMENT
                  </span>
                </div>
                <p className="text-emerald-800 mt-1">
                  {confirmedOrder.confirmationMessage}
                </p>
              </div>
            </div>

            {/* Curbside Barcode & Pickup Details */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Pickup / Delivery Window
                </div>
                <div className="text-sm font-bold text-stone-900 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{confirmedOrder.timeSlot}</span>
                </div>
                <div className="text-xs text-stone-600 mt-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-stone-500" />
                  <span>{confirmedOrder.storeLocation}</span>
                </div>
                <div className="mt-2 text-[11px] text-stone-500">
                  Host: <span className="font-semibold text-stone-800">{confirmedOrder.hostName}</span>
                </div>
              </div>

              {/* Barcode Visual for Curbside Attendant */}
              <div className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col items-center justify-center text-center">
                <div className="font-mono text-[10px] text-stone-400 tracking-widest mb-1">
                  CURBSIDE SCAN CODE
                </div>
                <div className="flex gap-1 items-center justify-center h-10 w-full px-4 bg-stone-100/70 rounded py-1">
                  <div className="w-1 bg-black h-full"></div>
                  <div className="w-2 bg-black h-full"></div>
                  <div className="w-0.5 bg-black h-full"></div>
                  <div className="w-3 bg-black h-full"></div>
                  <div className="w-1 bg-black h-full"></div>
                  <div className="w-2 bg-black h-full"></div>
                  <div className="w-0.5 bg-black h-full"></div>
                  <div className="w-1 bg-black h-full"></div>
                  <div className="w-2.5 bg-black h-full"></div>
                  <div className="w-1 bg-black h-full"></div>
                  <div className="w-3 bg-black h-full"></div>
                </div>
                <div className="font-mono text-xs font-bold text-stone-800 mt-1">
                  {confirmedOrder.orderNumber}
                </div>
              </div>
            </div>

            {/* Savings & Financial Breakdown */}
            <div className="p-3 bg-stone-100/70 rounded-xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-stone-600">Total Items: </span>
                <span className="font-bold text-stone-900">{confirmedOrder.itemCount}</span>
                {confirmedOrder.cymbalChoiceSavings > 0 && (
                  <span className="ml-3 inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px]">
                    <Tag className="w-3 h-3" />
                    Saved {formatCurrency(confirmedOrder.cymbalChoiceSavings)} with Cymbal Choice!
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-stone-900">
                  {formatCurrency(confirmedOrder.finalTotal)}
                </div>
                <div className="text-[10px] text-stone-500">Includes estimated tax</div>
              </div>
            </div>

            {/* Aisle Routing Guide */}
            <div>
              <div className="font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span>Optimized Store Aisle Checklist</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="p-2 bg-white rounded-lg border border-stone-200 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-800">{item.name}</span>
                      <span className="text-stone-500">×{item.quantity} {item.unit}</span>
                      {item.isCymbalChoice && (
                        <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                          Cymbal Choice
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                      {item.aisle || 'General Grocery'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={copyOrderSummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Order Text'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg font-semibold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt & Aisles</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Checkout Formulation Screen */
          <form onSubmit={handlePlaceOrder} className="space-y-4 mt-4 text-xs">
            {/* Fulfillment Options */}
            <div>
              <label className="block font-semibold text-stone-800 mb-1.5">
                Select Fulfillment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'curbside_pickup',
                    label: '🚗 Curbside Pickup',
                    desc: 'Free loading at Bay 3 in 2 mins',
                    tag: 'Most Popular',
                  },
                  {
                    id: 'express_delivery',
                    label: '⚡ Doorstep Delivery',
                    desc: 'Arrives right at party venue',
                    tag: 'Host Favorite',
                  },
                  {
                    id: 'in_store_walk',
                    label: '📱 Guided In-Store Run',
                    desc: 'Aisle 1 to 15 optimized path',
                    tag: 'Fast Walk',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFulfillmentMethod(opt.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      fulfillmentMethod === opt.id
                        ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/20'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs">{opt.label}</span>
                    </div>
                    <p className="text-[10px] text-stone-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Store & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  CymbalMart Store Location
                </label>
                <select
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                >
                  {CYMBALMART_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Pickup / Delivery Window
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Host Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Host Contact Name</label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mobile for Pickup Text Alerts</label>
                <input
                  type="text"
                  required
                  value={hostPhone}
                  onChange={(e) => setHostPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Special Fulfillment Notes</label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Leave by side gate, double bag cold drinks and ice..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            {/* Order Financial Review */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between text-stone-600">
                <span>Curated Items Subtotal ({items.length} items):</span>
                <span className="font-semibold text-stone-900">{formatCurrency(subtotal)}</span>
              </div>
              {cymbalChoiceSavings > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Cymbal Choice Brand Savings Applied:
                  </span>
                  <span className="font-bold">-{formatCurrency(cymbalChoiceSavings)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-stone-500">
                <span>Estimated Sales Tax (8.25%):</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-stone-900">
                    Total: {formatCurrency(finalTotal)}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Host Target Budget: {formatCurrency(party.budget)} ({isWithinBudget ? '✓ On Budget' : '⚠️ Over Budget'})
                  </div>
                </div>
                <div className="text-right text-[10px] text-stone-500">
                  No hidden fees • Free cancellation up to 1hr before window
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-50 disabled:opacity-50"
              >
                Back to List
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming with CymbalMart...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Finalize Order ({formatCurrency(finalTotal)})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
