/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BudgetSummaryBar } from './components/BudgetSummaryBar';
import { ShoppingListView } from './components/ShoppingListView';
import { AgentChatPanel } from './components/AgentChatPanel';
import { PartySetupModal } from './components/PartySetupModal';
import { TimelineModal } from './components/TimelineModal';
import { ExportModal } from './components/ExportModal';
import { CUJStepGuide } from './components/CUJStepGuide';
import { RefineConstraintsModal } from './components/RefineConstraintsModal';
import { CheckoutModal } from './components/CheckoutModal';
import { PartySummaryCard } from './components/PartySummaryCard';
import { SmartBudgetOptimizer, CheaperAlternativeSuggestion } from './components/SmartBudgetOptimizer';
import { VoiceControl } from './components/VoiceControl';
import { PartyProfile, ShoppingItem, AgentTip, PartyPlanResponse, CUJStep } from './types';
import { PARTY_PRESETS } from './data/presets';
import { Loader2, Sparkles, RefreshCw, AlertCircle, Mic } from 'lucide-react';

const STORAGE_PARTY_KEY = 'party_planner_profile_v1';
const STORAGE_ITEMS_KEY = 'party_planner_items_v1';

export default function App() {
  // Initial default party
  const defaultParty: PartyProfile = {
    id: 'party-1',
    ...PARTY_PRESETS[0],
    createdAt: new Date().toISOString(),
  };

  const [party, setParty] = useState<PartyProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PARTY_KEY);
      return saved ? JSON.parse(saved) : defaultParty;
    } catch {
      return defaultParty;
    }
  });

  const [items, setItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ITEMS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tips, setTips] = useState<AgentTip[]>([]);
  const [timelineGuide, setTimelineGuide] = useState<PartyPlanResponse['timelineGuide']>({
    oneWeekBefore: [],
    twoDaysBefore: [],
    dayOf: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // CUJ Step Workflow State
  const [currentStep, setCurrentStep] = useState<CUJStep>('review');

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Persist party & items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PARTY_KEY, JSON.stringify(party));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [party]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [items]);

  // Request initial plan if items list is empty
  useEffect(() => {
    if (items.length === 0) {
      generatePlanForParty(party);
    }
  }, []);

  const generatePlanForParty = async (targetParty: PartyProfile) => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const res = await fetch('/api/plan-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetParty),
      });

      if (!res.ok) throw new Error('Failed to generate plan');

      const data: PartyPlanResponse = await res.json();
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
      }
      if (data.tips) setTips(data.tips);
      if (data.timelineGuide) setTimelineGuide(data.timelineGuide);
    } catch (err: any) {
      console.error(err);
      setErrorNotice('Shopping Agent encountered a hiccup generating live items. Displaying backup plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePartyBrief = async (updatedParty: PartyProfile) => {
    setParty(updatedParty);
    setIsSetupOpen(false);
    setCurrentStep('review');
    await generatePlanForParty(updatedParty);
  };

  const handleSelectPreset = async (preset: typeof PARTY_PRESETS[0]) => {
    const newParty: PartyProfile = {
      id: `party-${Date.now()}`,
      ...preset,
      createdAt: new Date().toISOString(),
    };
    setParty(newParty);
    setCurrentStep('review');
    await generatePlanForParty(newParty);
  };

  const handleTogglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isPurchased: !it.isPurchased } : it))
    );
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const qty = Math.max(1, newQuantity);
          return {
            ...it,
            quantity: qty,
            estimatedTotalCost: Math.round(qty * it.estimatedUnitCost * 100) / 100,
          };
        }
        return it;
      })
    );
  };

  const handleUpdateItem = (id: string, updatedFields: Partial<ShoppingItem>) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const merged = { ...it, ...updatedFields };
          const qty = merged.quantity !== undefined ? Math.max(1, merged.quantity) : it.quantity;
          const unitCost = merged.estimatedUnitCost !== undefined ? Math.max(0, merged.estimatedUnitCost) : it.estimatedUnitCost;
          const totalCost = Math.round(qty * unitCost * 100) / 100;
          return {
            ...merged,
            quantity: qty,
            estimatedUnitCost: unitCost,
            estimatedTotalCost: totalCost,
          };
        }
        return it;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleAddItem = (newItem: Omit<ShoppingItem, 'id' | 'isPurchased'>) => {
    const itemWithId: ShoppingItem = {
      ...newItem,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isPurchased: false,
    };
    setItems((prev) => [itemWithId, ...prev]);
  };

  const handleRemoveItemsByNames = (names: string[]) => {
    if (!names || names.length === 0) return;
    const lowerNames = names.map((n) => n.toLowerCase());
    setItems((prev) =>
      prev.filter(
        (it) => !lowerNames.some((target) => it.name.toLowerCase().includes(target))
      )
    );
  };

  const handleUpdateItemCost = (id: string, newUnitCost: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const cost = Math.max(0, newUnitCost);
          return {
            ...it,
            estimatedUnitCost: cost,
            estimatedTotalCost: Math.round(it.quantity * cost * 100) / 100,
          };
        }
        return it;
      })
    );
  };

  // Toggle an individual item between National brand and Cymbal Choice store brand
  const handleToggleCymbalChoice = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id || !item.cymbalChoiceOption) return item;
        const nowCymbalChoice = !item.isCymbalChoice;
        const basePrice = item.cymbalChoiceOption.unitCost ?? (item.cymbalChoiceOption as any).unitPrice ?? 0;
        const newUnitCost = nowCymbalChoice
          ? basePrice
          : basePrice + item.cymbalChoiceOption.savingsPerUnit;
        return {
          ...item,
          isCymbalChoice: nowCymbalChoice,
          estimatedUnitCost: newUnitCost,
          estimatedTotalCost: Math.round(item.quantity * newUnitCost * 100) / 100,
        };
      })
    );
  };

  // One-click swap all eligible items to Cymbal Choice store brand
  const handleSwapAllToCymbalChoice = () => {
    setItems((prev) =>
      prev.map((item) => {
        if (!item.cymbalChoiceOption || item.isCymbalChoice) return item;
        const basePrice = item.cymbalChoiceOption.unitCost ?? (item.cymbalChoiceOption as any).unitPrice ?? 0;
        return {
          ...item,
          isCymbalChoice: true,
          estimatedUnitCost: basePrice,
          estimatedTotalCost: Math.round(item.quantity * basePrice * 100) / 100,
        };
      })
    );
  };

  // Apply single alternative from Smart Budget Optimizer
  const handleApplySingleAlternative = (suggestion: CheaperAlternativeSuggestion) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === suggestion.targetItemId) {
          return {
            ...it,
            name: suggestion.suggestedName,
            quantity: suggestion.quantity,
            unit: suggestion.unit,
            estimatedUnitCost: suggestion.suggestedUnitCost,
            estimatedTotalCost: suggestion.suggestedTotalCost,
            isCymbalChoice: suggestion.categoryType === 'store_brand' ? true : it.isCymbalChoice,
          };
        }
        return it;
      })
    );
  };

  // Apply all recommended alternatives
  const handleApplyAllAlternatives = (suggestions: CheaperAlternativeSuggestion[]) => {
    setItems((prev) => {
      const map = new Map<string, CheaperAlternativeSuggestion>();
      suggestions.forEach((s) => map.set(s.targetItemId, s));
      return prev.map((it) => {
        const found = map.get(it.id);
        if (found) {
          return {
            ...it,
            name: found.suggestedName,
            quantity: found.quantity,
            unit: found.unit,
            estimatedUnitCost: found.suggestedUnitCost,
            estimatedTotalCost: found.suggestedTotalCost,
            isCymbalChoice: found.categoryType === 'store_brand' ? true : it.isCymbalChoice,
          };
        }
        return it;
      });
    });
  };

  // Quick updates from PartySummaryCard
  const handleUpdateBudgetQuickly = (newBudget: number) => {
    setParty((prev) => ({ ...prev, budget: newBudget }));
  };

  const handleUpdateGuestsQuickly = (newGuests: number) => {
    setParty((prev) => {
      const ratioAdults = prev.adultCount / Math.max(1, prev.guestCount);
      const newAdults = Math.round(newGuests * ratioAdults);
      const newKids = Math.max(0, newGuests - newAdults);
      return {
        ...prev,
        guestCount: newGuests,
        adultCount: newAdults,
        kidCount: newKids,
      };
    });
  };

  // Auto-align list to budget: swap to Cymbal Choice, trim non-essentials if still over budget
  const handleAutoAlignBudget = () => {
    const budget = party.budget || 1;
    let updated = items.map((item) => {
      if (item.cymbalChoiceOption && !item.isCymbalChoice) {
        const basePrice = item.cymbalChoiceOption.unitCost ?? (item.cymbalChoiceOption as any).unitPrice ?? 0;
        return {
          ...item,
          isCymbalChoice: true,
          estimatedUnitCost: basePrice,
          estimatedTotalCost: Math.round(item.quantity * basePrice * 100) / 100,
        };
      }
      return item;
    });

    let total = updated.reduce((sum, it) => sum + it.estimatedTotalCost, 0);

    if (total > budget) {
      // Scale down non-essential items proportionally
      updated = updated.map((it) => {
        if (!it.isEssential && it.quantity > 1) {
          const scaledQty = Math.max(1, Math.floor(it.quantity * 0.75));
          return {
            ...it,
            quantity: scaledQty,
            estimatedTotalCost: Math.round(scaledQty * it.estimatedUnitCost * 100) / 100,
          };
        }
        return it;
      });
    }

    setItems(updated);
    setCurrentStep('review');
  };

  // Handle refinement modal changes (CUJ Task 3)
  const handleApplyConstraints = async (
    updatedParty: PartyProfile,
    rebalanceStrategy: 'scale_quantities' | 'full_regenerate'
  ) => {
    setParty(updatedParty);
    setIsRefineModalOpen(false);

    if (rebalanceStrategy === 'full_regenerate') {
      await generatePlanForParty(updatedParty);
    } else {
      // Scale quantities based on guest count delta
      const guestRatio = updatedParty.guestCount / Math.max(1, party.guestCount);
      setItems((prev) =>
        prev.map((it) => {
          if (it.category === 'food' || it.category === 'drinks' || it.category === 'tableware') {
            const newQty = Math.max(1, Math.round(it.quantity * guestRatio));
            return {
              ...it,
              quantity: newQty,
              estimatedTotalCost: Math.round(newQty * it.estimatedUnitCost),
            };
          }
          return it;
        })
      );
    }
  };

  // Quick optimizations triggered from BudgetSummaryBar
  const handleTriggerQuickAction = async (
    actionType: 'budget_cut' | 'allergy_safe' | 'upgrade_atmosphere'
  ) => {
    setIsOptimizing(true);
    setErrorNotice(null);
    try {
      const res = await fetch('/api/quick-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          partyProfile: party,
          currentItems: items,
        }),
      });

      if (!res.ok) throw new Error('Optimization failed');

      const data = await res.json();

      let updatedList = [...items];

      // Remove items if requested
      if (data.itemNamesToRemove && Array.isArray(data.itemNamesToRemove)) {
        const toRemove = data.itemNamesToRemove.map((n: string) => n.toLowerCase());
        updatedList = updatedList.filter(
          (it) => !toRemove.some((target: string) => it.name.toLowerCase().includes(target))
        );
      }

      // Add new items if requested
      if (data.itemsToAdd && Array.isArray(data.itemsToAdd)) {
        const newFormatted = data.itemsToAdd.map((it: any, idx: number) => ({
          ...it,
          id: `opt-item-${Date.now()}-${idx}`,
          isPurchased: false,
          estimatedTotalCost: it.estimatedTotalCost || Math.round((it.quantity || 1) * (it.estimatedUnitCost || 5)),
        }));
        updatedList = [...newFormatted, ...updatedList];
      }

      // If updating costs or quantities
      if (data.itemsToUpdate && Array.isArray(data.itemsToUpdate)) {
        data.itemsToUpdate.forEach((up: any) => {
          const idx = updatedList.findIndex(
            (it) => it.name.toLowerCase() === (up.name || '').toLowerCase()
          );
          if (idx !== -1) {
            updatedList[idx] = {
              ...updatedList[idx],
              quantity: up.quantity || updatedList[idx].quantity,
              estimatedUnitCost: up.estimatedUnitCost || updatedList[idx].estimatedUnitCost,
              estimatedTotalCost:
                up.estimatedTotalCost ||
                Math.round(
                  (up.quantity || updatedList[idx].quantity) *
                    (up.estimatedUnitCost || updatedList[idx].estimatedUnitCost)
                ),
            };
          }
        });
      }

      setItems(updatedList);
    } catch (err) {
      console.error(err);
      // Local heuristic fallback for quick optimizations
      if (actionType === 'budget_cut') {
        // Downsize quantities of high cost items by 20%
        setItems((prev) =>
          prev.map((it) => {
            if (it.estimatedTotalCost > 20 && !it.isEssential) {
              const newQty = Math.max(1, Math.round(it.quantity * 0.8));
              return {
                ...it,
                quantity: newQty,
                estimatedTotalCost: Math.round(newQty * it.estimatedUnitCost),
              };
            }
            return it;
          })
        );
      } else if (actionType === 'allergy_safe') {
        // Add a dedicated gluten-free & vegan platter
        handleAddItem({
          name: 'Gluten-Free & Vegan Snack Crudité Platter',
          category: 'food',
          quantity: 2,
          unit: 'platters',
          packageDescription: 'Fresh hummus, gluten-free crackers, rainbow vegetables',
          estimatedUnitCost: 12,
          estimatedTotalCost: 24,
          storeSuggestion: 'supermarket',
          timeline: '2-3-days-before',
          dietaryTag: 'Gluten-Free & Vegan',
          isEssential: true,
        });
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col">
      {/* App Header */}
      <Header
        party={party}
        onOpenSetup={() => {
          setCurrentStep('define');
          setIsSetupOpen(true);
        }}
        onOpenTimeline={() => setIsTimelineOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenRefine={() => {
          setCurrentStep('refine_checkout');
          setIsRefineModalOpen(true);
        }}
        onOpenCheckout={() => {
          setCurrentStep('refine_checkout');
          setIsCheckoutModalOpen(true);
        }}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
        onSelectPreset={handleSelectPreset}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {errorNotice && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* 1. Clear Party Summary Card (Guests, Theme, Budget, Est. Cost, Remaining Budget) */}
        <PartySummaryCard
          party={party}
          items={items}
          onOpenSetup={() => {
            setCurrentStep('define');
            setIsSetupOpen(true);
          }}
          onOpenRefine={() => {
            setCurrentStep('refine_checkout');
            setIsRefineModalOpen(true);
          }}
          onOpenOptimizer={() => setIsOptimizerOpen(true)}
          onOpenVoice={() => setIsVoiceOpen(true)}
          onUpdateBudgetQuickly={handleUpdateBudgetQuickly}
          onUpdateGuestsQuickly={handleUpdateGuestsQuickly}
        />

        {/* Guided CUJ 3-Step Workflow Tracker */}
        <CUJStepGuide
          currentStep={currentStep}
          onSetStep={setCurrentStep}
          party={party}
          items={items}
          onOpenSetup={() => {
            setCurrentStep('define');
            setIsSetupOpen(true);
          }}
          onOpenRefine={() => {
            setCurrentStep('refine_checkout');
            setIsRefineModalOpen(true);
          }}
          onOpenCheckout={() => {
            setCurrentStep('refine_checkout');
            setIsCheckoutModalOpen(true);
          }}
          onAutoAlignBudget={handleAutoAlignBudget}
        />

        {/* Budget Progress & Catering Formulas (CUJ Task 2) */}
        <BudgetSummaryBar
          party={party}
          items={items}
          onTriggerQuickAction={handleTriggerQuickAction}
          isOptimizing={isOptimizing}
          onSwapAllToCymbalChoice={handleSwapAllToCymbalChoice}
          onAutoAlignBudget={handleAutoAlignBudget}
          onOpenOptimizer={() => setIsOptimizerOpen(true)}
        />

        {/* Loading Overlay if generating fresh party plan */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Shopping Agent is calculating supplies for {party.title}...
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md">
              Balancing guest counts ({party.guestCount} guests), food ounces, drink formulas, party ice, and store groupings.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Optimizing package sizes & costs...</span>
            </div>
          </div>
        ) : (
          /* Two Column Layout: Shopping List (7 cols) + AI Agent Chat (5 cols) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 cols: Categorized Shopping List with direct quantity edit & item edit modal */}
            <div className="lg:col-span-7">
              <ShoppingListView
                items={items}
                onTogglePurchased={handleTogglePurchased}
                onUpdateQuantity={handleUpdateQuantity}
                onDeleteItem={handleDeleteItem}
                onAddItem={handleAddItem}
                onUpdateItemCost={handleUpdateItemCost}
                onToggleCymbalChoice={handleToggleCymbalChoice}
                onUpdateItem={handleUpdateItem}
                onOpenOptimizer={() => setIsOptimizerOpen(true)}
              />
            </div>

            {/* Right 5 cols: AI Shopping Agent Live Consult */}
            <div className="lg:col-span-5 sticky top-20">
              <AgentChatPanel
                party={party}
                items={items}
                tips={tips}
                onAddItem={handleAddItem}
                onRemoveItemsByNames={handleRemoveItemsByNames}
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating Hands-Free Voice Control Trigger */}
      <button
        id="floating-voice-control-btn"
        type="button"
        onClick={() => setIsVoiceOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-full shadow-2xl border border-stone-700 transition-all hover:scale-105 active:scale-95 group focus:outline-hidden"
        title="Hands-free voice assistant"
      >
        <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center animate-pulse">
          <Mic className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold tracking-wide">Voice Assistant</span>
      </button>

      {/* Smart Budget Optimizer Modal */}
      <SmartBudgetOptimizer
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        party={party}
        items={items}
        onApplySingleAlternative={handleApplySingleAlternative}
        onApplyAllAlternatives={handleApplyAllAlternatives}
        onAutoAlignBudget={handleAutoAlignBudget}
      />

      {/* Hands-Free Voice Control Modal */}
      <VoiceControl
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        party={party}
        items={items}
        onUpdateQuantity={handleUpdateQuantity}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
        onTogglePurchased={handleTogglePurchased}
        onUpdateBudget={handleUpdateBudgetQuickly}
        onUpdateGuests={handleUpdateGuestsQuickly}
        onUpdateTheme={(theme) => setParty((prev) => ({ ...prev, theme }))}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
        onSwapAllToCymbalChoice={handleSwapAllToCymbalChoice}
        onAutoAlignBudget={handleAutoAlignBudget}
        onOpenCheckout={() => setIsCheckoutModalOpen(true)}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenRefine={() => setIsRefineModalOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Modals */}
      <PartySetupModal
        initialParty={party}
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onSubmit={handleUpdatePartyBrief}
        isLoading={isLoading}
      />

      {/* Refine Constraints Modal (CUJ Task 3) */}
      <RefineConstraintsModal
        party={party}
        items={items}
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        onApplyConstraints={handleApplyConstraints}
        isLoading={isLoading}
      />

      {/* Checkout Order Modal (CUJ Task 3) */}
      <CheckoutModal
        party={party}
        items={items}
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />

      <TimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        timelineGuide={timelineGuide}
        items={items}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        party={party}
        items={items}
      />
    </div>
  );
}
