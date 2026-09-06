import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Heuristic fallback generator when AI key is missing or offline
function generateFallbackPlan(profile: any) {
  const guests = Number(profile.guestCount) || 12;
  const adults = Number(profile.adultCount) || Math.round(guests * 0.8);
  const kids = Number(profile.kidCount) || (guests - adults);
  const hours = Number(profile.durationHours) || 3;
  const budget = Number(profile.budget) || 200;
  const theme = profile.theme || 'Celebration Party';
  const partyType = profile.partyType || 'Event';
  const specialRequests = profile.specialRequests || '';

  const items: any[] = [
    // Food
    {
      id: 'f-1',
      name: `Cymbal Butcher Selection: Main Protein for ${theme}`,
      category: 'food',
      quantity: Math.ceil(guests * 0.35),
      unit: 'lbs / packs',
      packageDescription: `Calculated for ${guests} guests (approx 6-8 oz per adult)`,
      estimatedUnitCost: 13.5,
      estimatedTotalCost: Math.round(Math.ceil(guests * 0.35) * 13.5),
      storeSuggestion: 'supermarket',
      timeline: '2-3-days-before',
      dietaryTag: 'Fresh Cut Quality',
      aisle: 'Aisle 4 - Fresh Meat & Deli',
      cymbalChoiceOption: {
        name: `Cymbal Choice Seasoned Party Platter (${theme})`,
        unitCost: 10.5,
        savingsPerUnit: 3.0,
      },
      isEssential: true,
      isPurchased: false,
    },
    {
      id: 'f-2',
      name: 'Finger Foods & Artisan Appetizer Assortment',
      category: 'food',
      quantity: Math.ceil(guests * 0.5),
      unit: 'party trays',
      packageDescription: `${Math.round(guests * 4)} bite-sized pieces for effortless mingling`,
      estimatedUnitCost: 8.5,
      estimatedTotalCost: Math.round(Math.ceil(guests * 0.5) * 8.5),
      storeSuggestion: 'supermarket',
      timeline: '2-3-days-before',
      aisle: 'Aisle 4 - Deli & Prepared Foods',
      cymbalChoiceOption: {
        name: 'Cymbal Choice Crispy Bites & Roll-Ups Party Pack',
        unitCost: 6.25,
        savingsPerUnit: 2.25,
      },
      isEssential: true,
      isPurchased: false,
    },
    {
      id: 'f-3',
      name: 'Artisan Dip, Chips & Fresh Crudité Veggies',
      category: 'food',
      quantity: Math.ceil(guests / 5),
      unit: 'family packs',
      packageDescription: 'Fresh salsa, house guacamole, hummus, and crisp sliced veggies',
      estimatedUnitCost: 7,
      estimatedTotalCost: Math.round(Math.ceil(guests / 5) * 7),
      storeSuggestion: 'supermarket',
      timeline: '2-3-days-before',
      dietaryTag: 'Vegetarian / Gluten-Free',
      aisle: 'Aisle 3 - Snacks & Dips',
      cymbalChoiceOption: {
        name: 'Cymbal Choice Cantina Tortilla Chips & Fresh Mild Salsa',
        unitCost: 4.5,
        savingsPerUnit: 2.5,
      },
      isEssential: false,
      isPurchased: false,
    },
    {
      id: 'f-4',
      name: `Cymbal Bakery: Themed Celebration Cake (${theme})`,
      category: 'food',
      quantity: Math.ceil(guests * 1.1),
      unit: 'servings',
      packageDescription: 'Freshly baked at CymbalMart bakery counter, custom message ready',
      estimatedUnitCost: 2.25,
      estimatedTotalCost: Math.round(Math.ceil(guests * 1.1) * 2.25),
      storeSuggestion: 'specialty_bakery',
      timeline: 'day-of',
      aisle: 'Bakery Counter & Pastry Case',
      cymbalChoiceOption: {
        name: 'Cymbal Choice Party Cupcake Platter (24-ct)',
        unitCost: 1.75,
        savingsPerUnit: 0.5,
      },
      isEssential: true,
      isPurchased: false,
    },

    // Drinks
    {
      id: 'd-1',
      name: 'Premium Cocktail & Mocktail Mixers / Juices',
      category: 'drinks',
      quantity: Math.ceil(guests / 4),
      unit: 'bottles (2L / 64oz)',
      packageDescription: `Based on ~${hours} drink servings per guest formula`,
      estimatedUnitCost: 4.5,
      estimatedTotalCost: Math.round(Math.ceil(guests / 4) * 4.5),
      storeSuggestion: 'supermarket',
      timeline: '1-week-before',
      aisle: 'Aisle 7 - Beverages & Mixers',
      cymbalChoiceOption: {
        name: 'Cymbal Choice 100% Citrus & Punch Mixer 64oz',
        unitCost: 2.99,
        savingsPerUnit: 1.51,
      },
      isEssential: true,
      isPurchased: false,
    },
    {
      id: 'd-2',
      name: 'Sparkling Seltzer & Flavored Mineral Waters',
      category: 'drinks',
      quantity: Math.ceil((guests * 1.5) / 12),
      unit: '12-can packs',
      packageDescription: 'Crisp zero-sugar sparkling refreshments',
      estimatedUnitCost: 6.25,
      estimatedTotalCost: Math.round(Math.ceil((guests * 1.5) / 12) * 6.25),
      storeSuggestion: 'supermarket',
      timeline: '1-week-before',
      aisle: 'Aisle 7 - Sparkling Waters & Sodas',
      cymbalChoiceOption: {
        name: 'Cymbal Pure Sparkle Crisp Seltzer 12-Pack',
        unitCost: 4.29,
        savingsPerUnit: 1.96,
      },
      isEssential: true,
      isPurchased: false,
    },
    {
      id: 'd-3',
      name: 'Crystal Clean Cocktail & Cooler Ice Bags',
      category: 'drinks',
      quantity: Math.ceil((guests * 1.5) / 10),
      unit: '10-lb bags',
      packageDescription: '1.5 lbs per person for drink cups and ice bath beverage tubs',
      estimatedUnitCost: 3.25,
      estimatedTotalCost: Math.round(Math.ceil((guests * 1.5) / 10) * 3.25),
      storeSuggestion: 'supermarket',
      timeline: 'day-of',
      aisle: 'Aisle 8 - Ice & Freezer Coolers',
      cymbalChoiceOption: {
        name: 'Cymbal Arctic Pure 10lb Triple-Filtered Ice Bag',
        unitCost: 2.49,
        savingsPerUnit: 0.76,
      },
      isEssential: true,
      isPurchased: false,
    },

    // Tableware
    {
      id: 't-1',
      name: 'Heavy-Duty Compostable Dinner & Snack Plates',
      category: 'tableware',
      quantity: Math.ceil((guests * 2.2) / 20),
      unit: '20-count packs',
      packageDescription: 'Cut-resistant with 20% buffer for second helpings',
      estimatedUnitCost: 4.75,
      estimatedTotalCost: Math.round(Math.ceil((guests * 2.2) / 20) * 4.75),
      storeSuggestion: 'party_discount',
      timeline: '1-week-before',
      aisle: 'Aisle 12 - CymbalMart Party Supplies',
      cymbalChoiceOption: {
        name: 'Cymbal Choice Eco-Fiber Sturdy Plates 30-Pack',
        unitCost: 3.29,
        savingsPerUnit: 1.46,
      },
      isEssential: true,
      isPurchased: false,
    },
    {
      id: 't-2',
      name: 'Crystal Clear Party Tumbler Cups',
      category: 'tableware',
      quantity: Math.ceil((guests * 2.5) / 25),
      unit: '25-count packs',
      packageDescription: 'Allowing 2-3 drinks per guest without cup confusion',
      estimatedUnitCost: 4.25,
      estimatedTotalCost: Math.round(Math.ceil((guests * 2.5) / 25) * 4.25),
      storeSuggestion: 'party_discount',
      timeline: '1-week-before',
      aisle: 'Aisle 12 - CymbalMart Party Supplies',
      cymbalChoiceOption: {
        name: 'Cymbal Choice Shatterproof Clear Cups 30-Pack',
        unitCost: 2.99,
        savingsPerUnit: 1.26,
      },
      isEssential: true,
      isPurchased: false,
    },
    {
      id: 't-3',
      name: '3-Ply Soft Absorbent Party Napkins',
      category: 'tableware',
      quantity: Math.ceil((guests * 3.5) / 50),
      unit: '50-count packs',
      packageDescription: 'Generous 3-4 napkins per guest for finger foods',
      estimatedUnitCost: 3.25,
      estimatedTotalCost: Math.round(Math.ceil((guests * 3.5) / 50) * 3.25),
      storeSuggestion: 'party_discount',
      timeline: '1-week-before',
      aisle: 'Aisle 12 - CymbalMart Party Supplies',
      cymbalChoiceOption: {
        name: 'Cymbal Choice Color Accent Napkins 60-Pack',
        unitCost: 1.99,
        savingsPerUnit: 1.26,
      },
      isEssential: true,
      isPurchased: false,
    },

    // Decor
    {
      id: 'dec-1',
      name: `${theme} Celebration Banner & Table Runners`,
      category: 'decor',
      quantity: 2,
      unit: 'sets',
      packageDescription: 'Creates focal photo & food presentation zones instantly',
      estimatedUnitCost: 9.5,
      estimatedTotalCost: 19,
      storeSuggestion: 'party_discount',
      timeline: '1-week-before',
      aisle: 'Aisle 13 - Celebrations & Festivities',
      cymbalChoiceOption: {
        name: 'Cymbal Festivities All-in-One Decor Kit',
        unitCost: 6.99,
        savingsPerUnit: 2.51,
      },
      isEssential: false,
      isPurchased: false,
    },
    {
      id: 'dec-2',
      name: 'Coordinated Balloon Arch or Garland Accent Kit',
      category: 'decor',
      quantity: 1,
      unit: 'complete kit',
      packageDescription: 'Fast DIY assembly balloon backdrop with pump included',
      estimatedUnitCost: 14,
      estimatedTotalCost: 14,
      storeSuggestion: 'party_discount',
      timeline: '1-week-before',
      aisle: 'Aisle 13 - Celebrations & Festivities',
      isEssential: false,
      isPurchased: false,
    },

    // Cleanup & Essentials
    {
      id: 'c-1',
      name: 'Heavy-Duty Drawstring Contractor Trash & Recycle Bags',
      category: 'cleanup_essentials',
      quantity: 1,
      unit: 'box (20-ct)',
      packageDescription: 'Tear-resistant double ply for quick 10-minute party cleanup',
      estimatedUnitCost: 6.25,
      estimatedTotalCost: 6.25,
      storeSuggestion: 'supermarket',
      timeline: '1-week-before',
      aisle: 'Aisle 15 - Cleaning & Paper Goods',
      cymbalChoiceOption: {
        name: 'Cymbal Choice Flex-Tough Trash Bags 25-ct',
        unitCost: 4.49,
        savingsPerUnit: 1.76,
      },
      isEssential: true,
      isPurchased: false,
    },
    {
      id: 'c-2',
      name: 'Surface Disinfectant Wipes & Ultra-Quilted Paper Towels',
      category: 'cleanup_essentials',
      quantity: 2,
      unit: 'rolls / canisters',
      packageDescription: 'Keep at the drink and buffet tables for instant spill wipes',
      estimatedUnitCost: 3.75,
      estimatedTotalCost: 7.5,
      storeSuggestion: 'supermarket',
      timeline: '1-week-before',
      aisle: 'Aisle 15 - Cleaning & Paper Goods',
      cymbalChoiceOption: {
        name: 'Cymbal Choice Multi-Surface Wipes & Towel Bundle',
        unitCost: 2.75,
        savingsPerUnit: 1.0,
      },
      isEssential: true,
      isPurchased: false,
    },
  ];

  if (kids > 0) {
    items.push({
      id: 'act-1',
      name: `Kid-Friendly Activity & Favor Packs (${theme})`,
      category: 'activities',
      quantity: kids,
      unit: 'goodie packs',
      packageDescription: 'Nut-free treats, stickers, coloring sheets, and mini party bubbles',
      estimatedUnitCost: 3.25,
      estimatedTotalCost: Math.round(kids * 3.25),
      storeSuggestion: 'party_discount',
      timeline: '1-week-before',
      dietaryTag: 'Nut-Free treats',
      aisle: 'Aisle 13 - Kids Toys & Favors',
      cymbalChoiceOption: {
        name: 'Cymbal Fun Pack Favors (Assorted 6-ct)',
        unitCost: 2.25,
        savingsPerUnit: 1.0,
      },
      isEssential: true,
      isPurchased: false,
    });
  }

  const totalCost = items.reduce((sum, item) => sum + item.estimatedTotalCost, 0);
  const potentialSavings = items.reduce((sum, item) => {
    if (item.cymbalChoiceOption) {
      return sum + (item.cymbalChoiceOption.savingsPerUnit * item.quantity);
    }
    return sum;
  }, 0);

  return {
    summary: {
      eventTitle: profile.title || `${theme} Gathering`,
      totalEstimatedCost: Math.round(totalCost),
      budgetStatus: totalCost <= budget ? 'under' : (totalCost <= budget * 1.15 ? 'on-target' : 'over'),
      guestServingSummary: `Catering calculated for ${guests} guests (${adults} adults, ${kids} kids) over a ${hours}-hour ${profile.timeOfDay} event.`,
      keyThemes: [theme, partyType, profile.vibe || 'balanced', profile.venue || 'indoor-home'],
      potentialCymbalSavings: Math.round(potentialSavings),
    },
    items,
    tips: [
      {
        title: 'Cymbal Choice Brand Budget Hack',
        description: 'Swapping national brands to Cymbal Choice store brands across paper goods, seltzers, and snacks trims up to 25% off your total without sacrificing quality.',
        type: 'saving',
      },
      {
        title: 'Formula for Ice Optimization',
        description: 'Plan 1.5 lbs of ice per person. Reserve 1 clean bag strictly for drink cups in a tabletop cooler, and remaining bags in beverage tubs for chilling cans.',
        type: 'portion',
      },
      {
        title: 'CymbalMart Curbside Pickup Time-Saver',
        description: 'Order your dry goods and paperware for free curbside pickup 2 days ahead, then pick up fresh ice and bakery pastries on event day in under 3 minutes.',
        type: 'time',
      },
    ],
    timelineGuide: {
      oneWeekBefore: [
        'Order tableware, dry paper goods, contractor bags, and decorations from CymbalMart Aisle 12-13.',
        'Send final RSVP reminders to solidify exact headcounts.',
        'Clean out refrigerator shelf space for party trays and drink chilling.',
      ],
      twoDaysBefore: [
        'Place CymbalMart Curbside Pickup order for non-perishable pantry items, chips, canned mixers, and condiments.',
        'Prep marinades, sliced vegetables, or pre-chilled punch bases.',
        'Assemble decorative backdrops, banners, or lighting fixtures.',
      ],
      dayOf: [
        'Pick up fresh celebration cake at the CymbalMart Bakery Counter.',
        'Grab 10-lb triple-filtered cocktail ice bags right before guests arrive.',
        'Set up beverage station and chill drinks at least 90 minutes before party start.',
      ],
    },
  };
}

