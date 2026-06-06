# STYLISENSE — Complete Claude Code Build Instructions
# Save this file as CLAUDE.md in your project root
# Then run: claude
# Claude Code will read this file and build the entire system

---

## WHO YOU ARE

You are building STYLISENSE — a complete AI-powered personal styling web application at stylisense.com. Read this entire file before writing a single line of code. Follow every instruction exactly as written.

---

## WHAT YOU ARE BUILDING

STYLISENSE is a Next.js web application where users answer 6 simple conversational questions (one at a time, tappable options) and receive 3 AI-generated personalised outfit recommendations. Users can then click affiliate links to buy items directly from global brands.

**Core user journey:**
```
Landing Page → Click "Style Me Now"
→ 6-Question Quiz (one question at a time)
→ Loading Screen (AI generates outfits)
→ 3 Outfit Cards (with items, prices, affiliate links)
→ User buys → STYLISENSE earns affiliate commission
```

**Tech stack:**
- Frontend: Next.js 15 + TypeScript
- Styling: Tailwind CSS v3 + shadcn/ui
- AI Engine: Claude API (Anthropic SDK)
- Deployment: Vercel
- Fonts: Google Fonts (Cormorant Garamond, DM Mono, Outfit)

---

## STEP 1 — READ EXISTING FILES FIRST

Before doing anything else:
1. Run: `ls -la` to see current project structure
2. Read: `package.json` to see installed dependencies
3. Read: `app/globals.css` to see current styles
4. Read: `app/page.tsx` to see current landing page
5. Read: `tailwind.config.js` or `tailwind.config.ts` if it exists
6. Read: `.env.local` if it exists to see available keys

Only after reading all existing files — proceed with building.

---

## STEP 2 — INSTALL DEPENDENCIES

Run these commands:

```bash
npm install @anthropic-ai/sdk
npm install --save-dev @types/node
```

Verify these are already in package.json (from v0 generation):
- next
- react
- react-dom
- tailwindcss
- typescript
- shadcn/ui components

If anything is missing — install it.

---

## STEP 3 — DESIGN SYSTEM

Apply this design system to EVERY component without exception.

### CSS Variables — add to globals.css

```css
:root {
  --ink: #0e0c0a;
  --parchment: #f5f0e8;
  --warm: #e8dfc8;
  --gold: #b8943f;
  --gold-light: #d4af6a;
  --rust: #8b3a2a;
  --sage: #4a5e4a;
  --cream: #faf7f0;
  --muted: #6b6358;
  --border: rgba(184, 148, 63, 0.25);
  --card-bg: rgba(255, 255, 255, 0.03);
  --input-bg: rgba(255, 255, 255, 0.04);
}
```

### Tailwind Config — update tailwind.config.js

```javascript
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0e0c0a',
        parchment: '#f5f0e8',
        gold: '#b8943f',
        'gold-light': '#d4af6a',
        muted: '#6b6358',
        border: 'rgba(184,148,63,0.25)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['DM Mono', 'Courier New', 'monospace'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'spin-slow': 'spin 20s linear infinite',
        shimmer: 'shimmer 2s infinite',
        pulse: 'pulse 2s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### Google Fonts — update app/layout.tsx

```tsx
import { Cormorant_Garamond, DM_Mono, Outfit } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-dm-mono',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-outfit',
})
```

### Globals CSS Animations — add to app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Grain texture overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1000;
  opacity: 0.4;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.animate-fade-up { animation: fadeUp 0.8s ease forwards; }
.animate-fade-in { animation: fadeIn 0.6s ease forwards; }
```

---

## STEP 4 — FILE STRUCTURE

Create every single one of these files:

