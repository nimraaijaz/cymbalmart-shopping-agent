import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Terminal, 
  ArrowRight,
  TrendingDown,
  ShoppingCart,
  Users,
  DollarSign
} from 'lucide-react';
import { PartyProfile, ShoppingItem } from '../types';
import { formatCurrency } from '../utils/calculations';

interface VoiceControlProps {
  isOpen: boolean;
  onClose: () => void;
  party: PartyProfile;
  items: ShoppingItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  onDeleteItem: (id: string) => void;
  onTogglePurchased: (id: string) => void;
  onUpdateBudget: (newBudget: number) => void;
  onUpdateGuests: (newGuests: number) => void;
  onUpdateTheme: (newTheme: string) => void;
  onOpenOptimizer: () => void;
  onSwapAllToCymbalChoice: () => void;
  onAutoAlignBudget: () => void;
  onOpenCheckout: () => void;
  onOpenSetup: () => void;
  onOpenRefine: () => void;
  onOpenExport: () => void;
  onSelectCategoryFilter?: (cat: string) => void;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({
  isOpen,
  onClose,
  party,
  items,
  onUpdateQuantity,
  onAddItem,
  onDeleteItem,
  onTogglePurchased,
  onUpdateBudget,
  onUpdateGuests,
  onUpdateTheme,
  onOpenOptimizer,
  onSwapAllToCymbalChoice,
  onAutoAlignBudget,
  onOpenCheckout,
  onOpenSetup,
  onOpenRefine,
  onOpenExport,
  onSelectCategoryFilter,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);

      // If sentence ended, execute command
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        handleProcessVoiceCommand(lastResult[0].transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart if modal is open and was listening
      if (isOpen && isListening) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [isOpen]);

  // Start or stop listening when modal opens/closes
  useEffect(() => {
    if (isOpen && recognitionRef.current && !isListening) {
      startListening();
    } else if (!isOpen && recognitionRef.current && isListening) {
      stopListening();
    }
  }, [isOpen]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('Listening for hands-free party commands...');
      } catch (e) {
        console.warn('Failed to start recognition', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {}
    }
  };

  // Verbal speech feedback using window.speechSynthesis
  const speakFeedback = (text: string) => {
    if (!voiceFeedbackEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  // Comprehensive Natural Language Command Parser
  const handleProcessVoiceCommand = (rawText: string) => {
    const text = rawText.trim().toLowerCase();
    if (!text) return;

    setTranscript(rawText);

    // 1. Party Summary / Budget Inquiry
    if (
      text.includes('party summary') ||
      text.includes("what's my budget") ||
      text.includes('how much') ||
      text.includes('read summary') ||
      text.includes('check budget')
    ) {
      const totalEstimated = items.reduce((sum, it) => sum + it.estimatedTotalCost, 0);
      const remaining = party.budget - totalEstimated;
      const response = `You have ${party.guestCount} guests. The theme is ${party.theme}. Your budget is ${formatCurrency(party.budget)}. Estimated cost is ${formatCurrency(totalEstimated)}. ${
        remaining >= 0 ? `You have ${formatCurrency(remaining)} remaining.` : `You are ${formatCurrency(Math.abs(remaining))} over budget.`
      }`;
      setLastAction(`📋 Party Summary: ${response}`);
      speakFeedback(response);
      return;
    }

    // 2. Budget Optimization & Alternatives
    if (
      text.includes('optimize budget') ||
      text.includes('cheaper alternatives') ||
      text.includes('suggest alternatives') ||
      text.includes('find alternatives') ||
      text.includes('fix budget')
    ) {
      onOpenOptimizer();
      setLastAction('⚡ Opened Smart Budget Optimizer with cheaper alternatives.');
      speakFeedback('Opening Smart Budget Optimizer to find cheaper alternatives.');
      return;
    }

    if (
      text.includes('swap to store brand') ||
      text.includes('swap to cymbal choice') ||
      text.includes('switch to store brand') ||
      text.includes('save on store brand') ||
      text.includes('use cymbal choice')
    ) {
      onSwapAllToCymbalChoice();
      setLastAction('🏷️ Swapped eligible items to Cymbal Choice store brand.');
      speakFeedback('Swapped items to Cymbal Choice store brand for instant savings.');
      return;
    }

    if (
      text.includes('align to budget') ||
      text.includes('auto align') ||
      text.includes('balance budget')
    ) {
      onAutoAlignBudget();
      setLastAction('⚡ Auto-aligned shopping list with your host budget.');
      speakFeedback('Auto-aligned shopping list to bring total under budget.');
      return;
    }

    // 3. Update Guests Count: e.g. "change guests to 30", "set guests to 25", "30 guests"
    const guestMatch = text.match(/(?:change|set|update)?\s*(?:guests?|guest count|people)\s*(?:to)?\s*(\d+)/) ||
                       text.match(/(\d+)\s*(?:guests?|people)/);
    if (guestMatch) {
      const newGuests = parseInt(guestMatch[1], 10);
      if (newGuests > 0 && newGuests <= 250) {
        onUpdateGuests(newGuests);
        const msg = `Updated guest count to ${newGuests} guests. Catering formulas recalculated.`;
        setLastAction(`👥 ${msg}`);
        speakFeedback(msg);
        return;
      }
    }

    // 4. Update Budget: e.g. "set budget to 400", "change budget to 350 dollars"
    const budgetMatch = text.match(/(?:set|change|update)?\s*budget\s*(?:to)?\s*\$?(\d+)/);
    if (budgetMatch) {
      const newBudget = parseInt(budgetMatch[1], 10);
      if (newBudget > 0) {
        onUpdateBudget(newBudget);
        const msg = `Updated party budget to ${formatCurrency(newBudget)}.`;
        setLastAction(`💰 ${msg}`);
        speakFeedback(msg);
        return;
      }
    }

    // 5. Update Theme: e.g. "change theme to Hawaiian Luau"
    if (text.startsWith('change theme to') || text.startsWith('set theme to')) {
      const newTheme = rawText.replace(/(?:change|set)\s*theme\s*to\s*/i, '').trim();
      if (newTheme) {
        onUpdateTheme(newTheme);
        const msg = `Updated party theme to ${newTheme}.`;
        setLastAction(`✨ ${msg}`);
        speakFeedback(msg);
        return;
      }
    }

    // 6. Navigation Commands
    if (text.includes('checkout') || text.includes('place order') || text.includes('pickup')) {
      onOpenCheckout();
      setLastAction('🛒 Opened Checkout & Fulfillment order modal.');
      speakFeedback('Opening order checkout for curbside pickup or delivery.');
      return;
    }

    if (text.includes('setup') || text.includes('configure party') || text.includes('edit event')) {
      onOpenSetup();
      setLastAction('⚙️ Opened Event Setup brief modal.');
      speakFeedback('Opening event configuration modal.');
      return;
    }

    if (text.includes('refine constraints') || text.includes('refine party')) {
      onOpenRefine();
      setLastAction('🎛️ Opened Refine Constraints modal.');
      speakFeedback('Opening constraints refinement.');
      return;
    }

    if (text.includes('export') || text.includes('print list') || text.includes('share list')) {
      onOpenExport();
      setLastAction('📄 Opened Export and Print modal.');
      speakFeedback('Opening shopping list export.');
      return;
    }

    // 7. Filtering: e.g. "show drinks", "show food", "show tableware", "show all"
    if (text.includes('show drinks') || text.includes('filter drinks')) {
      if (onSelectCategoryFilter) onSelectCategoryFilter('drinks');
      setLastAction('🍷 Filtered list to Drinks & Ice.');
      speakFeedback('Showing drinks and ice.');
      return;
    }
    if (text.includes('show food') || text.includes('filter food')) {
      if (onSelectCategoryFilter) onSelectCategoryFilter('food');
      setLastAction('🍽️ Filtered list to Food & Snacks.');
      speakFeedback('Showing food and snacks.');
      return;
    }
    if (text.includes('show all') || text.includes('clear filter')) {
      if (onSelectCategoryFilter) onSelectCategoryFilter('all');
      setLastAction('📑 Showing all shopping items.');
      speakFeedback('Showing all items.');
      return;
    }

    // 8. Adjust Item Quantity: e.g. "change burgers to 20", "set ice to 3"
    const changeQtyMatch = text.match(/(?:change|set|update)\s+(.+?)\s+(?:to|quantity to)\s+(\d+)/);
    if (changeQtyMatch) {
      const itemNameSearch = changeQtyMatch[1].trim();
      const newQty = parseInt(changeQtyMatch[2], 10);
      const target = items.find((i) => i.name.toLowerCase().includes(itemNameSearch));
      if (target && newQty > 0) {
        onUpdateQuantity(target.id, newQty);
        const msg = `Updated ${target.name} quantity to ${newQty}.`;
        setLastAction(`✏️ ${msg}`);
        speakFeedback(msg);
        return;
      }
    }

    // 9. Increase / Decrease: e.g. "increase soda by 2", "add 3 to soda", "decrease chips by 1"
    const incMatch = text.match(/(?:increase|add to)\s+(.+?)\s+by\s+(\d+)/);
    if (incMatch) {
      const itemNameSearch = incMatch[1].trim();
      const delta = parseInt(incMatch[2], 10);
      const target = items.find((i) => i.name.toLowerCase().includes(itemNameSearch));
      if (target) {
        const newQty = target.quantity + delta;
        onUpdateQuantity(target.id, newQty);
        const msg = `Increased ${target.name} to ${newQty}.`;
        setLastAction(`➕ ${msg}`);
        speakFeedback(msg);
        return;
      }
    }

    const decMatch = text.match(/(?:decrease|reduce)\s+(.+?)\s+by\s+(\d+)/);
    if (decMatch) {
      const itemNameSearch = decMatch[1].trim();
      const delta = parseInt(decMatch[2], 10);
      const target = items.find((i) => i.name.toLowerCase().includes(itemNameSearch));
      if (target) {
        const newQty = Math.max(1, target.quantity - delta);
        onUpdateQuantity(target.id, newQty);
        const msg = `Decreased ${target.name} to ${newQty}.`;
        setLastAction(`➖ ${msg}`);
        speakFeedback(msg);
        return;
      }
    }

    // 10. Delete / Remove Item: e.g. "delete ice", "remove paper plates"
    if (text.startsWith('delete ') || text.startsWith('remove ')) {
      const nameSearch = text.replace(/^(?:delete|remove)\s+/i, '').trim();
      const target = items.find((i) => i.name.toLowerCase().includes(nameSearch));
      if (target) {
        onDeleteItem(target.id);
        const msg = `Removed ${target.name} from your shopping list.`;
        setLastAction(`🗑️ ${msg}`);
        speakFeedback(msg);
        return;
      }
    }

    // 11. Toggle Bought: e.g. "mark burgers as bought", "bought chips"
    if (text.includes('bought') || text.includes('purchased')) {
      const nameSearch = text.replace(/(?:mark|as|bought|purchased)/g, '').trim();
      const target = items.find((i) => i.name.toLowerCase().includes(nameSearch));
      if (target) {
        onTogglePurchased(target.id);
        const msg = `Toggled ${target.name} purchase status.`;
        setLastAction(`✅ ${msg}`);
        speakFeedback(msg);
        return;
      }
    }

    // 12. Add New Item: e.g. "add 10 hot dog buns", "add 2 cases of seltzer", "add guacamole"
    const addMatch = text.match(/^add\s+(\d+)?\s*(?:packs?|bags?|bottles?|cans?|boxes?|cases?|lbs?)?\s*(?:of\s+)?(.+)/i);
    if (addMatch) {
      const qty = addMatch[1] ? parseInt(addMatch[1], 10) : 1;
      const rawName = addMatch[2].trim();
      if (rawName && rawName.length > 1) {
        const capitalized = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        onAddItem({
          name: capitalized,
          category: 'food',
          quantity: qty,
          unit: 'packs / items',
          estimatedUnitCost: 4.99,
          estimatedTotalCost: Math.round(qty * 4.99 * 100) / 100,
          storeSuggestion: 'supermarket',
          timeline: '2-3-days-before',
          isEssential: true,
          aisle: 'Aisle 4 - Grocery',
          packageDescription: `Added via hands-free voice command`,
        });
        const msg = `Added ${qty} ${capitalized} to your shopping list.`;
        setLastAction(`🛒 ${msg}`);
        speakFeedback(msg);
        return;
      }
    }

    // Fallback if not recognized
    setLastAction(`❓ Did not recognize command: "${rawText}". Try saying "add 5 sodas", "change guests to 25", or "optimize budget".`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleProcessVoiceCommand(manualInput);
    setManualInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        id="voice-control-dialog"
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isListening ? 'bg-amber-500 text-stone-950 animate-pulse' : 'bg-stone-800 text-stone-300'}`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Hands-Free Voice Assistant
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  CymbalMart AI
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Speak naturally to adjust quantities, budget, guests, or check out.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle voice speech synthesis */}
            <button
              type="button"
              onClick={() => setVoiceFeedbackEnabled(!voiceFeedbackEnabled)}
              className={`p-1.5 rounded-lg border transition-colors ${
                voiceFeedbackEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
              title={voiceFeedbackEnabled ? 'Voice Responses Enabled' : 'Voice Responses Muted'}
            >
              {voiceFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Listening Waveform Stage */}
        <div className="p-6 bg-gradient-to-b from-stone-900 to-stone-850 text-white text-center flex flex-col items-center justify-center border-b border-stone-800">
          {/* Audio Pulsing Waves */}
          <div className="relative mb-4">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                <div className="absolute -inset-2 rounded-full bg-amber-500/10 animate-pulse" />
              </>
            )}
            <button
              type="button"
              id="voice-assistant-mic-toggle"
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                isListening
                  ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-400/30'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
              }`}
            >
              {isListening ? <Mic className="w-8 h-8 animate-bounce" /> : <MicOff className="w-7 h-7" />}
            </button>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            {isListening ? 'Listening hands-free...' : 'Microphone paused (tap mic to speak)'}
          </div>

          {/* Transcript Display */}
          <div className="min-h-[48px] max-w-md w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-stone-200 flex items-center justify-center italic">
            "{transcript || 'Say: "Add 10 hot dog buns" or "Optimize budget"...'}"
          </div>
        </div>

        {/* Feedback / Action Log */}
        {lastAction && (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 font-medium leading-relaxed">
              {lastAction}
            </div>
          </div>
        )}

        {/* Quick Voice Command Chips (Click to try hands-free) */}
        <div className="p-5 space-y-3 flex-1 overflow-y-auto max-h-60">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-stone-400" />
            <span>Try Speaking These Commands Hands-Free:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              'Optimize budget',
              'Swap to store brand',
              'Read party summary',
              'Change guests to 25',
              'Set budget to 400',
              'Add 10 sodas',
              'Add ice bags',
              'Go to checkout',
              'Show drinks',
              'Align to budget'
            ].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => handleProcessVoiceCommand(cmd)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 border border-stone-200 transition-colors flex items-center gap-1"
              >
                <span>"{cmd}"</span>
              </button>
            ))}
          </div>

          {/* Fallback text input */}
          <div className="pt-2 border-t border-stone-100">
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Or type a command (e.g. 'add 12 buns', 'optimize budget')..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Speech Recognition Web API active</span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-stone-800 hover:text-stone-950"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
