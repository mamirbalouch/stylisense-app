# STYLISENSE — AI Router Module
# Add this file to your project as: lib/ai-router.ts
# Then update your API routes to use routeQuery() instead of calling models directly

---

## INSTRUCTIONS FOR CLAUDE CODE

Read this entire file. Then:
1. Create lib/ai-router.ts with the complete code below
2. Create lib/perplexity.ts for Perplexity client
3. Update app/api/style/route.ts to use the router
4. Create app/api/search/route.ts for product search
5. Create app/api/research/route.ts for trend research
6. Update app/api/tryon/route.ts for FASHN integration
7. Create app/api/ask/route.ts for follow-up questions
8. Run npm run build and fix all errors
9. Push to git

---

## FILE 1: lib/types.ts — ADD THESE TYPES

Add these to your existing lib/types.ts:

```typescript
// AI Router Types
export type QueryType =
  | 'outfit_generation'
  | 'colour_change'
  | 'simple_question'
  | 'product_lookup'
  | 'price_check'
  | 'trend_research'
  | 'virtual_tryon'

export type AIProvider = 'anthropic' | 'perplexity' | 'fashn'

export interface AIJob {
  provider: AIProvider
  model: string
  maxTokens?: number
  use: string
  estimatedCost: string
}

export interface RouterConfig {
  [key: string]: AIJob
}

// Product Search Types
export interface ProductSearchResult {
  name: string
  brand: string
  price: number
  currency: string
  url: string
  imageUrl?: string
  available: boolean
  store: string
}

export interface ProductSearchResponse {
  results: ProductSearchResult[]
  query: string
  searchedAt: string
}

// Follow-up Question Types
export interface FollowUpRequest {
  question: string
  currentOutfits: Outfit[]
  userProfile: UserProfile
}

export interface FollowUpResponse {
  answer: string
  suggestedAction?: 'refine_outfits' | 'change_colour' | 'adjust_budget' | 'none'
  refinedOutfits?: Outfit[]
}

// Virtual Try-On Types
export interface TryOnRequest {
  personImageUrl: string
  garmentImageUrl: string
  category: 'tops' | 'bottoms' | 'full-body' | 'dresses'
  outfitName: string
}

export interface TryOnResponse {
  resultImageUrl: string
  predictionId: string
  processingTime: number
  status: 'success' | 'failed'
}

// Trend Research Types
export interface TrendResearchRequest {
  query: string
  context?: string
}

export interface TrendResearchResponse {
  summary: string
  keyPoints: string[]
  sources: string[]
  searchedAt: string
}
```

---

## FILE 2: lib/ai-router.ts — COMPLETE FILE