```
stylisense/
├── app/
│   ├── layout.tsx              ← Google Fonts + metadata + body bg
│   ├── page.tsx                ← Landing page (rebuild completely)
│   ├── globals.css             ← Design tokens + animations
│   ├── quiz/
│   │   └── page.tsx            ← Full quiz flow
│   ├── results/
│   │   └── page.tsx            ← Outfit results
│   └── api/
│       ├── style/
│       │   └── route.ts        ← Claude API endpoint
│       └── tryon/
│           └── route.ts        ← Try-on placeholder
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          ← Fixed top nav
│   │   └── Footer.tsx          ← Simple footer
│   ├── landing/
│   │   ├── Hero.tsx            ← Hero section
│   │   ├── Features.tsx        ← 6 feature cards
│   │   ├── HowItWorks.tsx      ← 4-step process
│   │   └── WaitlistForm.tsx    ← Email capture
│   ├── quiz/
│   │   ├── QuizContainer.tsx   ← Wrapper + progress
│   │   ├── QuizQuestion.tsx    ← Question text
│   │   ├── QuizOption.tsx      ← Tappable option card
│   │   └── QuizProgress.tsx    ← Gold progress bar
│   └── results/
│       ├── OutfitCard.tsx      ← Single outfit card
│       ├── OutfitItem.tsx      ← Single item row
│       ├── ColorSwatch.tsx     ← Color dot row
│       ├── BodyTypeTips.tsx    ← Collapsible tips
│       └── TryOnButton.tsx     ← Coming soon button
├── lib/
│   ├── anthropic.ts            ← Anthropic SDK client
│   ├── quiz-data.ts            ← All 6 questions + options
│   ├── types.ts                ← All TypeScript interfaces
│   └── utils.ts                ← Affiliate link generator
├── hooks/
│   ├── useQuiz.ts              ← Quiz state management
│   └── useOutfits.ts           ← Outfit data + loading state
├── .env.local.example          ← Environment variable template
└── README.md                   ← Setup + deployment guide
```

---

## STEP 5 — TYPE DEFINITIONS (lib/types.ts)

```typescript
export interface UserProfile {
  bodyType: string
  stylePreference: string
  colorPalette: string
  climate: string
  budget: string
  occasion: string
}

export interface OutfitItem {
  type: 'shirt' | 'top' | 'trousers' | 'shorts' | 'shoes' | 'accessory'
  name: string
  color: string
  colorHex: string
  price: number
  searchQuery: string
  brand?: string
}

export interface Outfit {
  id: string
  name: string
  description: string
  items: OutfitItem[]
  totalPrice: number
  bodyTypeTip: string
  occasionNote: string
  colorStory: string
}

export interface StyleRecommendation {
  outfits: Outfit[]
  generalTips: string[]
  avoidList: string[]
}

export interface QuizOption {
  label: string
  value: string
  description?: string
}

export interface QuizQuestion {
  id: number
  question: string
  subtext?: string
  field: keyof UserProfile
  options: QuizOption[]
}

export interface QuizState {
  currentQuestion: number
  answers: Partial<UserProfile>
  isComplete: boolean
  isLoading: boolean
  error: string | null
}
```

---

## STEP 6 — QUIZ DATA (lib/quiz-data.ts)

