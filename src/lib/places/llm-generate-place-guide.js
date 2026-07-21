import {
  PLACE_GUIDE_CATEGORY,
  PLACE_GUIDE_PROMPT_VERSION,
  PLACE_GUIDE_REQUIRED_H2,
} from '@/constants/place-content';
import { buildStubPlaceGuide } from '@/lib/places/stub-place-guide';

/**
 * @returns {'stub' | 'gemini' | 'openai' | 'off'}
 */
function resolveLlmMode() {
  const mode = String(process.env.PLACE_CONTENT_LLM_MODE || '').toLowerCase();
  if (mode === 'stub' || mode === 'gemini' || mode === 'openai' || mode === 'off') {
    return mode;
  }

  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return 'gemini';
  }

  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  }

  if (process.env.NODE_ENV === 'test') {
    return 'stub';
  }

  return 'off';
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
}

/**
 * @param {object} pack
 */
function buildSystemPrompt() {
  return [
    'You are Meridian Weather\'s location guide writer.',
    'Write ORIGINAL UK English copy. Do not paste Wikipedia or news article bodies.',
    'Ground claims in the provided context pack only.',
    'Return strict JSON with keys: title, excerpt, bodyHtml, sources, imageUrl, imageCredit, imageSourceUrl, slug.',
    `bodyHtml must include these exact H2 headings in order: ${PLACE_GUIDE_REQUIRED_H2.join(', ')}.`,
    'bodyHtml must be at least 1500 words of well-structured HTML using only p, h2, h3, ul, ol, li, a, strong, em.',
    'Include an internal link to /weather/{slug} in the body.',
    'sources must be an array of {title, url, publisher} with at least 3 entries from the context pack.',
    'imageUrl/imageCredit/imageSourceUrl must credit a real Wikimedia or Unsplash-style source if provided; otherwise use the pack Wikipedia page URL as imageSourceUrl with a descriptive credit.',
    'Never invent venue names that are not in the POI lists.',
  ].join(' ');
}

/**
 * @param {object} pack
 */
function buildUserPrompt(pack) {
  return JSON.stringify({
    instruction: `Write a weather weekend planner guide for ${pack.place.name}.`,
    category: PLACE_GUIDE_CATEGORY,
    promptVersion: PLACE_GUIDE_PROMPT_VERSION,
    context: pack,
  });
}

/**
 * @param {unknown} parsed
 * @param {object} pack
 * @param {string} model
 * @param {string} mode
 * @param {{ tokensIn?: number | null, tokensOut?: number | null }} usage
 */
function normalizeGuideResult(parsed, pack, model, mode, usage) {
  return {
    title: String(parsed?.title ?? '').trim(),
    excerpt: String(parsed?.excerpt ?? '').trim(),
    category: PLACE_GUIDE_CATEGORY,
    bodyHtml: String(parsed?.bodyHtml ?? '').trim(),
    sources: Array.isArray(parsed?.sources) ? parsed.sources : pack.sources,
    imageUrl: parsed?.imageUrl ?? null,
    imageCredit: parsed?.imageCredit ?? null,
    imageSourceUrl: parsed?.imageSourceUrl ?? null,
    model,
    promptVersion: PLACE_GUIDE_PROMPT_VERSION,
    slug: String(parsed?.slug || 'weather-weekend-planner')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '') || 'weather-weekend-planner',
    usage: {
      tokensIn: usage.tokensIn ?? null,
      tokensOut: usage.tokensOut ?? null,
    },
    mode,
  };
}

function parseJsonContent(content, provider) {
  if (!content) {
    throw new Error(`${provider} empty completion`);
  }

  const trimmed = String(content).trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() || trimmed;

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${provider} returned non-JSON content`);
  }
}

/**
 * @param {object} pack
 * @param {{ fetchImpl?: typeof fetch }} [options]
 */
async function generateWithGemini(pack, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const model = process.env.PLACE_CONTENT_LLM_MODEL || 'gemini-2.0-flash';
  const baseUrl = (
    process.env.GEMINI_API_BASE_URL
    || 'https://generativelanguage.googleapis.com/v1beta'
  ).replace(/\/$/, '');

  const url = `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemPrompt() }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: buildUserPrompt(pack) }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Gemini HTTP ${response.status}: ${text.slice(0, 300)}`);
  }

  const payload = await response.json();
  const content = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text ?? '')
    .join('')
    ?? '';

  const parsed = parseJsonContent(content, 'Gemini');
  const usageMeta = payload?.usageMetadata;

  return normalizeGuideResult(parsed, pack, model, 'gemini', {
    tokensIn: usageMeta?.promptTokenCount ?? null,
    tokensOut: usageMeta?.candidatesTokenCount ?? null,
  });
}

/**
 * @param {object} pack
 * @param {{ fetchImpl?: typeof fetch }} [options]
 */
async function generateWithOpenAi(pack, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const model = process.env.PLACE_CONTENT_LLM_MODEL || 'gpt-4o-mini';
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

  const response = await fetchImpl(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(pack) },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`OpenAI HTTP ${response.status}: ${text.slice(0, 300)}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  const parsed = parseJsonContent(content, 'OpenAI');

  return normalizeGuideResult(parsed, pack, model, 'openai', {
    tokensIn: payload?.usage?.prompt_tokens ?? null,
    tokensOut: payload?.usage?.completion_tokens ?? null,
  });
}

/**
 * @param {object} pack
 * @param {{ fetchImpl?: typeof fetch }} [options]
 */
export async function generatePlaceGuideWithLlm(pack, options = {}) {
  const mode = resolveLlmMode();

  if (mode === 'stub') {
    return {
      ...buildStubPlaceGuide(pack),
      usage: { tokensIn: 0, tokensOut: 0 },
      mode,
    };
  }

  if (mode === 'off') {
    const error = new Error(
      'LLM disabled: set GEMINI_API_KEY (preferred), OPENAI_API_KEY, or PLACE_CONTENT_LLM_MODE=stub',
    );
    error.code = 'llm_disabled';
    throw error;
  }

  if (mode === 'gemini') {
    return generateWithGemini(pack, options);
  }

  if (mode === 'openai') {
    return generateWithOpenAi(pack, options);
  }

  const exhaustive = mode;
  void exhaustive;
  throw new Error(`Unsupported LLM mode: ${mode}`);
}

export { resolveLlmMode, getGeminiApiKey };