```typescript
import { QueryType, AIJob, RouterConfig } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// AI JOB DEFINITIONS
// Each job defines which model to use, why, and estimated cost per call
// ─────────────────────────────────────────────────────────────────────────────

export const AI_JOBS: RouterConfig = {

  // ── ANTHROPIC JOBS ──────────────────────────────────────────────────────────

  outfit_generation: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    maxTokens: 2000,
    use: 'Generate 3 personalised outfit recommendations from quiz answers',
    estimatedCost: '$0.006 per call',
    // Why Sonnet: Needs genuine fashion knowledge, colour theory,
    // body type rules, occasion dressing. JSON output must be
    // accurate and consistent. Quality directly affects conversion.
  },

  simple_question: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 500,
    use: 'Answer simple styling follow-up questions quickly',
    estimatedCost: '$0.0003 per call',
    // Why Haiku: Fast, cheap. Simple context questions like
    // "what belt works with this?" don't need Sonnet's power.
  },

  colour_change: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 800,
    use: 'Suggest the same outfit in different colour combinations',
    estimatedCost: '$0.0004 per call',
    // Why Haiku: Pattern recognition task, no deep reasoning needed.
  },

  outfit_refinement: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 1200,
    use: 'Refine outfits based on user feedback (too formal, cheaper, etc)',
    estimatedCost: '$0.0006 per call',
    // Why Haiku: Refinement is simpler than generation.
    // Context already exists — just adjust, don't recreate.
  },

  // ── PERPLEXITY JOBS ─────────────────────────────────────────────────────────

  product_lookup: {
    provider: 'perplexity',
    model: 'sonar',
    maxTokens: 1000,
    use: 'Find real product availability and current prices on ASOS/Amazon',
    estimatedCost: '$0.005 per call',
    // Why Perplexity Sonar: Claude has a training cutoff.
    // Product prices change daily. Perplexity searches the live web
    // and returns today's actual prices and stock availability.
  },

  price_check: {
    provider: 'perplexity',
    model: 'sonar',
    maxTokens: 500,
    use: 'Check if a specific item is within budget on major retailers',
    estimatedCost: '$0.005 per call',
    // Why Perplexity: Real-time pricing data only.
  },

  trend_research: {
    provider: 'perplexity',
    model: 'sonar-pro',
    maxTokens: 2000,
    use: 'Research current fashion trends, seasonal styles, brand popularity',
    estimatedCost: '$0.008 per call',
    // Why Sonar Pro: Multi-source deep research.
    // Takes 10-30 seconds but returns comprehensive, cited results.
    // Used for "what's trending for summer 2026?" type questions.
  },

  brand_research: {
    provider: 'perplexity',
    model: 'sonar',
    maxTokens: 800,
    use: 'Research specific brands, their sizing, quality reputation',
    estimatedCost: '$0.005 per call',
  },

  // ── FASHN JOBS ──────────────────────────────────────────────────────────────

  virtual_tryon: {
    provider: 'fashn',
    model: 'tryon-v1.6',
    use: 'Generate photorealistic try-on from person photo + garment image',
    estimatedCost: '$0.075 per image',
    // Why FASHN: Purpose-built virtual try-on model trained on
    // 18 million fashion examples. 5-17 second generation time.
    // Most expensive per-call but irreplaceable for the try-on feature.
  },

  tryon_max: {
    provider: 'fashn',
    model: 'tryon-max',
    use: 'Premium try-on for publishable e-commerce quality output',
    estimatedCost: '$0.15 per image',
    // Why tryon-max: Higher fidelity for premium subscribers only.
    // Standard users get tryon-v1.6, premium users get tryon-max.
  },

}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER FUNCTION
// Call this to get the correct AI job config for any query type
// ─────────────────────────────────────────────────────────────────────────────

export function routeQuery(queryType: QueryType): AIJob {
  const job = AI_JOBS[queryType]

  if (!job) {
    // Default to cheapest capable model if unknown query type
    console.warn(`Unknown query type: ${queryType}. Defaulting to simple_question.`)
    return AI_JOBS.simple_question
  }

  return job
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART AUTO-ROUTER
// Analyses the user's message and automatically picks the right model
// Use this when you don't know the query type in advance
// ─────────────────────────────────────────────────────────────────────────────

export function autoRoute(userMessage: string): AIJob {
  const msg = userMessage.toLowerCase()

  // Try-on requests
  if (
    msg.includes('try on') ||
    msg.includes('try this') ||
    msg.includes('see me wearing') ||
    msg.includes('how does this look on me')
  ) {
    return AI_JOBS.virtual_tryon
  }

  // Trend and research questions
  if (
    msg.includes('trending') ||
    msg.includes('trend') ||
    msg.includes('popular right now') ||
    msg.includes('what is in style') ||
    msg.includes('2026 fashion') ||
    msg.includes('this season')
  ) {
    return AI_JOBS.trend_research
  }

  // Product and price questions
  if (
    msg.includes('how much') ||
    msg.includes('price') ||
    msg.includes('cost') ||
    msg.includes('available') ||
    msg.includes('buy') ||
    msg.includes('where can i find') ||
    msg.includes('shop') ||
    msg.includes('asos') ||
    msg.includes('amazon') ||
    msg.includes('uniqlo')
  ) {
    return AI_JOBS.product_lookup
  }

  // Brand questions
  if (
    msg.includes('brand') ||
    msg.includes('quality') ||
    msg.includes('sizing') ||
    msg.includes('fit') && msg.includes('brand')
  ) {
    return AI_JOBS.brand_research
  }

  // Colour change requests
  if (
    msg.includes('in blue') ||
    msg.includes('in black') ||
    msg.includes('in green') ||
    msg.includes('different colour') ||
    msg.includes('different color') ||
    msg.includes('another colour') ||
    msg.includes('change the colour')
  ) {
    return AI_JOBS.colour_change
  }

  // Refinement requests
  if (
    msg.includes('too formal') ||
    msg.includes('too casual') ||
    msg.includes('cheaper') ||
    msg.includes('more expensive') ||
    msg.includes('not my style') ||
    msg.includes('something different') ||
    msg.includes('try again') ||
    msg.includes('redo')
  ) {
    return AI_JOBS.outfit_refinement
  }

  // Default: simple question via Haiku
  return AI_JOBS.simple_question
}

// ─────────────────────────────────────────────────────────────────────────────
// COST CALCULATOR
// Use this to estimate monthly API costs based on user volume
// ─────────────────────────────────────────────────────────────────────────────

export interface CostEstimate {
  dailyUsers: number
  monthlyOutfitGenerations: number
  monthlyProductLookups: number
  monthlyTryOns: number
  monthlyQuestions: number
  totalMonthlyCost: number
  breakdown: {
    anthropicSonnet: number
    anthropicHaiku: number
    perplexitySonar: number
    fashnTryon: number
  }
}

export function estimateMonthlyCost(
  dailyUsers: number,
  tryOnRate: number = 0.3  // 30% of users try on at least one outfit
): CostEstimate {

  const daysPerMonth = 30

  // Assumptions per user session
  const outfitGenerationsPerUser = 1      // Always 1 per session
  const productLookupsPerUser = 0.5       // 50% look up at least 1 product
  const tryOnsPerUser = tryOnRate         // Configurable (default 30%)
  const followUpQuestionsPerUser = 0.4   // 40% ask at least 1 question

  const monthlyUsers = dailyUsers * daysPerMonth

  const monthlyOutfitGenerations = monthlyUsers * outfitGenerationsPerUser
  const monthlyProductLookups = monthlyUsers * productLookupsPerUser
  const monthlyTryOns = monthlyUsers * tryOnsPerUser
  const monthlyQuestions = monthlyUsers * followUpQuestionsPerUser

  // Cost per call (USD)
  const SONNET_COST = 0.006
  const HAIKU_COST  = 0.0003
  const SONAR_COST  = 0.005
  const FASHN_COST  = 0.075

  const breakdown = {
    anthropicSonnet: monthlyOutfitGenerations * SONNET_COST,
    anthropicHaiku:  monthlyQuestions * HAIKU_COST,
    perplexitySonar: monthlyProductLookups * SONAR_COST,
    fashnTryon:      monthlyTryOns * FASHN_COST,
  }

  const totalMonthlyCost = Object.values(breakdown).reduce((a, b) => a + b, 0)

  return {
    dailyUsers,
    monthlyOutfitGenerations,
    monthlyProductLookups,
    monthlyTryOns,
    monthlyQuestions,
    totalMonthlyCost,
    breakdown,
  }
}
```