```typescript
import { QuizQuestion } from './types'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'How would you describe your body type?',
    subtext: 'Be honest — this helps us recommend the most flattering fits',
    field: 'bodyType',
    options: [
      { label: 'Slim / Athletic', value: 'slim_athletic',
        description: 'Lean build, visible muscle definition' },
      { label: 'Average / Medium build', value: 'average_medium',
        description: 'Neither slim nor heavy' },
      { label: 'Broad / Stocky', value: 'broad_stocky',
        description: 'Wide shoulders, solid frame' },
      { label: 'Large / Heavy build', value: 'large_heavy',
        description: 'Fuller figure, larger frame' },
    ],
  },
  {
    id: 2,
    question: "What's your everyday style?",
    subtext: 'Think about what you actually wear, not what you wish you wore',
    field: 'stylePreference',
    options: [
      { label: 'Smart / Business professional', value: 'smart_professional',
        description: 'Suits, dress shirts, formal shoes' },
      { label: 'Smart casual', value: 'smart_casual',
        description: 'Office-ready but relaxed' },
      { label: 'Casual / Everyday comfort', value: 'casual_comfort',
        description: 'Comfort-first, relaxed fits' },
      { label: 'Mix of everything', value: 'mixed',
        description: 'Depends on the day' },
    ],
  },
  {
    id: 3,
    question: 'Which colours do you naturally wear most?',
    subtext: 'Your natural preference — not your ideal',
    field: 'colorPalette',
    options: [
      { label: 'Dark tones', value: 'dark_tones',
        description: 'Navy, black, charcoal, deep brown' },
      { label: 'Neutral tones', value: 'neutral_tones',
        description: 'White, grey, beige, tan' },
      { label: 'Earth tones', value: 'earth_tones',
        description: 'Olive, rust, camel, forest green' },
      { label: 'No preference', value: 'no_preference',
        description: 'I wear anything' },
    ],
  },
  {
    id: 4,
    question: "What's your climate like?",
    subtext: 'This determines the fabrics we recommend',
    field: 'climate',
    options: [
      { label: 'Hot & humid year round', value: 'hot_humid',
        description: 'Think Karachi, Dubai, Singapore' },
      { label: 'Cool — layered climate', value: 'cool_layered',
        description: 'Think London, Toronto, Berlin' },
      { label: 'Mostly indoors with AC', value: 'indoor_ac',
        description: 'Office life, malls, controlled environments' },
      { label: 'Mixed — I travel frequently', value: 'mixed_travel',
        description: 'Different climates regularly' },
    ],
  },
  {
    id: 5,
    question: "What's your comfortable budget per outfit?",
    subtext: 'Complete outfit — top, bottom, and shoes',
    field: 'budget',
    options: [
      { label: 'Under $50', value: 'under_50',
        description: 'Budget-friendly picks' },
      { label: '$50 – $150', value: '50_to_150',
        description: 'Mid-range quality' },
      { label: '$150 – $300', value: '150_to_300',
        description: 'Premium brands' },
      { label: 'No strict budget', value: 'no_budget',
        description: 'Best quality regardless of price' },
    ],
  },
  {
    id: 6,
    question: 'What are you dressing for today?',
    subtext: 'This sets the formality and style direction',
    field: 'occasion',
    options: [
      { label: 'Everyday casual', value: 'everyday_casual',
        description: 'Errands, meetups, working from home' },
      { label: 'Office / Client meetings', value: 'office_meetings',
        description: 'Professional but approachable' },
      { label: 'Evening out / Dinner', value: 'evening_dinner',
        description: 'Restaurants, social events' },
      { label: 'Special occasion', value: 'special_occasion',
        description: 'Wedding, formal event, celebration' },
    ],
  },
]
```

---

## STEP 7 — ANTHROPIC CLIENT (lib/anthropic.ts)

```typescript
import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
```

---

## STEP 8 — UTILITY FUNCTIONS (lib/utils.ts)

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { UserProfile } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate affiliate search URL based on store and query
export function generateAffiliateLink(
  searchQuery: string,
  store: 'asos' | 'amazon' | 'uniqlo' = 'asos'
): string {
  const encodedQuery = encodeURIComponent(searchQuery)

  // TODO: Replace these base URLs with actual affiliate tracking URLs
  // once approved by Awin (ASOS, M&S) and Amazon Associates
  const stores = {
    asos: `https://www.asos.com/search/?q=${encodedQuery}`,
    amazon: `https://www.amazon.com/s?k=${encodedQuery}`,
    uniqlo: `https://www.uniqlo.com/uk/en/search?q=${encodedQuery}`,
  }

  return stores[store]
}

// Determine best store based on budget
export function getBestStore(
  budget: string
): 'asos' | 'amazon' | 'uniqlo' {
  if (budget === 'under_50') return 'uniqlo'
  if (budget === '50_to_150') return 'asos'
  if (budget === '150_to_300') return 'amazon'
  return 'asos'
}

// Format price display
export function formatPrice(price: number): string {
  return `$${price}`
}

// Generate outfit ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
```

---

## STEP 9 — CLAUDE API ROUTE (app/api/style/route.ts)

This is the most important file. Build it exactly as specified.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { UserProfile, StyleRecommendation } from '@/lib/types'
import { generateId } from '@/lib/utils'

// The system prompt that defines STYLISENSE's AI stylist personality
const SYSTEM_PROMPT = `You are STYLISENSE — a world-class AI personal stylist
with deep expertise in men's fashion, body type dressing, colour theory,
and global retail brands.

Your job is to generate highly personalised, practical, and stylish outfit
recommendations. You speak like a knowledgeable friend — warm, confident,
direct. Never use jargon. Never be generic. Every recommendation must be
specific to the exact user profile provided.

