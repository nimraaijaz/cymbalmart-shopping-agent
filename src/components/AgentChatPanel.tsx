import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Plus, 
  TrendingDown, 
  ShieldCheck, 
  DollarSign, 
  Lightbulb, 
  Check, 
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { AgentChatMessage, AgentTip, PartyProfile, ShoppingItem } from '../types';

interface AgentChatPanelProps {
  party: PartyProfile;
  items: ShoppingItem[];
  tips: AgentTip[];
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  onRemoveItemsByNames: (names: string[]) => void;
}

const QUICK_AGENT_PROMPTS = [
  'How do I shave $35 off my total budget?',
  'Are my drink calculations enough for a 4-hour party?',
  'Add 2 kid-friendly nut-free dessert options',
  'What store should I visit first to save money?',
  'Add a signature cocktail/mocktail recipe ingredients',
];

export const AgentChatPanel: React.FC<AgentChatPanelProps> = ({
  party,
  items,
  tips,
  onAddItem,
  onRemoveItemsByNames,
}) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      text: `Hello! I'm your dedicated Party Planner Shopping Agent. I've tailored your shopping list for "${party.title}" (${party.guestCount} guests). Ask me to adjust quantities, optimize budget, suggest vendor hacks, or find allergy-safe alternatives!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [appliedActionIds, setAppliedActionIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isSending) return;

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsSending(true);

    try {
      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: query.trim(),
          partyProfile: party,
          currentItems: items,
          chatHistory: messages.slice(-4),
        }),
      });

      if (!res.ok) throw new Error('Agent service error');

      const data = await res.json();
      const agentMsg: AgentChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply || "I've reviewed your request! Let me know if you want me to update specific items.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: data.suggestedAction,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: "I analyzed your party brief! For optimal savings, purchase tableware at a dollar discount store, and buy club soda & bulk chips at Costco. You can also swap individual canned drinks for large punch dispensers.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyAction = (msgId: string, action: AgentChatMessage['suggestedAction']) => {
    if (!action) return;

    if (action.type === 'add_item' && action.item) {
      onAddItem({
        name: action.item.name || 'Agent Recommended Item',
        category: action.item.category || 'food',
        quantity: action.item.quantity || 1,
        unit: action.item.unit || 'pack',
        packageDescription: action.item.packageDescription,
        estimatedUnitCost: action.item.estimatedUnitCost || 5,
        estimatedTotalCost: action.item.estimatedTotalCost || 5,
        storeSuggestion: action.item.storeSuggestion || 'supermarket',
        timeline: action.item.timeline || '2-3-days-before',
        dietaryTag: action.item.dietaryTag,
        isEssential: true,
      });
    } else if (action.type === 'remove_item' && action.itemNamesToRemove) {
      onRemoveItemsByNames(action.itemNamesToRemove);
    }

    setAppliedActionIds((prev) => new Set([...prev, msgId]));
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Agent Header */}
      <div className="p-4 border-b border-stone-200 bg-amber-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 leading-tight">Shopping Agent Live Consult</h2>
            <p className="text-[11px] text-stone-500">Ask for recipes, budget cuts, and store advice</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
          Online
        </span>
      </div>

      {/* Recommended Tips banner if available */}
      {tips && tips.length > 0 && (
        <div className="p-3 bg-stone-50 border-b border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Agent Smart Tips for {party.theme}</span>
          </div>
          <div className="space-y-1.5">
            {tips.slice(0, 2).map((tip, idx) => (
              <div key={idx} className="text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-stone-200">
                <span className="font-semibold text-stone-800">{tip.title}: </span>
                {tip.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 min-h-[260px] max-h-[420px] bg-stone-50/30">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          const isActionApplied = appliedActionIds.has(msg.id);

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAgent ? 'items-start' : 'items-end justify-end'}`}
            >
              {isAgent && (
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  AI
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isAgent
                    ? 'bg-white border border-stone-200 text-stone-800 shadow-xs'
                    : 'bg-amber-600 text-white shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Suggested Action Pill */}
                {isAgent && msg.suggestedAction && msg.suggestedAction.type !== 'none' && (
                  <div className="mt-2.5 pt-2 border-t border-stone-100">
                    <div className="text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Suggested List Action:</span>
                    </div>

                    {msg.suggestedAction.type === 'add_item' && msg.suggestedAction.item && (
                      <div className="flex items-center justify-between gap-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <div className="text-[11px]">
                          <span className="font-bold text-stone-800">{msg.suggestedAction.item.name}</span>
                          <span className="text-stone-500"> (${msg.suggestedAction.item.estimatedTotalCost || 5})</span>
                        </div>
                        <button
                          type="button"
                          disabled={isActionApplied}
                          onClick={() => handleApplyAction(msg.id, msg.suggestedAction)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors ${
                            isActionApplied
                              ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          {isActionApplied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Apply to List</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1 ${
                    isAgent ? 'text-stone-400' : 'text-amber-200 text-right'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-stone-500 bg-white border border-stone-200 rounded-xl p-3 w-fit shadow-xs animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Shopping Agent analyzing catering formulas & store inventory...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-2 bg-stone-50 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {QUICK_AGENT_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isSending}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 rounded-full border border-stone-200 whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-stone-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask agent: 'Swap sodas for fresh lemonade' or 'Cut $20'..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isSending}
            className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={isSending || !inputPrompt.trim()}
            className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40"
            title="Send prompt to shopping agent"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