---

## FILE 3: lib/perplexity.ts — PERPLEXITY CLIENT

```typescript
// Perplexity API client for STYLISENSE
// Used for: product lookup, price check, trend research, brand research

if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY environment variable is not set')
}

const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai'

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PerplexityRequest {
  model: string
  messages: PerplexityMessage[]
  max_tokens?: number
  temperature?: number
  return_citations?: boolean
  search_recency_filter?: 'month' | 'week' | 'day' | 'hour'
}

export interface PerplexityResponse {
  id: string
  model: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  citations?: string[]
}

// Core Perplexity API call
export async function callPerplexity(
  request: PerplexityRequest
): Promise<PerplexityResponse> {
  const response = await fetch(`${PERPLEXITY_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Perplexity API error: ${response.status} — ${error}`)
  }

  return response.json()
}

// ── PRODUCT SEARCH ──────────────────────────────────────────────────────────

export async function searchProduct(
  searchQuery: string,
  budget: string,
  store: 'asos' | 'amazon' | 'uniqlo' | 'any' = 'any'
): Promise<string> {

  const storeContext = store === 'any'
    ? 'ASOS, Amazon, Uniqlo, H&M, or Zara'
    : store.toUpperCase()

  const response = await callPerplexity({
    model: 'sonar',
    max_tokens: 800,
    return_citations: true,
    search_recency_filter: 'week',
    messages: [
      {
        role: 'system',
        content: `You are a fashion product researcher for STYLISENSE.
Find real, currently available products matching the search query.
Return product name, price in USD, and direct URL.
Focus on ${storeContext}.
Be concise and specific. Return only real products with real URLs.`
      },
      {
        role: 'user',
        content: `Find: "${searchQuery}"
Budget: ${budget}
Store preference: ${storeContext}
Return: product name, price, URL, availability status.`
      }
    ]
  })

  return response.choices[0].message.content
}

// ── TREND RESEARCH ──────────────────────────────────────────────────────────

export async function researchTrend(
  query: string,
  context?: string
): Promise<{ summary: string; sources: string[] }> {

  const response = await callPerplexity({
    model: 'sonar-pro',
    max_tokens: 2000,
    return_citations: true,
    search_recency_filter: 'month',
    messages: [
      {
        role: 'system',
        content: `You are a fashion trend analyst for STYLISENSE.
Research current fashion trends accurately and concisely.
Focus on practical, actionable insights for everyday people.
Cite your sources. Be specific about current trends in 2026.`
      },
      {
        role: 'user',
        content: context
          ? `Context: ${context}\n\nResearch: ${query}`
          : query
      }
    ]
  })

  return {
    summary: response.choices[0].message.content,
    sources: response.citations || [],
  }
}

// ── BRAND RESEARCH ──────────────────────────────────────────────────────────

export async function researchBrand(
  brandName: string,
  aspect: 'sizing' | 'quality' | 'general' = 'general'
): Promise<string> {

  const aspectPrompt = {
    sizing: `Focus on: sizing accuracy, whether to size up or down, fit for different body types`,
    quality: `Focus on: fabric quality, durability, value for money, customer reviews`,
    general: `Focus on: brand overview, price range, best products, target demographic`,
  }

  const response = await callPerplexity({
    model: 'sonar',
    max_tokens: 600,
    return_citations: false,
    messages: [
      {
        role: 'system',
        content: `You are a fashion brand expert for STYLISENSE.
Provide accurate, current information about fashion brands.
Be concise and practical. Focus on what helps a shopper decide.`
      },
      {
        role: 'user',
        content: `Brand: ${brandName}
${aspectPrompt[aspect]}
Keep response under 150 words.`
      }
    ]
  })

  return response.choices[0].message.content
}
```

---

## FILE 4: lib/fashn.ts — FASHN VIRTUAL TRY-ON CLIENT

```typescript
// FASHN.ai API client for STYLISENSE virtual try-on
// Docs: https://docs.fashn.ai/

if (!process.env.FASHN_API_KEY) {
  console.warn('FASHN_API_KEY not set — virtual try-on will be disabled')
}

const FASHN_BASE_URL = 'https://api.fashn.ai/v1'
const POLL_INTERVAL_MS = 2000   // Check status every 2 seconds
const MAX_POLL_ATTEMPTS = 30    // Max 60 seconds total wait time

export type GarmentCategory = 'tops' | 'bottoms' | 'full-body' | 'dresses'

export interface TryOnJobRequest {
  model_image: string     // URL or base64 of person photo
  garment_image: string   // URL or base64 of garment photo
  category: GarmentCategory
  mode?: 'balanced' | 'quality' // balanced=faster, quality=better
}

export interface TryOnJobStatus {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string[]
  error?: string
}

// ── START TRY-ON JOB ───────────────────────────────────────────────────────

export async function startTryOnJob(
  request: TryOnJobRequest
): Promise<string> {

  if (!process.env.FASHN_API_KEY) {
    throw new Error('FASHN_API_KEY is not configured')
  }

  const response = await fetch(`${FASHN_BASE_URL}/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FASHN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_name: 'tryon-v1.6',
      model_image: request.model_image,
      garment_image: request.garment_image,
      category: request.category,
      mode: request.mode || 'balanced',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`FASHN API error starting job: ${response.status} — ${error}`)
  }

  const data = await response.json()

  if (!data.id) {
    throw new Error('FASHN API did not return a prediction ID')
  }

  return data.id
}

