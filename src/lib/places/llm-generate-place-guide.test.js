import { afterEach, describe, expect, it } from 'vitest';
import { resolveLlmMode } from '@/lib/places/llm-generate-place-guide';

describe('resolveLlmMode', () => {
  const keys = [
    'PLACE_CONTENT_LLM_MODE',
    'GEMINI_API_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'OPENAI_API_KEY',
  ];
  const snapshot = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  afterEach(() => {
    for (const key of keys) {
      if (snapshot[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = snapshot[key];
      }
    }
  });

  it('prefers explicit gemini mode', () => {
    process.env.PLACE_CONTENT_LLM_MODE = 'gemini';
    delete process.env.GEMINI_API_KEY;
    expect(resolveLlmMode()).toBe('gemini');
  });

  it('auto-selects gemini when GEMINI_API_KEY is set', () => {
    delete process.env.PLACE_CONTENT_LLM_MODE;
    delete process.env.OPENAI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-key';
    expect(resolveLlmMode()).toBe('gemini');
  });

  it('falls back to openai when only OPENAI_API_KEY is set', () => {
    delete process.env.PLACE_CONTENT_LLM_MODE;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    process.env.OPENAI_API_KEY = 'test-key';
    expect(resolveLlmMode()).toBe('openai');
  });
});