STRICT RULES:
1. Generate exactly 3 complete outfit recommendations
2. Each outfit must have exactly 3 items: a top, a bottom, and shoes
3. Every outfit must stay within the stated budget
4. All items must be appropriate for the stated climate and occasion
5. Colours must complement the user's stated palette preferences
6. colorHex must be a real, accurate hex code matching the item color
7. searchQuery must be 4-6 words someone would type on ASOS or Amazon
8. bodyTypeTip must be ONE specific actionable tip for that body type only
9. No two outfits should share the same top or shoes
10. generalTips must be 3 practical styling rules for their body type
11. avoidList must be 3 specific things that don't flatter their body type
12. All prices must add up correctly to totalPrice
13. occasionNote must explain specifically why this outfit suits the occasion
14. colorStory must explain why these specific colors work together

RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATION. NO PREAMBLE.
START YOUR RESPONSE WITH { AND END WITH }.`

// Build user prompt from profile
function buildUserPrompt(profile: UserProfile): string {
  const budgetMap: Record<string, string> = {
    under_50: 'under $50 total',
    '50_to_150': '$50 to $150 total',
    '150_to_300': '$150 to $300 total',
    no_budget: 'no strict budget — recommend best quality',
  }

  const bodyTypeMap: Record<string, string> = {
    slim_athletic: 'slim and athletic build',
    average_medium: 'average medium build',
    broad_stocky: 'broad and stocky build',
    large_heavy: 'large and heavy build',
  }

  return `Generate 3 outfit recommendations for this user:

Body type: ${bodyTypeMap[profile.bodyType] || profile.bodyType}
Style preference: ${profile.stylePreference.replace(/_/g, ' ')}
Colour preferences: ${profile.colorPalette.replace(/_/g, ' ')}
Climate: ${profile.climate.replace(/_/g, ' ')}
Budget per outfit: ${budgetMap[profile.budget] || profile.budget}
Occasion: ${profile.occasion.replace(/_/g, ' ')}

Return a JSON object matching this exact structure:
{
  "outfits": [
    {
      "id": "unique_string",
      "name": "Creative outfit name",
      "description": "One sentence why this works for them",
      "items": [
        {
          "type": "shirt",
          "name": "Specific item name e.g. Olive linen relaxed-fit shirt",
          "color": "Color name e.g. Olive green",
          "colorHex": "#6B8C3E",
          "price": 45,
          "searchQuery": "olive linen shirt men relaxed fit",
          "brand": "Optional brand suggestion"
        },
        {
          "type": "trousers",
          "name": "...",
          "color": "...",
          "colorHex": "...",
          "price": 55,
          "searchQuery": "..."
        },
        {
          "type": "shoes",
          "name": "...",
          "color": "...",
          "colorHex": "...",
          "price": 40,
          "searchQuery": "..."
        }
      ],
      "totalPrice": 140,
      "bodyTypeTip": "One specific tip for their body type",
      "occasionNote": "Why this outfit works for the occasion",
      "colorStory": "Why these colors work together"
    }
  ],
  "generalTips": [
    "Tip 1 for their body type",
    "Tip 2 for their body type",
    "Tip 3 for their body type"
  ],
  "avoidList": [
    "Thing to avoid 1",
    "Thing to avoid 2",
    "Thing to avoid 3"
  ]
}`
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const profile: UserProfile = body.profile

    // Validate required fields
    const requiredFields: (keyof UserProfile)[] = [
      'bodyType', 'stylePreference', 'colorPalette',
      'climate', 'budget', 'occasion'
    ]

    for (const field of requiredFields) {
      if (!profile[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Call Claude API
    let rawResponse: string = ''
    let attempts = 0
    const maxAttempts = 2

    while (attempts < maxAttempts) {
      try {
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: buildUserPrompt(profile),
            },
          ],
        })

        const content = message.content[0]
        if (content.type !== 'text') {
          throw new Error('Unexpected response type from Claude API')
        }

        rawResponse = content.text
        break
      } catch (apiError) {
        attempts++
        if (attempts >= maxAttempts) throw apiError
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Parse JSON response
    let recommendation: StyleRecommendation
    try {
      // Clean response in case of any markdown
      const cleanedResponse = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      recommendation = JSON.parse(cleanedResponse)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    // Validate response structure
    if (
      !recommendation.outfits ||
      recommendation.outfits.length !== 3 ||
      !recommendation.generalTips ||
      !recommendation.avoidList
    ) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI. Please try again.' },
        { status: 500 }
      )
    }

    // Add IDs if missing
    recommendation.outfits = recommendation.outfits.map(outfit => ({
      ...outfit,
      id: outfit.id || generateId(),
    }))

    return NextResponse.json({ recommendation })

  } catch (error) {
    console.error('Style API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
```