// ── POLL FOR RESULT ────────────────────────────────────────────────────────

export async function pollTryOnJob(
  predictionId: string
): Promise<TryOnJobStatus> {

  const response = await fetch(
    `${FASHN_BASE_URL}/status/${predictionId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.FASHN_API_KEY}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`FASHN API error polling job: ${response.status}`)
  }

  return response.json()
}

// ── COMPLETE TRY-ON (START + POLL UNTIL DONE) ──────────────────────────────

export async function completeTryOn(
  request: TryOnJobRequest
): Promise<{ imageUrl: string; predictionId: string; processingTime: number }> {

  const startTime = Date.now()

  // Start the job
  const predictionId = await startTryOnJob(request)

  // Poll until complete
  let attempts = 0

  while (attempts < MAX_POLL_ATTEMPTS) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))

    const status = await pollTryOnJob(predictionId)

    if (status.status === 'succeeded' && status.output?.[0]) {
      return {
        imageUrl: status.output[0],
        predictionId,
        processingTime: Date.now() - startTime,
      }
    }

    if (status.status === 'failed' || status.status === 'canceled') {
      throw new Error(
        `FASHN try-on failed: ${status.error || 'Unknown error'}`
      )
    }

    attempts++
  }

  throw new Error('FASHN try-on timed out after 60 seconds')
}

// ── HELPER: DETERMINE CATEGORY FROM ITEM TYPE ─────────────────────────────

export function getGarmentCategory(itemType: string): GarmentCategory {
  const type = itemType.toLowerCase()

  if (
    type.includes('shirt') ||
    type.includes('top') ||
    type.includes('jacket') ||
    type.includes('polo') ||
    type.includes('sweater') ||
    type.includes('hoodie')
  ) {
    return 'tops'
  }

  if (
    type.includes('trouser') ||
    type.includes('pant') ||
    type.includes('chino') ||
    type.includes('short') ||
    type.includes('jeans') ||
    type.includes('cargo')
  ) {
    return 'bottoms'
  }

  if (
    type.includes('dress') ||
    type.includes('gown') ||
    type.includes('skirt')
  ) {
    return 'dresses'
  }

  // Shoes and accessories don't support try-on
  // Fall back to full-body for anything else
  return 'full-body'
}
```

---

## FILE 5: app/api/style/route.ts — UPDATE WITH ROUTER

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { routeQuery } from '@/lib/ai-router'
import { UserProfile, StyleRecommendation } from '@/lib/types'
import { generateId } from '@/lib/utils'

// System prompt (same as before — no changes)
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
13. occasionNote explains why this outfit suits the occasion
14. colorStory explains why these specific colors work together

RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATION. NO PREAMBLE.`

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

Return StyleRecommendation JSON with 3 outfits, 3 generalTips, 3 avoidList items.
Each outfit: id, name, description, items (3), totalPrice, bodyTypeTip, occasionNote, colorStory.
Each item: type, name, color, colorHex, price, searchQuery, brand (optional).`
}

export async function POST(request: NextRequest) {
  try {
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

    // Get the correct AI job from router
    const job = routeQuery('outfit_generation')

    // Call Claude API using model from router
    let rawResponse = ''
    let attempts = 0

    while (attempts < 2) {
      try {
        const message = await anthropic.messages.create({
          model: job.model,                    // From router: claude-sonnet-4-6
          max_tokens: job.maxTokens || 2000,   // From router config
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildUserPrompt(profile) }],
        })

        const content = message.content[0]
        if (content.type !== 'text') throw new Error('Unexpected response type')
        rawResponse = content.text
        break
      } catch (err) {
        attempts++
        if (attempts >= 2) throw err
        await new Promise(r => setTimeout(r, 1000))
      }
    }

    // Parse and validate JSON response
    let recommendation: StyleRecommendation
    try {
      const cleaned = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      recommendation = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    if (!recommendation.outfits || recommendation.outfits.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid AI response. Please try again.' },
        { status: 500 }
      )
    }

    // Add IDs to outfits if missing
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

## FILE 6: app/api/search/route.ts — PRODUCT SEARCH ENDPOINT

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { searchProduct } from '@/lib/perplexity'
import { routeQuery } from '@/lib/ai-router'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      searchQuery,
      budget,
      store = 'any'
    }: {
      searchQuery: string
      budget: string
      store?: 'asos' | 'amazon' | 'uniqlo' | 'any'
    } = body

    if (!searchQuery) {
      return NextResponse.json(
        { error: 'searchQuery is required' },
        { status: 400 }
      )
    }

    // Log which job is being used
    const job = routeQuery('product_lookup')
    console.info(`Using ${job.provider}/${job.model} for product search`)

    const result = await searchProduct(searchQuery, budget, store)

    return NextResponse.json({
      result,
      searchedAt: new Date().toISOString(),
      model: job.model,
    })

  } catch (error) {
    console.error('Product search error:', error)
    return NextResponse.json(
      { error: 'Product search failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

---

## FILE 7: app/api/research/route.ts — TREND RESEARCH ENDPOINT

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { researchTrend, researchBrand } from '@/lib/perplexity'
import { routeQuery } from '@/lib/ai-router'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      query,
      type = 'trend',
      context,
      brandAspect = 'general'
    }: {
      query: string
      type?: 'trend' | 'brand'
      context?: string
      brandAspect?: 'sizing' | 'quality' | 'general'
    } = body

    if (!query) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      )
    }

    if (type === 'brand') {
      const job = routeQuery('brand_research')
      const { researchBrand } = await import('@/lib/perplexity')
      const result = await researchBrand(query, brandAspect)

      return NextResponse.json({
        result,
        type: 'brand',
        model: job.model,
        searchedAt: new Date().toISOString(),
      })
    }

    // Default: trend research
    const job = routeQuery('trend_research')
    const { summary, sources } = await researchTrend(query, context)

    return NextResponse.json({
      summary,
      sources,
      type: 'trend',
      model: job.model,
      searchedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Research API error:', error)
    return NextResponse.json(
      { error: 'Research failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

---

## FILE 8: app/api/tryon/route.ts — FASHN TRY-ON ENDPOINT

```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  completeTryOn,
  getGarmentCategory,
  TryOnJobRequest
} from '@/lib/fashn'
import { routeQuery } from '@/lib/ai-router'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      personImageUrl,
      garmentImageUrl,
      itemType,
      outfitName,
      premium = false
    }: {
      personImageUrl: string
      garmentImageUrl: string
      itemType: string
      outfitName: string
      premium?: boolean
    } = body

    // Validate inputs
    if (!personImageUrl || !garmentImageUrl || !itemType) {
      return NextResponse.json(
        { error: 'personImageUrl, garmentImageUrl, and itemType are required' },
        { status: 400 }
      )
    }

    // Check if FASHN is configured
    if (!process.env.FASHN_API_KEY) {
      return NextResponse.json(
        {
          error: 'Virtual try-on is not configured yet.',
          comingSoon: true,
          message: 'Join the waitlist for early access to virtual try-on.'
        },
        { status: 503 }
      )
    }

    // Route to correct model (standard vs premium)
    const jobType = premium ? 'tryon_max' : 'virtual_tryon'
    const job = routeQuery(jobType as any)

    // Determine garment category from item type
    const category = getGarmentCategory(itemType)

    // Build FASHN request
    const tryOnRequest: TryOnJobRequest = {
      model_image: personImageUrl,
      garment_image: garmentImageUrl,
      category,
      mode: premium ? 'quality' : 'balanced',
    }

    // Execute try-on (start job + poll until complete)
    const result = await completeTryOn(tryOnRequest)

    return NextResponse.json({
      imageUrl: result.imageUrl,
      predictionId: result.predictionId,
      processingTime: result.processingTime,
      outfitName,
      category,
      model: job.model,
      status: 'success',
    })

  } catch (error) {
    console.error('Try-on API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'Try-on failed. Please try again.'
      },
      { status: 500 }
    )
  }
}
```

---

## FILE 9: app/api/ask/route.ts — FOLLOW-UP QUESTIONS ENDPOINT

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { autoRoute, routeQuery } from '@/lib/ai-router'
import { Outfit, UserProfile } from '@/lib/types'

const FOLLOWUP_SYSTEM_PROMPT = `You are STYLISENSE — a friendly AI personal stylist.
The user has already received outfit recommendations and may have follow-up questions.
Answer concisely and helpfully. Focus on practical styling advice.
If they want to change something about their outfits, suggest specific alternatives.
Keep responses under 150 words unless a detailed explanation is needed.
Never use jargon. Speak like a knowledgeable friend.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      question,
      currentOutfits,
      userProfile
    }: {
      question: string
      currentOutfits: Outfit[]
      userProfile: UserProfile
    } = body

    if (!question) {
      return NextResponse.json(
        { error: 'question is required' },
        { status: 400 }
      )
    }

    // Auto-route based on question content
    const job = autoRoute(question)

    // Build context from current outfits
    const outfitContext = currentOutfits
      .map(o => `${o.name}: ${o.items.map(i => i.name).join(', ')}`)
      .join('\n')

    const userContext = `User profile: ${userProfile.bodyType} build,
${userProfile.colorPalette} colours, ${userProfile.climate} climate,
${userProfile.occasion} occasion, ${userProfile.budget} budget`

    // Call the routed model
    const message = await anthropic.messages.create({
      model: job.model,
      max_tokens: job.maxTokens || 500,
      system: FOLLOWUP_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${userContext}

Current outfits:
${outfitContext}

User question: ${question}`
        }
      ]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return NextResponse.json({
      answer: content.text,
      model: job.model,
      provider: job.provider,
    })

  } catch (error) {
    console.error('Ask API error:', error)
    return NextResponse.json(
      { error: 'Failed to answer question. Please try again.' },
      { status: 500 }
    )
  }
}
```

---

## FILE 10: .env.local.example — UPDATE WITH ALL KEYS

```bash
# ── ANTHROPIC ──────────────────────────────────────────────────────────────
# Get from: https://console.anthropic.com
# Used for: outfit generation (Sonnet), follow-up questions (Haiku)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# ── PERPLEXITY ─────────────────────────────────────────────────────────────
# Get from: https://perplexity.ai/settings/api
# Used for: product search (Sonar), trend research (Sonar Pro)
PERPLEXITY_API_KEY=pplx-your-key-here

