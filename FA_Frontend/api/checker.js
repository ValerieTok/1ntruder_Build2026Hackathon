const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const message = String(req.body?.message || '').trim()
  const context = String(req.body?.context || '').trim()
  const inputType = ['text', 'link', 'image'].includes(req.body?.inputType) ? req.body.inputType : 'text'

  if (!message && !context) {
    res.status(400).json({ error: 'Paste suspicious text, a link, or context before running analysis.' })
    return
  }

  try {
    const analysis = await analyzeWithOpenAI({ message, context, inputType })
    res.status(200).json({ analysis })
  } catch (error) {
    res.status(500).json({ error: getFriendlyOpenAIError(error) })
  }
}

async function analyzeWithOpenAI({ message, context, inputType }) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY missing.')
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: buildPrompt({ message, context, inputType }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'scam_analysis',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              riskLevel: { type: 'string', enum: ['Low', 'Medium', 'High', 'Unclear'] },
              scamType: { type: 'string' },
              redFlags: {
                type: 'array',
                items: { type: 'string' },
              },
              recommendedAction: { type: 'string' },
            },
            required: ['riskLevel', 'scamType', 'redFlags', 'recommendedAction'],
          },
        },
      },
    }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI request failed.')
  }

  return normalizeAnalysis(JSON.parse(getOutputText(payload)))
}

function buildPrompt({ message, context, inputType }) {
  return [
    'Check this submission for scam risk.',
    'Assess only the submitted content and return practical guidance for a Singapore user.',
    'Identify the risk level, likely scam type, red flags, and recommended action.',
    'If the content is too vague, use riskLevel "Unclear" and explain what information is missing.',
    '',
    `Input type: ${inputType}`,
    message ? `Submission:\n${message}` : '',
    context ? `Additional context:\n${context}` : '',
  ].filter(Boolean).join('\n\n')
}

function getOutputText(payload) {
  if (payload?.output_text) {
    return payload.output_text
  }

  const text = payload?.output
    ?.flatMap((item) => item.content || [])
    ?.map((item) => item.text || '')
    ?.join('')
    ?.trim()

  if (!text) {
    throw new Error('OpenAI returned no analysis text.')
  }

  return text
}

function normalizeAnalysis(result) {
  if (!result || typeof result !== 'object') {
    throw new Error('OpenAI returned an invalid analysis.')
  }

  return {
    riskLevel: String(result.riskLevel || 'Unclear'),
    scamType: String(result.scamType || 'Unclear'),
    redFlags: Array.isArray(result.redFlags) ? result.redFlags.map(String) : [],
    recommendedAction: String(result.recommendedAction || 'Verify through official channels before taking action.'),
  }
}

function getFriendlyOpenAIError(error) {
  const message = error.message || ''

  if (message.includes('OPENAI_API_KEY')) return 'OpenAI is not configured yet. Add OPENAI_API_KEY in Vercel environment variables.'
  if (/quota|billing|insufficient/i.test(message)) return 'OpenAI could not run the analysis because of billing or quota limits.'
  if (/api key|auth|unauthorized/i.test(message)) return 'OpenAI rejected the API key. Check OPENAI_API_KEY in Vercel.'
  if (/invalid analysis|no analysis text/i.test(message)) return 'OpenAI replied, but not in the expected result format.'

  return 'OpenAI analysis is unavailable right now. Please try again later.'
}