---

## STEP 10 — QUIZ HOOK (hooks/useQuiz.ts)

```typescript
'use client'

import { useState, useCallback } from 'react'
import { UserProfile, QuizState } from '@/lib/types'
import { QUIZ_QUESTIONS } from '@/lib/quiz-data'

const INITIAL_STATE: QuizState = {
  currentQuestion: 0,
  answers: {},
  isComplete: false,
  isLoading: false,
  error: null,
}

export function useQuiz() {
  const [state, setState] = useState<QuizState>(INITIAL_STATE)

  const currentQuestion = QUIZ_QUESTIONS[state.currentQuestion]
  const totalQuestions = QUIZ_QUESTIONS.length
  const progress = (state.currentQuestion / totalQuestions) * 100

  const selectOption = useCallback((value: string) => {
    setState(prev => {
      const newAnswers = {
        ...prev.answers,
        [currentQuestion.field]: value,
      }

      const isLastQuestion = prev.currentQuestion === totalQuestions - 1

      return {
        ...prev,
        answers: newAnswers,
        currentQuestion: isLastQuestion
          ? prev.currentQuestion
          : prev.currentQuestion + 1,
        isComplete: isLastQuestion,
      }
    })
  }, [currentQuestion, totalQuestions])

  const goBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestion: Math.max(0, prev.currentQuestion - 1),
      isComplete: false,
    }))
  }, [])

  const reset = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  return {
    state,
    currentQuestion,
    totalQuestions,
    progress,
    selectOption,
    goBack,
    reset,
    setLoading,
    setError,
  }
}
```

---

## STEP 11 — QUIZ PAGE (app/quiz/page.tsx)

Build the quiz as a full-screen experience:

**Layout:**
- Full viewport height: `min-h-screen bg-[#0e0c0a]`
- Centered content: `max-w-2xl mx-auto px-6`
- Progress bar at top: gold fill, animates smoothly
- Back button: top left, only visible after question 1
- Question counter: DM Mono, top right, muted color

**Question display:**
- Question text: Cormorant Garamond, 36-40px, parchment
- Subtext: Outfit font, 16px, muted, below question
- Options grid: single column, full width, gap-3

**Option card design:**
- Min height: 72px
- Background: rgba(255,255,255,0.03)
- Border: 1px solid rgba(184,148,63,0.15)
- Border radius: 4px
- Left side: option label in Outfit 16px
- Right side: description in muted 13px (if available)
- On hover: border-color rgba(184,148,63,0.5), background rgba(184,148,63,0.06)
- On selected: border-color #b8943f, background rgba(184,148,63,0.1), gold checkmark right
- Transition: all 0.2s ease
- After selecting: auto-advance after 350ms delay

**Transitions between questions:**
- Current slides left and fades out
- Next slides from right and fades in
- Duration: 400ms ease-in-out
- Use CSS classes with opacity and transform

**Loading screen (after question 6):**
- Full screen dark background
- Centered gold spinner (animated border)
- Rotating messages (change every 2 seconds):
  - "Analysing your style profile..."
  - "Matching colours to your palette..."
  - "Building your perfect outfits..."
  - "Adding the finishing touches..."
  - "Almost ready..."
- Call POST /api/style with complete UserProfile
- On success: save to sessionStorage key 'stylisense_recommendation', navigate to /results
- On error: show error message with retry button

```typescript
// Key implementation details for quiz page:

// 1. Store recommendation in sessionStorage
sessionStorage.setItem(
  'stylisense_recommendation',
  JSON.stringify(recommendation)
)

// 2. Store user profile too (for "redo" feature)
sessionStorage.setItem(
  'stylisense_profile',
  JSON.stringify(profile)
)

// 3. Navigate after storage
router.push('/results')
```

---

## STEP 12 — RESULTS PAGE (app/results/page.tsx)

