'use client';

import {
  ALERT_TYPE_GROUPS,
  ALL_ALERT_TYPES,
  createAllAlertPrefs,
  createDefaultAlertPrefs,
} from '@/constants/alert-types';
import { cn } from '@/lib/utils';

export const ALERT_PREF_MODES = {
  all: 'all',
  custom: 'custom',
};

export function buildInitialAlertPrefs(existingPrefs) {
  if (existingPrefs && typeof existingPrefs === 'object') {
    return {
      ...createDefaultAlertPrefs({ rain: false, storm: false }),
      ...existingPrefs,
    };
  }
  return createAllAlertPrefs();
}

export function SubscribeAlertPrefs({
  enabled,
  mode,
  prefs,
  onEnabledChange,
  onModeChange,
  onPrefsChange,
}) {
  function setMode(nextMode) {
    onModeChange(nextMode);
    if (nextMode === ALERT_PREF_MODES.all) {
      onPrefsChange(createAllAlertPrefs());
    }
  }

  function toggleType(typeId) {
    onModeChange(ALERT_PREF_MODES.custom);
    onPrefsChange({
      ...prefs,
      [typeId]: !prefs[typeId],
    });
  }

  function selectAllInGroup(group) {
    onModeChange(ALERT_PREF_MODES.custom);
    const next = { ...prefs };
    for (const type of group.types) {
      next[type.id] = true;
    }
    onPrefsChange(next);
  }

  const enabledCount = ALL_ALERT_TYPES.filter((type) => Boolean(prefs[type.id])).length;

  return (
    <div className="flex h-full flex-col gap-3">
      <label className="flex items-start gap-2 text-sm font-medium">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
        />
        <span>
          Weather alerts
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            Per-city notifications when conditions match your choices.
          </span>
        </span>
      </label>

      {enabled ? (
        <>
          <div
            className="grid grid-cols-2 gap-2"
            role="radiogroup"
            aria-label="Alert selection mode"
          >
            <ModeButton
              pressed={mode === ALERT_PREF_MODES.all}
              onClick={() => setMode(ALERT_PREF_MODES.all)}
              title="All weather alerts"
              hint="Every alert type"
            />
            <ModeButton
              pressed={mode === ALERT_PREF_MODES.custom}
              onClick={() => setMode(ALERT_PREF_MODES.custom)}
              title="Customise"
              hint={`${enabledCount} of ${ALL_ALERT_TYPES.length} selected`}
            />
          </div>

          <div
            className={cn(
              'min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-border/70 bg-muted/20 p-3',
              mode === ALERT_PREF_MODES.all && 'opacity-80',
            )}
          >
            {ALERT_TYPE_GROUPS.map((group) => (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    {group.label}
                  </p>
                  {mode === ALERT_PREF_MODES.custom ? (
                    <button
                      type="button"
                      className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      onClick={() => selectAllInGroup(group)}
                    >
                      Select group
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {group.types.map((type) => {
                    const checked = Boolean(prefs[type.id]);
                    return (
                      <label
                        key={type.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors',
                          checked
                            ? 'border-emerald-600/35 bg-emerald-500/10'
                            : 'border-transparent bg-background/60 hover:border-border',
                          mode === ALERT_PREF_MODES.all && 'pointer-events-none',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={mode === ALERT_PREF_MODES.all}
                          onChange={() => toggleType(type.id)}
                        />
                        <span className="leading-tight">{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-border/70 bg-muted/10 px-3 py-6 text-sm text-muted-foreground">
          Turn on weather alerts to choose all types or customise which ones you receive for this
          city.
        </p>
      )}
    </div>
  );
}

function ModeButton({ pressed, onClick, title, hint }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={pressed}
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-2 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        pressed
          ? 'border-foreground/25 bg-background shadow-sm'
          : 'border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      )}
    >
      <span className="block text-sm font-medium text-foreground">{title}</span>
      <span className="mt-0.5 block text-[11px] text-muted-foreground">{hint}</span>
    </button>
  );
}
