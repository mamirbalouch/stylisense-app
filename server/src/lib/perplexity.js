// Perplexity API client for STYLISENSE
// Used for: product lookup, price check, trend research, brand research

const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai'

export async function callPerplexity(request) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY environment variable is not set')
  }

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

export async function searchProduct(searchQuery, budget, store = 'any') {
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
Return product name, price, and direct URL.
Focus on ${storeContext}.
Be concise and specific. Return only real products with real URLs.`,
      },
      {
        role: 'user',
        content: `Find: "${searchQuery}"
Budget: ${budget}
Store preference: ${storeContext}
Return: product name, price, URL, availability status.`,
      },
    ],
  })

  return {
    result: response.choices[0].message.content,
    citations: response.citations || [],
  }
}

export async function researchTrend(query, context) {
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
Cite your sources. Be specific about current trends in 2026.`,
      },
      {
        role: 'user',
        content: context ? `Context: ${context}\n\nResearch: ${query}` : query,
      },
    ],
  })

  return {
    summary: response.choices[0].message.content,
    sources: response.citations || [],
  }
}

export async function researchBrand(brandName, aspect = 'general') {
  const aspectPrompt = {
    sizing: 'Focus on: sizing accuracy, whether to size up or down, fit for different body types',
    quality: 'Focus on: fabric quality, durability, value for money, customer reviews',
    general: 'Focus on: brand overview, price range, best products, target demographic',
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
Be concise and practical. Focus on what helps a shopper decide.`,
      },
      {
        role: 'user',
        content: `Brand: ${brandName}
${aspectPrompt[aspect] || aspectPrompt.general}
Keep response under 150 words.`,
      },
    ],
  })

  return response.choices[0].message.content
}
