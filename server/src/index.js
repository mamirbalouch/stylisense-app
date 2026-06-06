import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { z } from 'zod';
import { handleStyleConversation, getProducts } from './styleEngine.js';
import { AI_JOBS, routeQuery, autoRoute, estimateMonthlyCost } from './lib/ai-router.js';
import { searchProduct, researchTrend, researchBrand } from './lib/perplexity.js';
import { completeTryOn, getGarmentCategory } from './lib/fashn.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// ── HEALTH ──────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'stylisense-api',
    features: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      perplexity: !!process.env.PERPLEXITY_API_KEY,
      fashn: !!process.env.FASHN_API_KEY,
    },
  });
});

// ── PRODUCTS (existing) ─────────────────────────────────────────────────────

app.get('/api/products', (req, res) => {
  res.json({ data: getProducts() });
});

// ── STYLE CHAT (existing conversational engine) ─────────────────────────────

const chatSchema = z.object({
  message: z.string().min(1),
  profile: z.record(z.any()).optional()
});

app.post('/api/style-chat', (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }
  const result = handleStyleConversation(parsed.data);
  res.json(result);
});

// ── AI STYLE (Claude-powered outfit generation) ─────────────────────────────

const STYLE_SYSTEM_PROMPT = `You are STYLISENSE — a world-class AI personal stylist with deep expertise in fashion, body type dressing, colour theory, and global retail brands including Pakistani brands like Khaadi, Sapphire, Limelight, Maria B, and Zara.

Your job is to generate highly personalised, practical, and stylish outfit recommendations. Speak like a knowledgeable friend — warm, confident, direct. Every recommendation must be specific to the exact user profile provided.

STRICT RULES:
1. Generate exactly 3 complete outfit recommendations
2. Each outfit must have exactly 3 items
3. Every outfit must stay within the stated budget
4. All items must be appropriate for the stated climate and occasion
5. Colours must complement the user's stated palette preferences
6. colorHex must be a real, accurate hex code matching the item color
7. searchQuery must be 4-6 words optimised for the chosen store's search
8. storeName must be one of: Khaadi, Sapphire, Limelight, Maria B, Zara, H&M, Daraz, ASOS, Amazon — pick whichever store actually sells that item
9. For Pakistani budgets prefer: Khaadi, Sapphire, Limelight, Maria B, Daraz
10. bodyTypeTip must be ONE specific actionable tip for that body type only
11. No two outfits should share the same top or shoes
12. generalTips must be 3 practical styling rules for their profile
13. avoidList must be 3 specific things that don't flatter their body type
14. All prices must add up correctly to totalPrice
15. occasionNote explains why this outfit suits the occasion
16. colorStory explains why these specific colors work together

RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATION. NO PREAMBLE.
START YOUR RESPONSE WITH { AND END WITH }.`;

function buildStylePrompt(profile) {
  const budgetMap = {
    under_50: 'under $50 total',
    '50_to_150': '$50 to $150 total',
    '150_to_300': '$150 to $300 total',
    no_budget: 'no strict budget — recommend best quality',
    under_5000: 'under PKR 5,000 total',
    '5000_10000': 'PKR 5,000 to PKR 10,000 total',
    '10000_15000': 'PKR 10,000 to PKR 15,000 total',
    '15000_25000': 'PKR 15,000 to PKR 25,000 total',
    '25000_plus': 'PKR 25,000 and above',
  };

  return `Generate 3 outfit recommendations for this user:

Gender: ${profile.gender || 'not specified'}
Occasion: ${profile.occasion || 'everyday'}
Style preference: ${Array.isArray(profile.style) ? profile.style.join(', ') : (profile.style || 'casual')}
Colour preferences: ${Array.isArray(profile.colors) ? profile.colors.join(', ') : (profile.colors || 'no preference')}
Budget: ${budgetMap[profile.budget] || profile.budget || profile.budgetMax || 'flexible'}
Category: ${profile.category || 'any clothing'}
Fit preference: ${profile.fit || 'regular'}
Body type: ${profile.bodyType || 'average'}

Return a JSON object with this exact structure:
{
  "outfits": [
    {
      "id": "unique_string",
      "name": "Creative outfit name",
      "description": "One sentence why this works for them",
      "items": [
        {
          "type": "top",
          "name": "Specific item name",
          "color": "Color name",
          "colorHex": "#hexcode",
          "price": 45,
          "searchQuery": "search query 4-6 words",
          "brand": "Brand name e.g. Khaadi",
          "storeName": "Khaadi"
        }
      ],
      "totalPrice": 140,
      "bodyTypeTip": "One specific styling tip",
      "occasionNote": "Why this fits the occasion",
      "colorStory": "Why these colors work together"
    }
  ],
  "generalTips": ["Tip 1", "Tip 2", "Tip 3"],
  "avoidList": ["Avoid 1", "Avoid 2", "Avoid 3"]
}`;
}