// Endpoint: Generate comprehensive party shopping plan
app.post('/api/plan-party', async (req, res) => {
  try {
    const profile = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      console.log('Gemini API key not found; serving calculated fallback plan.');
      return res.json(generateFallbackPlan(profile));
    }

    const prompt = `
You are the expert Party Planner Shopping Agent for CymbalMart.
CymbalMart is the one-stop shopping destination for busy hosts needing seamless, budget-conscious event planning.
Create a complete, realistic, cost-optimized, and categorized shopping plan for the following party brief:

PARTY SPECIFICATIONS:
- Title: ${profile.title}
- Party Type: ${profile.partyType || 'Gathering'}
- Theme / Occasion: ${profile.theme}
- Total Guests: ${profile.guestCount} (${profile.adultCount} adults, ${profile.kidCount} children/teens)
- Event Duration: ${profile.durationHours} hours
- Time of Day: ${profile.timeOfDay}
- Target Budget: $${profile.budget}
- Style/Vibe: ${profile.vibe} (budget-saver, balanced, or elevated-luxe)
- Venue: ${profile.venue}
- Dietary Restrictions / Allergies: ${Array.isArray(profile.dietaryRestrictions) ? profile.dietaryRestrictions.join(', ') : (profile.dietaryRestrictions || 'None specified')}
- Special Requests & Notes: ${profile.specialRequests || profile.notes || 'None'}

MATHEMATICAL CATERING RULES TO ADHERE TO:
1. Food Quantities:
   - If finger food/cocktail party: 4-6 appetizer pieces per guest per hour.
   - If meal/dinner: 6-8 oz protein per adult, 4 oz per child, plus 2-3 sides.
   - Dessert: 1.25 servings per guest.
2. Beverages:
   - First hour: 2 drinks per guest.
   - Subsequent hours: 1 drink per guest per hour.
   - Non-alcoholic: 50% of total drink volume.
   - Ice: 1.5 lbs per guest.
3. Tableware:
   - Dinner plates: Guest count * 1.5 (for seconds).
   - Drink cups: Guest count * 2 to 3.
   - Napkins: Guest count * 3 to 4.
4. CymbalMart Aisles (assign realistic aisles to each item):
   - 'Aisle 1 - Fresh Produce & Fruit'
   - 'Aisle 3 - Snacks, Chips & Dips'
   - 'Aisle 4 - Fresh Meat & Deli'
   - 'Aisle 7 - Beverages, Juices & Sodas'
   - 'Aisle 8 - Ice & Frozen Foods'
   - 'Bakery Counter & Pastry'
   - 'Aisle 12 - CymbalMart Party Supplies & Tableware'
   - 'Aisle 13 - Celebrations, Balloons & Favors'
   - 'Aisle 15 - Cleaning & Paper Goods'
5. Cymbal Choice Store Brand Options:
   For grocery staples, seltzers, chips, tableware, and cleaning goods, provide a 'cymbalChoiceOption':
   { "name": "Cymbal Choice ...", "unitCost": number, "savingsPerUnit": number }
6. Categories MUST be one of:
   'food', 'drinks', 'tableware', 'decor', 'activities', 'cleanup_essentials'
7. Store suggestions MUST be one of:
   'supermarket', 'wholesale_club', 'party_discount', 'specialty_bakery', 'liquor_beverage', 'online_delivery'
8. Timelines MUST be one of:
   '1-week-before', '2-3-days-before', 'day-of'

OUTPUT FORMAT REQUIREMENTS:
Return valid, well-formed JSON conforming to this structure:
{
  "summary": {
    "eventTitle": string,
    "totalEstimatedCost": number,
    "budgetStatus": "under" | "on-target" | "over",
    "guestServingSummary": string,
    "keyThemes": [string],
    "potentialCymbalSavings": number
  },
  "items": [
    {
      "id": string (unique e.g. "item-1"),
      "name": string,
      "category": "food" | "drinks" | "tableware" | "decor" | "activities" | "cleanup_essentials",
      "quantity": number,
      "unit": string,
      "packageDescription": string,
      "estimatedUnitCost": number,
      "estimatedTotalCost": number,
      "storeSuggestion": "supermarket" | "wholesale_club" | "party_discount" | "specialty_bakery" | "liquor_beverage" | "online_delivery",
      "timeline": "1-week-before" | "2-3-days-before" | "day-of",
      "notes": string,
      "dietaryTag": string (optional),
      "aisle": string,
      "cymbalChoiceOption": {
        "name": string,
        "unitCost": number,
        "savingsPerUnit": number
      },
      "isEssential": boolean,
      "isPurchased": false
    }
  ],
  "tips": [
    {
      "title": string,
      "description": string,
      "type": "saving" | "portion" | "time" | "decor"
    }
  ],
  "timelineGuide": {
    "oneWeekBefore": [string],
    "twoDaysBefore": [string],
    "dayOf": [string]
  }
}
Provide a realistic list of 14-22 essential and festive items tailored strictly to the party brief and budget.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output:', responseText);
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    // Ensure IDs and default fields exist
    if (parsedData && Array.isArray(parsedData.items)) {
      parsedData.items = parsedData.items.map((item: any, index: number) => ({
        ...item,
        id: item.id || `gen-item-${index + 1}`,
        isPurchased: false,
        estimatedTotalCost: item.estimatedTotalCost || Math.round((item.quantity || 1) * (item.estimatedUnitCost || 5)),
      }));
    }

    return res.json(parsedData);
  } catch (err: any) {
    console.error('Error generating party plan:', err);
    // Graceful fallback to avoid leaving user hanging
    return res.json(generateFallbackPlan(req.body));
  }
});

// Endpoint: Shopping Agent Chat & Live List Modification
app.post('/api/agent-chat', async (req, res) => {
  try {
    const { userMessage, partyProfile, currentItems, chatHistory } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: `Here's my advice for your ${partyProfile.theme || 'party'}: When optimizing your shopping list, focus on buying tableware and non-perishables at discount wholesale outlets, and purchase ice on the day of the event. Let me know if you want to add or remove specific items!`,
        action: null,
      });
    }

    const prompt = `
You are the dedicated "Party Planner Shopping Agent".
The user is currently planning their party shopping list and asking you for recommendations, modifications, budget cuts, dietary substitutions, or vendor advice.

PARTY CONTEXT:
- Theme: ${partyProfile.theme} (${partyProfile.title})
- Guests: ${partyProfile.guestCount} (${partyProfile.adultCount} adults, ${partyProfile.kidCount} kids)
- Target Budget: $${partyProfile.budget}
- Dietary Needs: ${Array.isArray(partyProfile.dietaryRestrictions) ? partyProfile.dietaryRestrictions.join(', ') : partyProfile.dietaryRestrictions}

CURRENT SHOPPING ITEMS SUMMARY:
${JSON.stringify((currentItems || []).slice(0, 20).map((i: any) => ({ name: i.name, qty: i.quantity, unit: i.unit, cost: i.estimatedTotalCost, cat: i.category })))}

USER'S MESSAGE:
"${userMessage}"

INSTRUCTIONS:
1. Give a warm, practical, party-planner-smart response explaining exact recommendations or portion math.
2. IF the user asks to add, remove, or swap items, or cut budget, include a structured "suggestedAction" object.
Allowed action types:
- "add_item": provide "item" object ({ name, category, quantity, unit, estimatedUnitCost, estimatedTotalCost, storeSuggestion, timeline, dietaryTag, isEssential: true })
- "remove_items": provide "itemNamesToRemove": [string] (exact or fuzzy names to remove from list)
- "tips": provide shopping or vendor advice

Return JSON conforming to:
{
  "reply": "string (conversational, professional, expert advice)",
  "suggestedAction": {
    "type": "add_item" | "remove_items" | "none",
    "item": { ... },
    "itemNamesToRemove": [string]
  }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in agent chat:', err);
    return res.json({
      reply: "I've reviewed your request! For party shopping, remember that beverages and proteins usually consume 60% of your food & drink budget. Buying mixers in 2-liter bulk and utilizing high-yield side dishes like pasta salads or taco beans gives you the highest guest satisfaction per dollar.",
      suggestedAction: null,
    });
  }
});

// Endpoint: Quick Agent Optimizations (Budget Saver, Dietary Overhaul, Photo-Ready Decor)
app.post('/api/quick-optimize', async (req, res) => {
  try {
    const { actionType, partyProfile, currentItems } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        summaryMessage: 'Optimization applied standard portion formulas and discount store re-assignments.',
        updatedItems: currentItems,
      });
    }

    const prompt = `
