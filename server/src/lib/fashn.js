// FASHN.ai API client for STYLISENSE virtual try-on

const FASHN_BASE_URL = 'https://api.fashn.ai/v1'
const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 30

export function getGarmentCategory(itemType) {
  const type = String(itemType).toLowerCase()

  if (
    type.includes('shirt') ||
    type.includes('top') ||
    type.includes('jacket') ||
    type.includes('polo') ||
    type.includes('sweater') ||
    type.includes('hoodie') ||
    type.includes('blouse') ||
    type.includes('kurti') ||
    type.includes('kameez')
  ) return 'tops'

  if (
    type.includes('trouser') ||
    type.includes('pant') ||
    type.includes('chino') ||
    type.includes('short') ||
    type.includes('jeans') ||
    type.includes('cargo') ||
    type.includes('salwar')
  ) return 'bottoms'

  if (
    type.includes('dress') ||
    type.includes('gown') ||
    type.includes('skirt') ||
    type.includes('maxi') ||
    type.includes('suit')
  ) return 'dresses'

  return 'full-body'
}

export async function startTryOnJob(request) {
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
      model_name: request.model || 'tryon-v1.6',
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
  if (!data.id) throw new Error('FASHN API did not return a prediction ID')
  return data.id
}

export async function pollTryOnJob(predictionId) {
  const response = await fetch(`${FASHN_BASE_URL}/status/${predictionId}`, {
    headers: { 'Authorization': `Bearer ${process.env.FASHN_API_KEY}` },
  })

  if (!response.ok) {
    throw new Error(`FASHN API error polling job: ${response.status}`)
  }

  return response.json()
}

export async function completeTryOn(request) {
  const startTime = Date.now()
  const predictionId = await startTryOnJob(request)

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
      throw new Error(`FASHN try-on failed: ${status.error || 'Unknown error'}`)
    }

    attempts++
  }

  throw new Error('FASHN try-on timed out after 60 seconds')
}
