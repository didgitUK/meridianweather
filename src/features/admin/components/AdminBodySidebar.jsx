'use client';

import { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

function SidebarNavButton({ item, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'w-full rounded-lg px-3 py-2.5 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-muted text-foreground'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <span className="block text-sm font-medium leading-snug">{item.label}</span>
      {item.description ? (
        <span
          className={cn(
            'mt-0.5 block text-xs leading-snug',
            isActive ? 'text-muted-foreground' : 'text-muted-foreground/80',
          )}
        >
          {item.description}
        </span>
      ) : null}
    </button>
  );
}

export function AdminBodySidebar({
  title,
  description,
  items = [],
  groups = [],
  activeId,
  onSelect,
  ariaLabel = 'Section navigation',
}) {
  const activeGroupId = useMemo(
    () => groups.find((group) => group.items.some((item) => item.id === activeId))?.id ?? null,
    [activeId, groups],
  );

  const [openGroups, setOpenGroups] = useState(() => (activeGroupId ? [activeGroupId] : []));

  const effectiveOpenGroups =
    activeGroupId && !openGroups.includes(activeGroupId)
      ? [...openGroups, activeGroupId]
      : openGroups;

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-56">
      <div className="rounded-xl border bg-card p-4">
        {title ? (
          <div className="mb-3">
            <h2 className="font-heading text-lg leading-tight">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>
        ) : null}

        <nav aria-label={ariaLabel} className="flex flex-col gap-1">
          {items.map((item) => (
            <SidebarNavButton
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              onSelect={onSelect}
            />
          ))}

          {groups.length > 0 ? (
            <Accordion
              multiple
              value={effectiveOpenGroups}
              onValueChange={setOpenGroups}
              className="mt-1 gap-0"
            >
              {groups.map((group) => (
                <AccordionItem key={group.id} value={group.id} className="border-border/50">
                  <AccordionTrigger className="py-2 font-sans text-[11px] font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground [&_svg]:size-3.5">
                    {group.label}
                  </AccordionTrigger>
                  <AccordionContent className="pb-2 pt-0">
                    <div className="flex flex-col gap-1">
                      {group.items.map((item) => (
                        <SidebarNavButton
                          key={item.id}
                          item={item}
                          isActive={item.id === activeId}
                          onSelect={onSelect}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : null}
        </nav>
      </div>
    </aside>
  );
}
