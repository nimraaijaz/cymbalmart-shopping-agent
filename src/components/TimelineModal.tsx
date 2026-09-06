import React from 'react';
import { Clock, Calendar, CheckCircle2, ShoppingCart, AlertCircle } from 'lucide-react';
import { ShoppingItem } from '../types';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  timelineGuide?: {
    oneWeekBefore: string[];
    twoDaysBefore: string[];
    dayOf: string[];
  };
  items: ShoppingItem[];
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  timelineGuide,
  items,
}) => {
  if (!isOpen) return null;

  const weekItems = items.filter((i) => i.timeline === '1-week-before');
  const daysBeforeItems = items.filter((i) => i.timeline === '2-3-days-before');
  const dayOfItems = items.filter((i) => i.timeline === 'day-of');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Shopping Run Schedule & Timeline</h2>
              <p className="text-xs text-stone-500">Stagger your shopping runs to keep foods fresh and avoid party-day stress</p>
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

        <div className="space-y-6 mt-5 text-xs">
          {/* 1 Week Before */}
          <div className="border-l-2 border-stone-300 pl-4 relative">
            <div className="w-3 h-3 rounded-full bg-stone-400 absolute -left-[7px] top-0.5 border-2 border-white"></div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-stone-900 text-sm">Phase 1: 7–10 Days Before Event</span>
              <span className="text-[11px] font-semibold text-stone-500">{weekItems.length} items to order</span>
            </div>
            <p className="text-stone-600 mb-2">
              Focus on online deliveries, party tableware, lighting, decorations, and non-perishables.
            </p>

            {/* Checklist guide points */}
            {timelineGuide?.oneWeekBefore && (
              <ul className="space-y-1 mb-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200/80">
                {timelineGuide.oneWeekBefore.map((point, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-stone-700">
                    <CheckCircle2 className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-1.5 mt-1">
              {weekItems.map((item) => (
                <span
                  key={item.id}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                    item.isPurchased
                      ? 'bg-stone-100 text-stone-400 line-through'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  {item.name} ({item.quantity} {item.unit})
                </span>
              ))}
            </div>
          </div>

          {/* 2-3 Days Before */}
          <div className="border-l-2 border-amber-400 pl-4 relative">
            <div className="w-3 h-3 rounded-full bg-amber-500 absolute -left-[7px] top-0.5 border-2 border-white"></div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-stone-900 text-sm">Phase 2: 2–3 Days Before Event</span>
              <span className="text-[11px] font-semibold text-amber-700">{daysBeforeItems.length} items to shop</span>
            </div>
            <p className="text-stone-600 mb-2">
              Main supermarket and wholesale run: Pantry staples, marinades, chips, canned mixers, paper towels.
            </p>

            {timelineGuide?.twoDaysBefore && (
              <ul className="space-y-1 mb-2 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                {timelineGuide.twoDaysBefore.map((point, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-stone-700">
                    <CheckCircle2 className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-1.5 mt-1">
              {daysBeforeItems.map((item) => (
                <span
                  key={item.id}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                    item.isPurchased
                      ? 'bg-stone-100 text-stone-400 line-through'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  {item.name} ({item.quantity} {item.unit})
                </span>
              ))}
            </div>
          </div>

          {/* Day of Event */}
          <div className="border-l-2 border-rose-400 pl-4 relative">
            <div className="w-3 h-3 rounded-full bg-rose-500 absolute -left-[7px] top-0.5 border-2 border-white"></div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-stone-900 text-sm">Phase 3: Day-Of Event (Fresh & Cold Run)</span>
              <span className="text-[11px] font-semibold text-rose-700">{dayOfItems.length} time-sensitive items</span>
            </div>
            <p className="text-stone-600 mb-2">
              Time-sensitive purchases: Fresh bakery cake, floral arrangements, hot deli platters, and bagged ice.
            </p>

            {timelineGuide?.dayOf && (
              <ul className="space-y-1 mb-2 bg-rose-50/50 p-2.5 rounded-lg border border-rose-200/60">
                {timelineGuide.dayOf.map((point, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-stone-700">
                    <CheckCircle2 className="w-3 h-3 text-rose-500 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-1.5 mt-1">
              {dayOfItems.map((item) => (
                <span
                  key={item.id}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                    item.isPurchased
                      ? 'bg-stone-100 text-stone-400 line-through'
                      : 'bg-rose-50/70 text-rose-800 border-rose-200'
                  }`}
                >
                  {item.name} ({item.quantity} {item.unit})
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-stone-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800"
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
