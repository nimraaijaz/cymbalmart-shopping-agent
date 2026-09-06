import React, { useState } from 'react';
import { 
  Check, 
  Trash2, 
  Plus, 
  Minus, 
  Store, 
  Clock, 
  Utensils, 
  Wine, 
  PartyPopper, 
  Sparkles, 
  Tag, 
  Search, 
  PlusCircle, 
  Edit3,
  Layers,
  Filter,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { ItemCategory, ShoppingItem, StoreType, ShoppingTimeline } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onTogglePurchased: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  onUpdateItemCost: (id: string, newUnitCost: number) => void;
  onToggleCymbalChoice?: (id: string) => void;
  onUpdateItem?: (id: string, updatedFields: Partial<ShoppingItem>) => void;
  onOpenOptimizer?: () => void;
}

const CATEGORY_TABS: { id: ItemCategory | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'All Items', icon: Layers },
  { id: 'food', label: 'Food & Snacks', icon: Utensils },
  { id: 'drinks', label: 'Drinks & Ice', icon: Wine },
  { id: 'tableware', label: 'Tableware', icon: Store },
  { id: 'decor', label: 'Decorations', icon: PartyPopper },
  { id: 'activities', label: 'Activities & Favors', icon: Sparkles },
  { id: 'cleanup_essentials', label: 'Cleanup & Essentials', icon: Tag },
];

