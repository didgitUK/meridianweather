'use client';

import { useTranslations } from 'next-intl';
import {
  ALERT_TYPE_GROUPS,
  ALL_ALERT_TYPES,
  createAllAlertPrefs,
  createDefaultAlertPrefs,
} from '@/constants/alert-types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  mode,
  prefs,
  onModeChange,
  onPrefsChange,
}) {
  const t = useTranslations('Subscriptions.alertPrefs');

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
    <div className="flex flex-col gap-3">
      <div
        className="grid grid-cols-2 gap-1 rounded-lg border border-border/70 bg-muted/20 p-1"
        role="radiogroup"
        aria-label={t('modeLabel')}
      >
        <ModeButton
          pressed={mode === ALERT_PREF_MODES.all}
          onClick={() => setMode(ALERT_PREF_MODES.all)}
          title={t('allTitle')}
        />
        <ModeButton
          pressed={mode === ALERT_PREF_MODES.custom}
          onClick={() => setMode(ALERT_PREF_MODES.custom)}
          title={t('customTitle')}
          hint={
            mode === ALERT_PREF_MODES.custom
              ? t('selectedCount', {
                  count: enabledCount,
                  total: ALL_ALERT_TYPES.length,
                })
              : undefined
          }
        />
      </div>

      {mode === ALERT_PREF_MODES.all ? (
        <p className="rounded-lg bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
          {t('allHint')}
        </p>
      ) : (
        <div className="max-h-[min(18rem,40vh)] overflow-y-auto rounded-lg border border-border/70">
          <Accordion className="px-1" multiple>
            {ALERT_TYPE_GROUPS.map((group) => {
              const groupEnabled = group.types.filter((type) => Boolean(prefs[type.id])).length;
              return (
                <AccordionItem key={group.id} value={group.id}>
                  <AccordionTrigger className="px-2 py-2.5 text-sm font-medium hover:no-underline">
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2 pr-2">
                      <span className="truncate">{group.label}</span>
                      <span className="shrink-0 text-xs font-normal text-muted-foreground">
                        {groupEnabled}/{group.types.length}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-3 pt-0">
                    <div className="mb-2 flex justify-end">
                      <button
                        type="button"
                        className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          selectAllInGroup(group);
                        }}
                      >
                        {t('selectGroup')}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.types.map((type) => {
                        const pressed = Boolean(prefs[type.id]);
                        return (
                          <button
                            key={type.id}
                            type="button"
                            aria-pressed={pressed}
                            onClick={() => toggleType(type.id)}
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-xs transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              pressed
                                ? 'border-foreground/20 bg-foreground text-background'
                                : 'border-border/70 bg-background text-muted-foreground hover:border-border hover:text-foreground',
                            )}
                          >
                            {type.shortLabel ?? type.label}
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
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
        'rounded-md px-2.5 py-2 text-center transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        pressed
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <span className="block text-sm font-medium">{title}</span>
      {hint ? (
        <span className="mt-0.5 block text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </button>
  );
}
