import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsPath = path.resolve(__dirname, '../../data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const FIELD_CONFIG = [
  {
    key: 'gender',
    question: 'Who are you shopping for?',
    options: ['female', 'male'],
    patterns: {
      female: ['female', 'woman', 'women', 'girl', 'lady', 'ladies', 'wife', 'sister', 'mother'],
      male: ['male', 'man', 'men', 'boy', 'husband', 'brother', 'father']
    }
  },
  {
    key: 'occasion',
    question: 'What is the occasion?',
    options: ['eid', 'office', 'wedding', 'party', 'dinner', 'daily wear', 'university', 'travel'],
    patterns: {
      eid: ['eid', 'ramzan', 'ramadan'],
      office: ['office', 'work', 'meeting', 'professional', 'corporate'],
      wedding: ['wedding', 'mehndi', 'barat', 'walima', 'shaadi'],
      party: ['party', 'birthday'],
      dinner: ['dinner', 'date', 'restaurant'],
      'daily wear': ['daily', 'casual', 'everyday'],
      university: ['university', 'college', 'class'],
      travel: ['travel', 'trip', 'airport']
    }
  },
  {
    key: 'budgetMax',
    question: 'What is your budget range?',
    options: ['under 5000', '5000-10000', '10000-15000', '15000-25000', '25000+'],
    patterns: {}
  },
  {
    key: 'style',
    question: 'What style do you prefer?',
    options: ['elegant', 'modest', 'minimal', 'traditional', 'trendy', 'luxury', 'simple', 'bold', 'fusion'],
    patterns: {
      elegant: ['elegant', 'graceful', 'classy', 'soft'],
      modest: ['modest', 'covered', 'decent'],
      minimal: ['minimal', 'clean', 'plain', 'quiet'],
      traditional: ['traditional', 'eastern', 'ethnic', 'desi'],
      trendy: ['trendy', 'modern', 'fashionable'],
      luxury: ['luxury', 'premium', 'expensive', 'rich'],
      simple: ['simple', 'basic', 'normal'],
      bold: ['bold', 'statement', 'loud'],
      fusion: ['fusion', 'indo western', 'creative']
    }
  },
  {
    key: 'category',
    question: 'What clothing type do you want?',
    options: ['kurti', '2-piece suit', '3-piece suit', 'maxi', 'co-ord set', 'shirt/trouser', 'fusion outfit'],
    patterns: {
      kurti: ['kurti', 'kameez'],
      '2-piece suit': ['2 piece', '2-piece', 'two piece'],
      '3-piece suit': ['3 piece', '3-piece', 'three piece', 'dupatta'],
      maxi: ['maxi', 'gown'],
      'co-ord set': ['co ord', 'co-ord', 'coord'],
      'shirt/trouser': ['shirt', 'trouser', 'pants'],
      'fusion outfit': ['fusion', 'tunic']
    }
  },
  {
    key: 'colors',
    question: 'Any preferred colors?',
    options: ['pastel', 'black', 'white/ivory', 'neutral', 'green/blue', 'bold colors', 'earth tones', 'no preference'],
    patterns: {
      pastel: ['pastel', 'soft color', 'powder', 'mint', 'lavender', 'pink'],
      black: ['black', 'dark'],
      'white/ivory': ['white', 'ivory', 'cream'],
      neutral: ['neutral', 'beige', 'grey', 'gray'],
      'green/blue': ['green', 'blue', 'emerald', 'navy'],
      'bold colors': ['bold color', 'red', 'orange', 'bright'],
      'earth tones': ['earth', 'brown', 'beige', 'warm']
    }
  },
  {
    key: 'fit',
    question: 'What fit do you prefer?',
    options: ['modest', 'loose', 'regular', 'slim', 'structured', 'flowy'],
    patterns: {
      modest: ['modest', 'covered', 'decent'],
      loose: ['loose', 'relaxed', 'comfortable'],
      regular: ['regular', 'normal'],
      slim: ['slim', 'fitted'],
      structured: ['structured', 'sharp'],
      flowy: ['flowy', 'soft']
    }
  }
];

function normalize(text = '') {
  return String(text).toLowerCase().replace(/[,.;:!?]/g, ' ');
}

function extractBudget(text) {
  const n = normalize(text).replace(/,/g, '');
  const matches = [...n.matchAll(/(?:rs\.?|pkr)?\s*(\d{3,6})\s*(?:rs\.?|pkr|k)?/g)].map(m => Number(m[1]));
  if (n.includes('under') || n.includes('below') || n.includes('less than')) return matches[0] || null;
  if (n.includes('15k')) return 15000;
  if (n.includes('10k')) return 10000;
  if (n.includes('20k')) return 20000;
  if (matches.length) return Math.max(...matches);
  if (n.includes('under 5000')) return 5000;
  if (n.includes('5000-10000')) return 10000;
  if (n.includes('10000-15000')) return 15000;
  if (n.includes('15000-25000')) return 25000;
  return null;
}