const styleSchema = z.object({
  profile: z.record(z.any()),
});

app.post('/api/style', async (req, res) => {
  const parsed = styleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: 'AI styling is not configured. Add ANTHROPIC_API_KEY to enable Claude-powered outfit generation.',
    });
  }

  try {
    const { anthropic } = await import('./lib/anthropic.js');
    const job = routeQuery('outfit_generation');

    let rawResponse = '';
    let attempts = 0;
    while (attempts < 2) {
      try {
        const message = await anthropic.messages.create({
          model: job.model,
          max_tokens: job.maxTokens || 2000,
          system: STYLE_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildStylePrompt(parsed.data.profile) }],
        });
        const content = message.content[0];
        if (content.type !== 'text') throw new Error('Unexpected response type');
        rawResponse = content.text;
        break;
      } catch (err) {
        attempts++;
        if (attempts >= 2) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    let recommendation;
    try {
      const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendation = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
    }

    if (!recommendation.outfits || recommendation.outfits.length !== 3) {
      return res.status(500).json({ error: 'Invalid AI response structure. Please try again.' });
    }

    recommendation.outfits = recommendation.outfits.map(outfit => ({
      ...outfit,
      id: outfit.id || Math.random().toString(36).substring(2, 9),
    }));

    res.json({ recommendation, model: job.model, provider: job.provider });
  } catch (error) {
    console.error('Style API error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── PRODUCT SEARCH (Perplexity) ─────────────────────────────────────────────

const searchSchema = z.object({
  searchQuery: z.string().min(1),
  budget: z.string().optional().default('flexible'),
  store: z.enum(['asos', 'amazon', 'uniqlo', 'any']).optional().default('any'),
});

app.post('/api/search', async (req, res) => {
  const parsed = searchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  if (!process.env.PERPLEXITY_API_KEY) {
    return res.status(503).json({
      error: 'Product search is not configured. Add PERPLEXITY_API_KEY to enable live product search.',
    });
  }

  try {
    const job = routeQuery('product_lookup');
    const { result, citations } = await searchProduct(
      parsed.data.searchQuery,
      parsed.data.budget,
      parsed.data.store
    );

    res.json({
      result,
      citations,
      searchedAt: new Date().toISOString(),
      model: job.model,
      provider: job.provider,
    });
  } catch (error) {
    console.error('Product search error:', error);
    res.status(500).json({ error: 'Product search failed. Please try again.' });
  }
});

// ── TREND & BRAND RESEARCH (Perplexity) ─────────────────────────────────────

const researchSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['trend', 'brand']).optional().default('trend'),
  context: z.string().optional(),
  brandAspect: z.enum(['sizing', 'quality', 'general']).optional().default('general'),
});

