export interface PartyProfile {
  id: string;
  title: string;
  partyType?: string; // e.g. "Backyard Barbecue", "Kids Birthday", "Taco Fiesta", "Cocktail Mixer", "Game Day"
  theme: string;
  guestCount: number;
  adultCount: number;
  kidCount: number;
  durationHours: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  budget: number;
  vibe: 'budget-saver' | 'balanced' | 'elevated-luxe';
  venue: 'indoor-home' | 'backyard' | 'park-outdoor' | 'rented-venue';
  dietaryRestrictions: string[];
  specialRequests?: string; // e.g. "Kid-friendly finger food", "Low mess", "Cocktails & mocktails", "High protein"
  notes?: string;
  createdAt: string;
}

export type ItemCategory = 
  | 'food' 
  | 'drinks' 
  | 'tableware' 
  | 'decor' 
  | 'activities' 
  | 'cleanup_essentials';

export type StoreType = 
  | 'supermarket' 
  | 'wholesale_club' 
  | 'party_discount' 
  | 'specialty_bakery' 
  | 'liquor_beverage' 
  | 'online_delivery';

export type ShoppingTimeline = '1-week-before' | '2-3-days-before' | 'day-of';

export interface CymbalChoiceOption {
  name: string;
  unitCost: number;
  savingsPerUnit: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  packageDescription?: string; // e.g., "pack of 24", "2 liter bottle"
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  storeSuggestion: StoreType;
  timeline: ShoppingTimeline;
  notes?: string;
  dietaryTag?: string; // e.g. "Gluten-Free", "Nut-Free", "Kid-Safe"
  isEssential: boolean;
  isPurchased: boolean;
  actualCost?: number;
  // CymbalMart specific attributes
  aisle?: string; // e.g. "Aisle 4 - Fresh Meat & Deli", "Aisle 8 - Beverages & Ice"
  isCymbalChoice?: boolean; // Has user opted for CymbalMart's value store brand
  cymbalChoiceOption?: CymbalChoiceOption; // Store-brand equivalent with savings
  brandTier?: 'national' | 'cymbal_choice' | 'premium';
}

export type CUJStep = 'define' | 'review' | 'refine_checkout';

export type FulfillmentMethod = 'curbside_pickup' | 'express_delivery' | 'in_store_route';

export interface CheckoutDetails {
  fulfillmentMethod: FulfillmentMethod;
  storeLocation: string;
  timeSlot: string;
  hostName: string;
  hostPhone: string;
  orderNumber?: string;
  isCompleted: boolean;
  placedAt?: string;
}

export interface AgentTip {
  title: string;
  description: string;
  type: 'saving' | 'portion' | 'time' | 'decor';
}

export interface PartyPlanResponse {
  summary: {
    eventTitle: string;
    totalEstimatedCost: number;
    budgetStatus: 'under' | 'on-target' | 'over';
    guestServingSummary: string;
    keyThemes: string[];
    potentialCymbalSavings?: number;
  };
  items: ShoppingItem[];
  tips: AgentTip[];
  timelineGuide: {
    oneWeekBefore: string[];
    twoDaysBefore: string[];
    dayOf: string[];
  };
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'add_item' | 'remove_item' | 'update_budget' | 'apply_dietary';
    item?: Partial<ShoppingItem>;
    itemNamesToRemove?: string[];
  };
}
