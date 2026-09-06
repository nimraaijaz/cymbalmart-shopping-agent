// Party Catering & Shopping Formulas
export interface PartyMathEstimates {
  appetizerPieces: number;
  proteinLbs: number;
  drinksTotal: number;
  alcoholicDrinks: number;
  nonAlcoholicDrinks: number;
  iceLbs: number;
  iceBags10Lb: number;
  platesEstimate: number;
  cupsEstimate: number;
  napkinsEstimate: number;
  dessertServings: number;
}

export function calculatePartyFormulas(
  guestCount: number,
  adultCount: number,
  kidCount: number,
  durationHours: number,
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
): PartyMathEstimates {
  const guests = Math.max(1, guestCount);
  const adults = Math.max(0, adultCount);
  const kids = Math.max(0, kidCount);
  const hours = Math.max(1, durationHours);

  // 1. Drinks: 2 drinks in the first hour, 1 drink each subsequent hour
  const drinksPerPerson = 2 + (hours - 1);
  const drinksTotal = guests * drinksPerPerson;
  const adultPortionRatio = adults / guests;
  // Non-alcoholic is at least 40% for all-adults, higher if kids present
  const nonAlcoholicRatio = kids > 0 ? 0.55 : 0.4;
  const nonAlcoholicDrinks = Math.round(drinksTotal * nonAlcoholicRatio);
  const alcoholicDrinks = Math.max(0, drinksTotal - nonAlcoholicDrinks);

  // 2. Ice: 1.5 lbs per person for moderate climate, 2.0 if longer than 4 hours
  const iceRatePerPerson = hours > 4 ? 2.0 : 1.5;
  const iceLbs = Math.round(guests * iceRatePerPerson);
  const iceBags10Lb = Math.ceil(iceLbs / 10);

  // 3. Food:
  // Appetizers: 4-6 pieces per hour for cocktail/light party, or 6-8 total if dinner served
  const isMealTime = timeOfDay === 'evening' || timeOfDay === 'afternoon';
  const appetizerPieces = Math.round(guests * (isMealTime ? 5 : 8));

  // Protein: 0.4 lbs per adult (6.5 oz), 0.25 lbs per kid (4 oz)
  const proteinLbs = Number(((adults * 0.4) + (kids * 0.25)).toFixed(1));

  // 4. Tableware buffers:
  // Plates: 1.5 per person (main + seconds/dessert)
  const platesEstimate = Math.ceil(guests * 1.5);
  // Cups: 2.5 per person (people lose cups or switch drinks)
  const cupsEstimate = Math.ceil(guests * 2.5);
  // Napkins: 3.5 per person
  const napkinsEstimate = Math.ceil(guests * 3.5);

  // 5. Desserts: 1.25 servings per person
  const dessertServings = Math.ceil(guests * 1.25);

  return {
    appetizerPieces,
    proteinLbs,
    drinksTotal,
    alcoholicDrinks,
    nonAlcoholicDrinks,
    iceLbs,
    iceBags10Lb,
    platesEstimate,
    cupsEstimate,
    napkinsEstimate,
    dessertServings,
  };
}

export function formatCurrency(val: number): string {
  const hasDecimals = Math.abs(val % 1) > 0.009;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(val);
}
