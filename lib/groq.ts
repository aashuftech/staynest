const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'

export type GroqMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type GroqOptions = {
  temperature?: number
  maxTokens?: number
}

/**
 * Server-only Groq client. Keep GROQ_API_KEY in .env; never use a
 * NEXT_PUBLIC_ prefix, otherwise the key would be visible in the browser.
 */
export async function groqChat(
  messages: GroqMessage[],
  options: GroqOptions = {}
) {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured.')
  }

  const response = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      messages,
      temperature: options.temperature ?? 0.55,
      max_completion_tokens: options.maxTokens ?? 500,
    }),
    cache: 'no-store',
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error?.message || 'Groq request failed.'
    throw new Error(message)
  }

  const content = data?.choices?.[0]?.message?.content

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Groq returned an empty response.')
  }

  return content.trim()
}