**On mount:**
- Read from sessionStorage: `stylisense_recommendation`
- If null → redirect to /quiz
- Parse and display

**Page layout:**
- Background: #0e0c0a
- Header section: "Your Style, Curated." in Cormorant Garamond 52px
- Subheader: occasion + body type in DM Mono, muted, uppercase
- Three outfit cards: side by side desktop (grid-cols-3), stacked mobile

**OutfitCard:**
- Background: rgba(255,255,255,0.03)
- Border: 1px solid rgba(184,148,63,0.15)
- Top accent bar: 3px solid #b8943f
- Padding: 28px
- Outfit name: Cormorant Garamond 26px parchment
- Description: Outfit 14px muted, line-height 1.6
- Divider line: rgba(184,148,63,0.15)

**OutfitItem rows (3 per card):**
- Item type badge: DM Mono 9px uppercase letter-spaced, gold, bordered
- Item name: Outfit 14px parchment
- Color dot: 12px circle using colorHex
- Color name: muted 12px
- Price: gold 14px font-weight 500
- Entire row: clickable → opens affiliate link in new tab
- On hover: background rgba(255,255,255,0.03)

**Color swatches row:**
- 3 circles, 18px each, gap-2
- Using colorHex for each item
- First one active (gold ring): border 2px solid #b8943f
- Others: border 1px solid rgba(255,255,255,0.2)

**Total price:**
- "Complete look" label: DM Mono 10px muted
- Price: Cormorant Garamond 32px gold

**Body type tip box:**
- Background: rgba(184,148,63,0.06)
- Border-left: 3px solid rgba(184,148,63,0.4)
- Padding: 12px 16px
- Icon: ✦ in gold
- Text: Outfit 13px parchment

**Shop This Look button:**
- Full width
- Background: #b8943f
- Text: DM Mono 11px uppercase letter-spaced, #0e0c0a
- Padding: 14px
- On hover: background #d4af6a
- On click: opens ASOS search for first item

**Try On button:**
- Full width
- Border: 1px solid rgba(184,148,63,0.3)
- Text: DM Mono 11px, gold
- "Virtual Try-On — Coming Soon" with lock icon
- Disabled state, cursor not-allowed
- Tooltip on hover: "Join the waitlist for early access"

**Below the 3 cards:**

BodyTypeTips section:
- Collapsible accordion
- Title: "Style Rules for Your Body Type" in Cormorant Garamond 22px
- generalTips: numbered list with gold numbers
- avoidList: items with red ✕ prefix, slightly muted

Action buttons:
- "Not quite right? Retake the quiz" → /quiz
- "Start Over" → clear sessionStorage + /quiz

Waitlist CTA:
- Heading: "Want virtual try-on?"
- Subtext: "Join the waitlist — early access members get it free forever."
- Email input + "Join Waitlist" button
- Same styling as landing page form

---

## STEP 13 — LANDING PAGE (app/page.tsx)

Completely rebuild the landing page. Keep existing blog section if present. Add these sections:

**Navbar (fixed):**
- Logo: "Styli*sense*" — SENSE in gold italic Cormorant Garamond
- Right: "Try the Stylist →" button links to /quiz
- Background: transparent initially, dark on scroll
- Bottom border: 1px solid rgba(184,148,63,0.25)

**Hero (full viewport height, 2-column):**

Left column:
- Eyebrow: "● AI-Powered Personal Styling — Free Forever" in DM Mono gold
- Headline: "Style that knows you." — Cormorant Garamond 80px, parchment
- "you." on its own line in italic gold
- Subtext: "Answer 6 questions. Get 3 complete outfit recommendations. See yourself wearing them before you buy."
- Primary CTA: "Style Me Now →" → /quiz — gold button
- Secondary CTA: "See how it works ↓" → scrolls to how-it-works section

Right column (desktop only):
- Animated mockup of the quiz interface
- Show question card with options
- Subtle gold glow behind it

**Features (6 cards, 3 columns):**
01. AI Styling Intelligence — "Complete outfits chosen for your body, climate, and budget"
02. Virtual Try-On — "See yourself in every look before you buy" [Coming Soon badge]
03. Shop 850+ Brands — "ASOS, Nordstrom, Uniqlo and more — one click to checkout"
04. Built for Every Body — "Slim, athletic, heavy, tall, petite — real advice for your shape"
05. Avatar Mode — "No photo? Build a digital version of yourself" [Coming Soon badge]
06. Always Free — "We earn commission when you buy — at no cost to you"