app.post('/api/research', async (req, res) => {
  const parsed = researchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  if (!process.env.PERPLEXITY_API_KEY) {
    return res.status(503).json({
      error: 'Research is not configured. Add PERPLEXITY_API_KEY to enable trend and brand research.',
    });
  }

  try {
    const { query, type, context, brandAspect } = parsed.data;

    if (type === 'brand') {
      const job = routeQuery('brand_research');
      const result = await researchBrand(query, brandAspect);
      return res.json({
        result,
        type: 'brand',
        model: job.model,
        provider: job.provider,
        searchedAt: new Date().toISOString(),
      });
    }

    const job = routeQuery('trend_research');
    const { summary, sources } = await researchTrend(query, context);
    res.json({
      summary,
      sources,
      type: 'trend',
      model: job.model,
      provider: job.provider,
      searchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Research API error:', error);
    res.status(500).json({ error: 'Research failed. Please try again.' });
  }
});

// ── VIRTUAL TRY-ON (FASHN) ──────────────────────────────────────────────────

const tryonSchema = z.object({
  personImageUrl: z.string().url(),
  garmentImageUrl: z.string().url(),
  itemType: z.string().min(1),
  outfitName: z.string().optional().default('My Outfit'),
  premium: z.boolean().optional().default(false),
});

app.post('/api/tryon', async (req, res) => {
  const parsed = tryonSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  if (!process.env.FASHN_API_KEY) {
    return res.status(503).json({
      error: 'Virtual try-on is not configured yet.',
      comingSoon: true,
      message: 'Add FASHN_API_KEY to enable virtual try-on.',
    });
  }

  try {
    const { personImageUrl, garmentImageUrl, itemType, outfitName, premium } = parsed.data;
    const jobType = premium ? 'tryon_max' : 'virtual_tryon';
    const job = routeQuery(jobType);
    const category = getGarmentCategory(itemType);

    const result = await completeTryOn({
      model_image: personImageUrl,
      garment_image: garmentImageUrl,
      category,
      model: job.model,
      mode: premium ? 'quality' : 'balanced',
    });

    res.json({
      imageUrl: result.imageUrl,
      predictionId: result.predictionId,
      processingTime: result.processingTime,
      outfitName,
      category,
      model: job.model,
      status: 'success',
    });
  } catch (error) {
    console.error('Try-on API error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Try-on failed. Please try again.',
    });
  }
});

// ── FOLLOW-UP QUESTIONS (auto-routed via Claude) ─────────────────────────────

const FOLLOWUP_SYSTEM_PROMPT = `You are STYLISENSE — a friendly AI personal stylist.
The user has already received outfit recommendations and may have follow-up questions.
Answer concisely and helpfully. Focus on practical styling advice.
If they want to change something about their outfits, suggest specific alternatives.
Keep responses under 150 words unless a detailed explanation is needed.
Never use jargon. Speak like a knowledgeable friend.`;

const askSchema = z.object({
  question: z.string().min(1),
  currentOutfits: z.array(z.any()).optional().default([]),
  userProfile: z.record(z.any()).optional().default({}),
});

app.post('/api/ask', async (req, res) => {
  const parsed = askSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: 'AI assistant is not configured. Add ANTHROPIC_API_KEY to enable follow-up questions.',
    });
  }

  try {
    const { anthropic } = await import('./lib/anthropic.js');
    const { question, currentOutfits, userProfile } = parsed.data;
    const job = autoRoute(question);

    if (job.provider !== 'anthropic') {
      return res.status(400).json({
        error: 'This question is better handled by a different endpoint.',
        suggestedEndpoint: job.provider === 'perplexity' ? '/api/research' : '/api/tryon',
        detectedIntent: job.use,
      });
    }

    const outfitContext = currentOutfits.length
      ? currentOutfits.map(o => `${o.name}: ${o.items?.map(i => i.name).join(', ') || ''}`).join('\n')
      : 'No outfits generated yet.';

    const profileContext = Object.keys(userProfile).length
      ? `User profile: ${JSON.stringify(userProfile)}`
      : '';

    const message = await anthropic.messages.create({
      model: job.model,
      max_tokens: job.maxTokens || 500,
      system: FOLLOWUP_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${profileContext}\n\nCurrent outfits:\n${outfitContext}\n\nUser question: ${question}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    res.json({
      answer: content.text,
      model: job.model,
      provider: job.provider,
      detectedIntent: job.use,
    });
  } catch (error) {
    console.error('Ask API error:', error);
    res.status(500).json({ error: 'Failed to answer question. Please try again.' });
  }
});

// ── AI ROUTER INFO ──────────────────────────────────────────────────────────

app.get('/api/router', (req, res) => {
  res.json({
    jobs: AI_JOBS,
    costEstimate: {
      '100_daily_users': estimateMonthlyCost(100),
      '1000_daily_users': estimateMonthlyCost(1000),
    },
  });
});

// ── START ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Stylisense API running on http://localhost:${PORT}`);
  console.log(`Features: Anthropic=${!!process.env.ANTHROPIC_API_KEY} Perplexity=${!!process.env.PERPLEXITY_API_KEY} FASHN=${!!process.env.FASHN_API_KEY}`);
});