const STORE_LABELS: Record<StoreType, { label: string; color: string }> = {
  supermarket: { label: 'Grocery / Supermarket', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  wholesale_club: { label: 'Wholesale Club (Costco/Sam’s)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  party_discount: { label: 'Party Supply / Dollar Store', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  specialty_bakery: { label: 'Bakery / Deli', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  liquor_beverage: { label: 'Beverage / Liquor Store', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  online_delivery: { label: 'Online / Order Ahead', color: 'bg-stone-100 text-stone-700 border-stone-300' },
};

const TIMELINE_LABELS: Record<ShoppingTimeline, { label: string; color: string }> = {
  '1-week-before': { label: '1 Week Ahead (Supplies)', color: 'text-stone-600 bg-stone-100' },
  '2-3-days-before': { label: '2-3 Days Ahead (Pantry & Drinks)', color: 'text-amber-800 bg-amber-50' },
  'day-of': { label: 'Day-Of (Bakery & Ice)', color: 'text-rose-800 bg-rose-50' },
};

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onTogglePurchased,
  onUpdateQuantity,
  onDeleteItem,
  onAddItem,
  onUpdateItemCost,
  onToggleCymbalChoice,
  onUpdateItem,
  onOpenOptimizer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedStore, setSelectedStore] = useState<StoreType | 'all'>('all');
  const [selectedTimeline, setSelectedTimeline] = useState<ShoppingTimeline | 'all'>('all');
  const [selectedAisle, setSelectedAisle] = useState<string | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | 'cymbal_choice' | 'national_brand'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<ItemCategory>('food');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editUnit, setEditUnit] = useState('pack');
  const [editUnitCost, setEditUnitCost] = useState(5);
  const [editStore, setEditStore] = useState<StoreType>('supermarket');
  const [editAisle, setEditAisle] = useState('');
  const [editTimeline, setEditTimeline] = useState<ShoppingTimeline>('2-3-days-before');
  const [editPackageDesc, setEditPackageDesc] = useState('');
  const [editDietary, setEditDietary] = useState('');
  const [editIsEssential, setEditIsEssential] = useState(true);

  const openEditModal = (item: ShoppingItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditQuantity(item.quantity);
    setEditUnit(item.unit);
    setEditUnitCost(item.estimatedUnitCost);
    setEditStore(item.storeSuggestion);
    setEditAisle(item.aisle || '');
    setEditTimeline(item.timeline);
    setEditPackageDesc(item.packageDescription || '');
    setEditDietary(item.dietaryTag || '');
    setEditIsEssential(item.isEssential);
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editName.trim()) return;

    const validatedQty = Math.max(1, editQuantity);
    const validatedCost = Math.max(0, editUnitCost);
    const newTotal = Math.round(validatedQty * validatedCost * 100) / 100;

    if (onUpdateItem) {
      onUpdateItem(editingItem.id, {
        name: editName.trim(),
        category: editCategory,
        quantity: validatedQty,
        unit: editUnit.trim() || 'item',
        estimatedUnitCost: validatedCost,
        estimatedTotalCost: newTotal,
        storeSuggestion: editStore,
        aisle: editAisle.trim() || undefined,
        timeline: editTimeline,
        packageDescription: editPackageDesc.trim() || undefined,
        dietaryTag: editDietary.trim() || undefined,
        isEssential: editIsEssential,
      });
    } else {
      // Fallback
      onUpdateQuantity(editingItem.id, validatedQty);
      onUpdateItemCost(editingItem.id, validatedCost);
    }

    setEditingItem(null);
  };

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('food');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('pack');
  const [newItemPackageDesc, setNewItemPackageDesc] = useState('');
  const [newItemUnitCost, setNewItemUnitCost] = useState(5);
  const [newItemStore, setNewItemStore] = useState<StoreType>('supermarket');
  const [newItemAisle, setNewItemAisle] = useState('Aisle 4 - Fresh Groceries');
  const [newItemTimeline, setNewItemTimeline] = useState<ShoppingTimeline>('2-3-days-before');
  const [newItemDietary, setNewItemDietary] = useState('');

  // Extract distinct aisles
  const availableAisles = Array.from(
    new Set(items.map((i) => i.aisle).filter(Boolean))
  ) as string[];

  // Filtering
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStore !== 'all' && item.storeSuggestion !== selectedStore) return false;
    if (selectedTimeline !== 'all' && item.timeline !== selectedTimeline) return false;
    if (selectedAisle !== 'all' && item.aisle !== selectedAisle) return false;
    if (brandFilter === 'cymbal_choice' && !item.isCymbalChoice) return false;
    if (brandFilter === 'national_brand' && item.isCymbalChoice) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.packageDescription?.toLowerCase().includes(q) || false;
      const matchDiet = item.dietaryTag?.toLowerCase().includes(q) || false;
      const matchAisle = item.aisle?.toLowerCase().includes(q) || false;
      if (!matchName && !matchDesc && !matchDiet && !matchAisle) return false;
    }
    return true;
  });

  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem({
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: Math.max(1, newItemQuantity),
      unit: newItemUnit.trim() || 'item',
      packageDescription: newItemPackageDesc.trim() || undefined,
      estimatedUnitCost: Math.max(0, newItemUnitCost),
      estimatedTotalCost: Math.round(Math.max(1, newItemQuantity) * Math.max(0, newItemUnitCost)),
      storeSuggestion: newItemStore,
      timeline: newItemTimeline,
      dietaryTag: newItemDietary.trim() || undefined,
      isEssential: true,
      aisle: newItemAisle.trim() || 'Aisle 4 - Groceries',
      isCymbalChoice: false,
    });

    // Reset
    setNewItemName('');
    setNewItemPackageDesc('');
    setNewItemDietary('');
    setShowAddModal(false);
  };

  const currentCategoryTotal = filteredItems.reduce((acc, it) => acc + it.estimatedTotalCost, 0);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-stone-100 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.id === 'all' 
            ? items.length 
            : items.filter((i) => i.category === tab.id).length;
          const isSelected = selectedCategory === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 border-b border-stone-100">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items, ingredients, dietary tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Aisle Filter */}
          {availableAisles.length > 0 && (
            <select
              value={selectedAisle}
              onChange={(e) => setSelectedAisle(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 text-xs focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">📍 All Store Aisles ({availableAisles.length})</option>
              {availableAisles.map((aisle) => (
                <option key={aisle} value={aisle}>{aisle}</option>
              ))}
            </select>
          )}

          {/* Brand Filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 text-xs focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="all">🏷️ All Brands</option>
            <option value="cymbal_choice">✨ Cymbal Choice Brand Only</option>
            <option value="national_brand">National Brands Only</option>
          </select>

          {/* Store Filter */}
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value as any)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Stores & Vendors</option>
            <option value="supermarket">Grocery / Supermarket</option>
            <option value="wholesale_club">Wholesale Club</option>
            <option value="party_discount">Party Supply / Discount</option>
            <option value="specialty_bakery">Bakery / Deli</option>
            <option value="liquor_beverage">Liquor / Beverage</option>
            <option value="online_delivery">Online Orders</option>
          </select>

          {/* Timeline Filter */}
          <select
            value={selectedTimeline}
            onChange={(e) => setSelectedTimeline(e.target.value as any)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Shopping Runs</option>
            <option value="1-week-before">1 Week Ahead (Supplies)</option>
            <option value="2-3-days-before">2-3 Days Ahead (Pantry)</option>
            <option value="day-of">Day-Of (Bakery & Ice)</option>
          </select>

          {/* Add Item Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors ml-auto md:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* List Header stats */}
      <div className="flex items-center justify-between text-xs text-stone-500 py-2.5 px-1 font-medium">
        <div>
          Showing <span className="font-semibold text-stone-800">{filteredItems.length}</span> items
        </div>
        <div>
          Category Total: <span className="font-bold text-stone-900">{formatCurrency(currentCategoryTotal)}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2 mt-1">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-stone-500 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
            <p className="text-sm font-medium">No shopping items match your filters.</p>
            <p className="text-xs text-stone-400 mt-1">Try resetting the search or category filters, or add a custom item.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const storeInfo = STORE_LABELS[item.storeSuggestion] || STORE_LABELS.supermarket;
            const timelineInfo = TIMELINE_LABELS[item.timeline] || TIMELINE_LABELS['2-3-days-before'];

            return (
              <div
                key={item.id}
                className={`group p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isPurchased
                    ? 'bg-stone-50/70 border-stone-200/60 opacity-60'
                    : 'bg-white hover:bg-amber-50/20 border-stone-200 shadow-xs'
                }`}
              >
                {/* Left: Checkbox & Name info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onTogglePurchased(item.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                      item.isPurchased
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-stone-300 hover:border-amber-500 bg-white'
                    }`}
                    title={item.isPurchased ? 'Mark as needed' : 'Mark as in-cart / bought'}
                  >
                    {item.isPurchased && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold truncate ${
                          item.isPurchased ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Dietary Tag */}
                      {item.dietaryTag && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.dietaryTag}
                        </span>
                      )}

                      {/* Timeline Pill */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${timelineInfo.color}`}>
                        {timelineInfo.label}
                      </span>
                    </div>

                    {/* Formula description / packaging note */}
                    {item.packageDescription && (
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                        {item.packageDescription}
                      </p>
                    )}

                    {/* Aisle & Cymbal Choice Badges */}
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      {/* Aisle Badge */}
                      {item.aisle && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{item.aisle}</span>
                        </span>
                      )}

                      {/* Cymbal Choice Status or Swap Button */}
                      {item.isCymbalChoice ? (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Cymbal Choice Brand</span>
                          </span>
                          {onToggleCymbalChoice && item.cymbalChoiceOption && (
                            <button
                              type="button"
                              onClick={() => onToggleCymbalChoice(item.id)}
                              className="text-[10px] text-stone-400 hover:text-stone-700 underline"
                              title="Revert to national brand"
                            >
                              Revert
                            </button>
                          )}
                        </div>
                      ) : item.cymbalChoiceOption && onToggleCymbalChoice ? (
                        <button
                          type="button"
                          onClick={() => onToggleCymbalChoice(item.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors"
                          title="Switch to CymbalMart store brand"
                        >
                          <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>
                            Swap to Cymbal Choice (Save {formatCurrency(item.cymbalChoiceOption.savingsPerUnit * item.quantity)})
                          </span>
                        </button>
                      ) : null}

                      {/* Store badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${storeInfo.color}`}>
                        <Store className="w-3 h-3" />
                        {storeInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Adjuster, Price, Edit & Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 flex-wrap">
                  {/* Quantity controls with direct number input & steppers */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-white text-stone-600 transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1) {
                            onUpdateQuantity(item.id, val);
                          }
                        }}
                        className="w-11 px-1 text-center text-xs font-bold text-stone-900 bg-white border border-stone-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        title="Click to type quantity directly"
                      />
                      <span className="font-normal text-[11px] text-stone-500 ml-1 mr-0.5 max-w-[3rem] truncate">
                        {item.unit}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-white text-stone-600 transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Price display */}
                  <div className="text-right min-w-[4.2rem]">
                    <div className="text-sm font-bold text-stone-900">
                      {formatCurrency(item.estimatedTotalCost)}
                    </div>
                    <div className="text-[10px] text-stone-600">
                      ${item.estimatedUnitCost.toFixed(2)}/{item.unit}
                    </div>
                  </div>

                  {/* Edit Item Details Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-stone-400 hover:text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                    title="Edit item name, unit price, quantity, aisle, and notes"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Item */}
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Add Custom Shopping Item</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomItem} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sparkling Apple Cider, Extra Party Streamers"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="food">Food & Snacks</option>
                    <option value="drinks">Drinks & Ice</option>
                    <option value="tableware">Tableware</option>
                    <option value="decor">Decorations</option>
                    <option value="activities">Activities & Favors</option>
                    <option value="cleanup_essentials">Cleanup & Essentials</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Recommended Store</label>
                  <select
                    value={newItemStore}
                    onChange={(e) => setNewItemStore(e.target.value as StoreType)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="supermarket">Grocery / Supermarket</option>
                    <option value="wholesale_club">Wholesale Club</option>
                    <option value="party_discount">Party Supply / Dollar</option>
                    <option value="specialty_bakery">Bakery / Deli</option>
                    <option value="liquor_beverage">Liquor / Beverage</option>
                    <option value="online_delivery">Online / Order Ahead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="pack, lbs, bottle"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newItemUnitCost}
                    onChange={(e) => setNewItemUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">CymbalMart Aisle</label>
                  <input
                    type="text"
                    placeholder="e.g. Aisle 5"
                    value={newItemAisle}
                    onChange={(e) => setNewItemAisle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Shopping Timeline</label>
                  <select
                    value={newItemTimeline}
                    onChange={(e) => setNewItemTimeline(e.target.value as ShoppingTimeline)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="1-week-before">1 Week Before (Supplies)</option>
                    <option value="2-3-days-before">2-3 Days Before (Pantry)</option>
                    <option value="day-of">Day of Event (Bakery/Ice)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Dietary Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Gluten-Free"
                    value={newItemDietary}
                    onChange={(e) => setNewItemDietary(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Portion / Package Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Pack of 24 mini burgers, buy pre-chopped"
                  value={newItemPackageDesc}
                  onChange={(e) => setNewItemPackageDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 shadow-xs"
                >
                  Add to Shopping List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal with Real-Time Budget Recalculation */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Edit Item & Recalculate</h3>
                  <p className="text-xs text-stone-500">Changes immediately update your event budget and per-guest metrics.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unit Description</label>
                  <input
                    type="text"
                    required
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. packs, lbs, bottles"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unit Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-stone-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={editUnitCost}
                      onChange={(e) => setEditUnitCost(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-stone-900"
                    />
                  </div>
                </div>

                {/* Live Line Total Calculation Preview */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Calculated Line Total</label>
                  <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 font-black text-sm flex items-center justify-between">
                    <span>Total:</span>
                    <span>{formatCurrency(Math.round(editQuantity * editUnitCost * 100) / 100)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ItemCategory)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="food">Food & Snacks</option>
                    <option value="drinks">Drinks & Ice</option>
                    <option value="tableware">Tableware</option>
                    <option value="decor">Decorations</option>
                    <option value="activities">Activities & Favors</option>
                    <option value="cleanup_essentials">Cleanup & Essentials</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">CymbalMart Aisle</label>
                  <input
                    type="text"
                    value={editAisle}
                    onChange={(e) => setEditAisle(e.target.value)}
                    placeholder="e.g. Aisle 3 - Snacks"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Dietary Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Gluten-Free, Vegan"
                    value={editDietary}
                    onChange={(e) => setEditDietary(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Fulfillment Store</label>
                  <select
                    value={editStore}
                    onChange={(e) => setEditStore(e.target.value as StoreType)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="supermarket">Grocery / Supermarket</option>
                    <option value="wholesale_club">Wholesale Club</option>
                    <option value="party_discount">Party Supply</option>
                    <option value="specialty_bakery">Bakery / Deli</option>
                    <option value="liquor_beverage">Beverage Store</option>
                    <option value="online_delivery">Order Ahead</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Portion Notes / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Crowd portioning notes"
                  value={editPackageDesc}
                  onChange={(e) => setEditPackageDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-is-essential"
                  checked={editIsEssential}
                  onChange={(e) => setEditIsEssential(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <label htmlFor="edit-is-essential" className="text-stone-700 font-semibold cursor-pointer">
                  Mark as Catering Essential (protected during auto-trimming)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 shadow-xs"
                >
                  Save Changes & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