Each card:
- Number in Cormorant Garamond 64px gold at 15% opacity
- Title in Cormorant Garamond 22px
- Description in Outfit 14px muted line-height 1.8
- Gold bottom border slides in from left on hover

**How It Works (4 steps):**
Left sticky column: "How it works." in Cormorant Garamond 52px, italic gold "works."
Right column: 4 steps with large faded numbers

Step 01: "Answer 6 quick questions" — body type, colours, climate, budget, occasion. 2 minutes. [tag: Style Quiz]
Step 02: "Get 3 curated outfits" — complete looks built for your body. [tag: AI Recommendations]
Step 03: "Try them on virtually" — upload your photo or use an avatar. [tag: Virtual Try-On]
Step 04: "Buy what you love" — one click to ASOS, Nordstrom, Uniqlo. [tag: Shop Instantly]

**Live Demo CTA:**
- Large centered section
- Heading: "See it in action."
- Subtext: "Takes 2 minutes. No account needed."
- "Style Me Now" button → /quiz
- Below: 5 feature pills (Free forever · No account · Virtual try-on · 850+ brands · All body types)

**Waitlist section:**
- Heading: "Your personal stylist, powered by AI."
- "powered by AI." in italic gold
- Email input form
- "247 people already on the waitlist"
- Avatar row showing 4 placeholder avatars

**Footer:**
- Logo left
- Copyright right: "© 2026 Stylisense · stylisense.com"
- Border top: 1px solid rgba(184,148,63,0.25)

---

## STEP 14 — ENVIRONMENT FILE

Create `.env.local.example`:
```
# Anthropic API Key
# Get yours at: https://console.anthropic.com
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Site URL (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://stylisense.com

# Affiliate Network IDs (add when approved)
# NEXT_PUBLIC_AWIN_ID=your_awin_publisher_id
# NEXT_PUBLIC_AMAZON_TRACKING_ID=your_amazon_associates_id
```

---

## STEP 15 — README

Create `README.md`:

```markdown
# STYLISENSE — AI Personal Stylist

stylisense.com — Answer 6 questions. Get 3 outfit recommendations.
Try them on virtually. Buy from 850+ global brands.

## Tech Stack
- Next.js 15 + TypeScript
- Tailwind CSS v3 + shadcn/ui
- Claude API (Anthropic) — AI styling engine
- Vercel — hosting and deployment

## Setup

1. Clone the repository
   git clone https://github.com/mamirbalouch/stylisense-sm.git
   cd stylisense-sm

2. Install dependencies
   npm install

3. Add environment variables
   cp .env.local.example .env.local
   # Edit .env.local and add your ANTHROPIC_API_KEY

4. Get your Anthropic API key
   - Go to console.anthropic.com
   - Create account → API Keys → Create Key
   - Copy key into .env.local

5. Run development server
   npm run dev
   # Open http://localhost:3000

## How It Works

1. User visits stylisense.com
2. Clicks "Style Me Now" → goes to /quiz
3. Answers 6 conversational questions (one at a time)
4. App sends UserProfile to /api/style endpoint
5. Claude API generates 3 outfit recommendations as JSON
6. Results saved to sessionStorage, user navigated to /results
7. User sees 3 outfit cards with items, prices, affiliate links
8. Clicks "Shop This Look" → opens ASOS/Amazon search in new tab

## Architecture

app/api/style/route.ts    ← Claude API integration (core AI)
lib/quiz-data.ts          ← All 6 quiz questions and options
lib/types.ts              ← TypeScript interfaces
hooks/useQuiz.ts          ← Quiz state management
app/quiz/page.tsx         ← Quiz flow UI
app/results/page.tsx      ← Outfit results UI

## Deployment

Push to GitHub → Vercel auto-deploys.

Add environment variables in Vercel:
Dashboard → Project → Settings → Environment Variables
Add: ANTHROPIC_API_KEY = your_key_here

## Affiliate Setup (Revenue)

1. Sign up at awin.com → apply for ASOS programme
2. Sign up at associates.amazon.com
3. Get your publisher/tracking IDs
4. Update lib/utils.ts generateAffiliateLink() with real affiliate URLs
5. Add IDs to .env.local

## Founder
Muhammad Amir Balouch
mamirbalouch@gmail.com
linkedin.com/in/mamirbalouch
```