function inferFields(text, existing = {}) {
  const profile = { ...existing };
  const n = normalize(text);

  const budget = extractBudget(text);
  if (budget) profile.budgetMax = budget;

  for (const field of FIELD_CONFIG) {
    if (field.key === 'budgetMax') continue;
    for (const [value, patterns] of Object.entries(field.patterns)) {
      if (patterns.some(p => n.includes(p))) {
        if (field.key === 'style' || field.key === 'colors') {
          profile[field.key] = Array.from(new Set([...(profile[field.key] || []), value]));
        } else {
          profile[field.key] = value;
        }
      }
    }
  }
  return profile;
}

function missingFields(profile) {
  const required = ['gender', 'occasion', 'budgetMax', 'style', 'category'];
  return required.filter(key => {
    const v = profile[key];
    return Array.isArray(v) ? v.length === 0 : !v;
  });
}

function nextQuestion(profile) {
  const missing = missingFields(profile);
  const next = FIELD_CONFIG.find(f => f.key === missing[0]);
  return next ? { key: next.key, question: next.question, options: next.options } : null;
}

function scoreProduct(product, profile) {
  let score = 0;
  const reasons = [];

  if (profile.gender && product.gender === profile.gender) { score += 20; reasons.push('matches the selected gender'); }
  if (profile.occasion && product.occasionTags.includes(profile.occasion)) { score += 22; reasons.push(`fits ${profile.occasion}`); }
  if (profile.category && product.category === profile.category) { score += 22; reasons.push(`matches ${profile.category}`); }
  if (profile.budgetMax && product.price <= profile.budgetMax) { score += 18; reasons.push('within your budget'); }

  const styles = Array.isArray(profile.style) ? profile.style : [profile.style].filter(Boolean);
  const styleMatches = styles.filter(s => product.styleTags.includes(s));
  score += styleMatches.length * 12;
  if (styleMatches.length) reasons.push(`matches ${styleMatches.join(' + ')} style`);

  const colors = Array.isArray(profile.colors) ? profile.colors : [profile.colors].filter(Boolean);
  const colorMatches = colors.filter(c => product.colors.includes(c) || (c === 'white/ivory' && product.colors.includes('ivory')));
  score += colorMatches.length * 8;
  if (colorMatches.length) reasons.push(`matches preferred color mood`);

  if (profile.fit && product.fitTags.includes(profile.fit)) { score += 8; reasons.push(`supports ${profile.fit} fit`); }

  if (profile.budgetMax && product.price > profile.budgetMax) score -= 20;
  return { ...product, score, matchReasons: reasons.slice(0, 4) };
}

function recommendProducts(profile, limit = 5) {
  return products
    .map(p => scoreProduct(p, profile))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score || a.price - b.price)
    .slice(0, limit);
}

function styleName(profile) {
  const s = Array.isArray(profile.style) ? profile.style : [profile.style].filter(Boolean);
  if (s.includes('modest') && s.includes('elegant')) return 'Soft Elegant Modest';
  if (s.includes('minimal')) return 'Clean Minimal Stylist';
  if (s.includes('bold') || s.includes('luxury')) return 'Statement Luxury';
  if (s.includes('fusion')) return 'Creative Fusion';
  if (s.includes('traditional')) return 'Classic Traditional';
  return 'Personalized Everyday Style';
}

export function handleStyleConversation({ message, profile = {} }) {
  const updatedProfile = inferFields(message, profile);
  const question = nextQuestion(updatedProfile);

  if (question) {
    return {
      type: 'question',
      profile: updatedProfile,
      assistantMessage: `Got it. ${question.question}`,
      question
    };
  }

  const recommendations = recommendProducts(updatedProfile);
  return {
    type: 'recommendations',
    profile: updatedProfile,
    styleProfileName: styleName(updatedProfile),
    assistantMessage: `I found ${recommendations.length} options for your ${styleName(updatedProfile)} profile.`,
    recommendations,
    stylingTips: buildStylingTips(updatedProfile)
  };
}

function buildStylingTips(profile) {
  const tips = [];
  if (profile.occasion) tips.push(`Keep the outfit aligned with ${profile.occasion}: polished, but not overdone.`);
  if (profile.colors?.length) tips.push(`Use your preferred color mood as the base and keep shoes/accessories neutral.`);
  if (profile.fit) tips.push(`Choose a ${profile.fit} fit so the look feels natural and comfortable.`);
  tips.push('Add only one strong accessory so the outfit looks intentional, not crowded.');
  return tips;
}

export function getProducts() {
  return products;
}