You are the Party Planner Shopping Agent.
The user requested a quick optimization: "${actionType}".
Options:
- 'budget_cut': Identify 3-4 items to downsize or swap with cheaper alternatives to save 15-25% without hurting guest experience.
- 'allergy_safe': Add or tag dedicated gluten-free, nut-free, or vegan food items.
- 'upgrade_atmosphere': Enhance decor and festive tableware recommendations while keeping costs reasonable.

PARTY CONTEXT:
Guests: ${partyProfile.guestCount}, Budget: $${partyProfile.budget}, Theme: ${partyProfile.theme}

CURRENT ITEMS:
${JSON.stringify(currentItems)}

Return JSON:
{
  "summaryMessage": "Explanation of the strategic adjustments made",
  "itemsToAdd": [ ...new items if any... ],
  "itemNamesToRemove": [ ...items to remove if any... ],
  "itemsToUpdate": [ ...items with adjusted cost/quantity... ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() || '{}');
    return res.json(parsed);
  } catch (err) {
    console.error('Error in quick-optimize:', err);
    return res.status(500).json({ error: 'Failed to optimize' });
  }
});

// Endpoint: Finalize and Checkout with CymbalMart
app.post('/api/checkout-order', async (req, res) => {
  try {
    const { items, partyProfile, fulfillmentDetails } = req.body;
    const orderNumber = `CYMBAL-PARTY-${Math.floor(100000 + Math.random() * 900000)}`;
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.estimatedTotalCost || 0), 0);
    const cymbalChoiceSavings = items.reduce((sum: number, item: any) => {
      if (item.isCymbalChoice && item.cymbalChoiceOption) {
        return sum + (item.cymbalChoiceOption.savingsPerUnit * item.quantity);
      }
      return sum;
    }, 0);
    const tax = Math.round(subtotal * 0.0825 * 100) / 100;
    const finalTotal = Math.round((subtotal + tax) * 100) / 100;

    return res.json({
      success: true,
      orderNumber,
      status: 'confirmed',
      hostName: fulfillmentDetails?.hostName || 'Host',
      fulfillmentMethod: fulfillmentDetails?.fulfillmentMethod || 'curbside_pickup',
      storeLocation: fulfillmentDetails?.storeLocation || 'CymbalMart Supercenter #104 (Westside Market)',
      timeSlot: fulfillmentDetails?.timeSlot || 'Friday 4:00 PM - 5:00 PM (Curbside Bay 3)',
      placedAt: new Date().toISOString(),
      itemCount: items.length,
      subtotal,
      cymbalChoiceSavings,
      tax,
      finalTotal,
      confirmationMessage: `Order ${orderNumber} confirmed! Ready for ${fulfillmentDetails?.fulfillmentMethod === 'express_delivery' ? 'express doorstep delivery' : 'curbside pickup'} at CymbalMart. Your host checklist and aisle guide are prepared.`,
    });
  } catch (err) {
    console.error('Error processing checkout:', err);
    return res.status(500).json({ error: 'Failed to complete checkout' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Party Planner Shopping Agent server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