---

## STEP 16 — CRITICAL RULES

Follow these without exception:

**Security:**
- Never hardcode ANTHROPIC_API_KEY anywhere in source code
- API key only accessed via process.env.ANTHROPIC_API_KEY in server-side code only
- Never expose API key to browser/client-side code

**TypeScript:**
- No `any` types anywhere
- Every component must have properly typed props
- Every function must have return types
- Run `npx tsc --noEmit` and fix all errors

**Error handling:**
- Every API call must have try/catch
- Every loading state must be handled in UI
- Network errors must show friendly messages, not raw errors
- Failed outfit generation must offer retry

**Performance:**
- No unnecessary re-renders
- Quiz options use useCallback
- Results page uses useMemo for affiliate link generation

**Accessibility:**
- All interactive elements have aria-labels
- Color contrast meets WCAG AA
- Quiz works with keyboard navigation
- Images have alt text

**No console.log in production:**
- Remove all console.log statements
- Use console.error only for genuine errors in catch blocks

---

## STEP 17 — BUILD AND DEPLOY

Run in this exact order:

```bash
# 1. Install any missing packages
npm install

# 2. Check TypeScript
npx tsc --noEmit
# Fix ALL errors before continuing

# 3. Build for production
npm run build
# Must complete with zero errors

# 4. Test locally
npm run dev
# Verify the complete user journey works:
# / → /quiz → loading → /results

# 5. Commit and push
git add .
git commit -m "feat: complete STYLISENSE AI styling platform

- 6-question progressive disclosure quiz
- Claude API outfit recommendation engine
- Results page with 3 outfit cards
- Affiliate link generation (ASOS/Amazon/Uniqlo)
- Dark luxury editorial design system
- Mobile responsive throughout
- TypeScript strict mode"

git push origin main
```

Vercel will auto-deploy. Check vercel.com/dashboard for deployment status.

---

## STEP 18 — VERIFY SUCCESS

After deployment, verify ALL of these work:

✅ stylisense.com loads with dark luxury design
✅ Clicking "Style Me Now" opens the quiz
✅ Quiz shows questions one at a time with smooth transitions
✅ Progress bar fills as questions are answered
✅ Back button navigates to previous question
✅ After question 6 — loading screen appears with rotating messages
✅ Claude API returns 3 outfit recommendations
✅ Results page shows 3 cards with real AI-generated content
✅ Each item shows name, color dot, price
✅ "Shop This Look" opens ASOS/Amazon in new tab
✅ "Try On" shows coming soon state
✅ Body type tips section collapses and expands
✅ "Start Over" clears sessionStorage and returns to quiz
✅ Mobile: quiz is full screen, options are large tap targets
✅ Mobile: results cards stack vertically
✅ No console errors in browser dev tools
✅ Vercel deployment shows "Ready" status

---

## PHASE 2 NOTES (Build Later — Not Now)

These features come after Phase 1 is live and working:

1. **Virtual Try-On** — LightX API integration
   - app/api/tryon/route.ts
   - User uploads photo
   - LightX takes photo + product image → returns try-on photo
   - Show result in a modal on the results page

2. **Avatar Builder** — Stable Diffusion via Replicate
   - User selects body type, skin tone, height sliders
   - Generates a photorealistic avatar
   - Try-on uses avatar instead of real photo

3. **User Accounts** — Saved outfits and style history
   - Auth via NextAuth.js
   - Database via Supabase (free tier)
   - Save favourite outfits, retake quiz for different occasions

4. **Premium Subscription** — £4.99/month
   - Unlimited outfit saves
   - Seasonal wardrobe planning
   - Priority try-on processing

5. **Real Affiliate Links** — Replace search URLs with tracked affiliate URLs
   - Awin publisher account → ASOS tracking link
   - Amazon Associates → product-level tracking links
   - Commission tracking dashboard

---

*End of STYLISENSE Build Instructions*
*Version 1.0 — Phase 1: Core AI Styling Platform*
*Founder: Muhammad Amir Balouch — stylisense.com*