# ── FASHN ──────────────────────────────────────────────────────────────────
# Get from: https://fashn.ai/dashboard
# Used for: virtual try-on (tryon-v1.6)
# Leave empty to show "Coming Soon" state — no errors will occur
FASHN_API_KEY=your-fashn-key-here

# ── SITE ───────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://stylisense.com

# ── AFFILIATE (Add when approved) ─────────────────────────────────────────
# NEXT_PUBLIC_AWIN_PUBLISHER_ID=your-awin-id
# NEXT_PUBLIC_AMAZON_TRACKING_ID=your-amazon-associates-id
```

---

## VERIFICATION CHECKLIST

After building all files, verify:

✅ lib/ai-router.ts exists with routeQuery() and autoRoute()
✅ lib/perplexity.ts exists with searchProduct() and researchTrend()
✅ lib/fashn.ts exists with completeTryOn() and getGarmentCategory()
✅ app/api/style/route.ts uses routeQuery('outfit_generation')
✅ app/api/search/route.ts uses Perplexity for product lookup
✅ app/api/research/route.ts uses Perplexity Sonar Pro for trends
✅ app/api/tryon/route.ts integrates FASHN with graceful fallback
✅ app/api/ask/route.ts uses autoRoute() for smart model selection
✅ .env.local.example has all 3 API keys documented
✅ npm run build passes with zero TypeScript errors
✅ If FASHN_API_KEY is missing — try-on shows "Coming Soon" not an error
✅ If PERPLEXITY_API_KEY is missing — search endpoints return clear error
✅ git add . && git commit -m "feat: AI router with Anthropic, Perplexity, FASHN" && git push

---

## COST REFERENCE

| Endpoint | Model Used | Cost Per Call | When Called |
|---|---|---|---|
| /api/style | claude-sonnet-4-6 | ~$0.006 | Every quiz completion |
| /api/ask | claude-haiku-4-5 | ~$0.0003 | Follow-up questions |
| /api/search | perplexity/sonar | ~$0.005 | Product lookups |
| /api/research | perplexity/sonar-pro | ~$0.008 | Trend queries |
| /api/tryon | fashn/tryon-v1.6 | ~$0.075 | Try-on clicks |

Monthly cost at 1,000 daily users (30% try-on rate): ~$2,700/month
Monthly affiliate revenue at 1% conversion × $80 AOV × 7%: ~$1,680/month
Break-even: ~3,000 daily users

---

*STYLISENSE AI Router — Phase 1 Complete*
*Models: Claude Sonnet + Haiku + Perplexity Sonar + FASHN*
*Founder: Muhammad Amir Balouch — stylisense.com*
