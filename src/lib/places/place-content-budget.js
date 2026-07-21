import { v4 as uuidv4 } from 'uuid';
import {
  PLACE_GUIDE_DAILY_LLM_CAP,
  PLACE_POI_DAILY_OVERPASS_CAP,
} from '@/constants/place-content';
import { getDb } from '@/lib/db';

function dayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function getBudgetRow(key = dayKey()) {
  const db = getDb();
  let row = db
    .prepare(
      `SELECT day_key, overpass_calls, llm_generations, updated_at
       FROM place_content_budget WHERE day_key = ?`,
    )
    .get(key);

  if (!row) {
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO place_content_budget (day_key, overpass_calls, llm_generations, updated_at)
       VALUES (?, 0, 0, ?)`,
    ).run(key, now);
    row = {
      day_key: key,
      overpass_calls: 0,
      llm_generations: 0,
      updated_at: now,
    };
  }

  return row;
}

export function getPlaceContentBudgetSnapshot() {
  const row = getBudgetRow();
  return {
    dayKey: row.day_key,
    overpassCalls: row.overpass_calls,
    llmGenerations: row.llm_generations,
    overpassRemaining: Math.max(0, PLACE_POI_DAILY_OVERPASS_CAP - row.overpass_calls),
    llmRemaining: Math.max(0, PLACE_GUIDE_DAILY_LLM_CAP - row.llm_generations),
  };
}

export function canSpendOverpassCall() {
  return getPlaceContentBudgetSnapshot().overpassRemaining > 0;
}

export function canSpendLlmGeneration() {
  return getPlaceContentBudgetSnapshot().llmRemaining > 0;
}

export function recordOverpassCall() {
  const key = dayKey();
  getBudgetRow(key);
  getDb()
    .prepare(
      `UPDATE place_content_budget
       SET overpass_calls = overpass_calls + 1, updated_at = ?
       WHERE day_key = ?`,
    )
    .run(new Date().toISOString(), key);
}

export function recordLlmGeneration() {
  const key = dayKey();
  getBudgetRow(key);
  getDb()
    .prepare(
      `UPDATE place_content_budget
       SET llm_generations = llm_generations + 1, updated_at = ?
       WHERE day_key = ?`,
    )
    .run(new Date().toISOString(), key);
}

/**
 * @param {{
 *   placeSlug?: string | null,
 *   job: string,
 *   status: string,
 *   model?: string | null,
 *   promptVersion?: string | null,
 *   tokensIn?: number | null,
 *   tokensOut?: number | null,
 *   costUsd?: number | null,
 *   errorSummary?: string | null,
 *   meta?: Record<string, unknown>,
 * }} input
 */
export function insertPlaceContentRun(input) {
  const id = uuidv4();
  const startedAt = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO place_content_runs (
         id, place_slug, job, status, started_at, finished_at,
         model, prompt_version, tokens_in, tokens_out, cost_usd,
         error_summary, meta_json
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.placeSlug ?? null,
      input.job,
      input.status,
      startedAt,
      new Date().toISOString(),
      input.model ?? null,
      input.promptVersion ?? null,
      input.tokensIn ?? null,
      input.tokensOut ?? null,
      input.costUsd ?? null,
      input.errorSummary ? String(input.errorSummary).slice(0, 2000) : null,
      JSON.stringify(input.meta ?? {}),
    );

  return id;
}
