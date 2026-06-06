// AI Router — maps query types to the correct AI provider and model

export const AI_JOBS = {

  // ── ANTHROPIC ──────────────────────────────────────────────────────────────

  outfit_generation: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    maxTokens: 2000,
    use: 'Generate 3 personalised outfit recommendations from quiz answers',
    estimatedCost: '$0.006 per call',
  },

  simple_question: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 500,
    use: 'Answer simple styling follow-up questions quickly',
    estimatedCost: '$0.0003 per call',
  },

  colour_change: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 800,
    use: 'Suggest the same outfit in different colour combinations',
    estimatedCost: '$0.0004 per call',
  },

  outfit_refinement: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 1200,
    use: 'Refine outfits based on user feedback',
    estimatedCost: '$0.0006 per call',
  },

  // ── PERPLEXITY ─────────────────────────────────────────────────────────────

  product_lookup: {
    provider: 'perplexity',
    model: 'sonar',
    maxTokens: 1000,
    use: 'Find real product availability and current prices',
    estimatedCost: '$0.005 per call',
  },

  price_check: {
    provider: 'perplexity',
    model: 'sonar',
    maxTokens: 500,
    use: 'Check if a specific item is within budget on major retailers',
    estimatedCost: '$0.005 per call',
  },

  trend_research: {
    provider: 'perplexity',
    model: 'sonar-pro',
    maxTokens: 2000,
    use: 'Research current fashion trends, seasonal styles, brand popularity',
    estimatedCost: '$0.008 per call',
  },

  brand_research: {
    provider: 'perplexity',
    model: 'sonar',
    maxTokens: 800,
    use: 'Research specific brands, their sizing, quality reputation',
    estimatedCost: '$0.005 per call',
  },

  // ── FASHN ──────────────────────────────────────────────────────────────────

  virtual_tryon: {
    provider: 'fashn',
    model: 'tryon-v1.6',
    use: 'Generate photorealistic try-on from person photo + garment image',
    estimatedCost: '$0.075 per image',
  },

  tryon_max: {
    provider: 'fashn',
    model: 'tryon-max',
    use: 'Premium try-on for publishable e-commerce quality output',
    estimatedCost: '$0.15 per image',
  },
}

export function routeQuery(queryType) {
  const job = AI_JOBS[queryType]
  if (!job) {
    console.warn(`Unknown query type: ${queryType}. Defaulting to simple_question.`)
    return AI_JOBS.simple_question
  }
  return job
}

export function autoRoute(userMessage) {
  const msg = userMessage.toLowerCase()

  if (
    msg.includes('try on') ||
    msg.includes('try this') ||
    msg.includes('see me wearing') ||
    msg.includes('how does this look on me')
  ) return AI_JOBS.virtual_tryon

  if (
    msg.includes('trending') ||
    msg.includes('trend') ||
    msg.includes('popular right now') ||
    msg.includes('what is in style') ||
    msg.includes('2026 fashion') ||
    msg.includes('this season')
  ) return AI_JOBS.trend_research

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
    msg.includes('uniqlo') ||
    msg.includes('khaadi') ||
    msg.includes('sapphire') ||
    msg.includes('limelight')
  ) return AI_JOBS.product_lookup

  if (
    msg.includes('brand') ||
    msg.includes('quality') ||
    msg.includes('sizing')
  ) return AI_JOBS.brand_research

  if (
    msg.includes('in blue') ||
    msg.includes('in black') ||
    msg.includes('in green') ||
    msg.includes('different colour') ||
    msg.includes('different color') ||
    msg.includes('another colour') ||
    msg.includes('change the colour') ||
    msg.includes('change color')
  ) return AI_JOBS.colour_change

  if (
    msg.includes('too formal') ||
    msg.includes('too casual') ||
    msg.includes('cheaper') ||
    msg.includes('more expensive') ||
    msg.includes('not my style') ||
    msg.includes('something different') ||
    msg.includes('try again') ||
    msg.includes('redo')
  ) return AI_JOBS.outfit_refinement

  return AI_JOBS.simple_question
}

export function estimateMonthlyCost(dailyUsers, tryOnRate = 0.3) {
  const daysPerMonth = 30
  const monthlyUsers = dailyUsers * daysPerMonth

  const monthlyOutfitGenerations = monthlyUsers * 1
  const monthlyProductLookups = monthlyUsers * 0.5
  const monthlyTryOns = monthlyUsers * tryOnRate
  const monthlyQuestions = monthlyUsers * 0.4

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
