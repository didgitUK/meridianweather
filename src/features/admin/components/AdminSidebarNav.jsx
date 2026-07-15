'use client';

import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BadgePoundSterling,
  Bell,
  BookOpen,
  CalendarDays,
  CloudSun,
  FileText,
  Gauge,
  History,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Mail,
  Newspaper,
  Radar,
  Scale,
  Settings,
  UserRound,
  Users,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ADMIN_NAV_GROUPS } from '@/constants/admin';
import { AdminSidebarNavItem } from '@/features/admin/components/sidebar/AdminSidebarNavItem';
import { AdminApiConnectionStatuses } from '@/features/admin/components/connections/AdminApiConnectionStatuses';

const ADMIN_NAV_ICONS = {
  LayoutDashboard,
  Activity,
  CloudSun,
  Gauge,
  History,
  AlertTriangle,
  FileText,
  Newspaper,
  Mail,
  Bell,
  BadgePoundSterling,
  Scale,
  BookOpen,
  Users,
  UserRound,
  Radar,
  CalendarDays,
  KeyRound,
  Inbox,
  Settings,
};

const UNLABELED_GROUPS = ADMIN_NAV_GROUPS.filter((group) => !group.label);
const ACCORDION_GROUPS = ADMIN_NAV_GROUPS.filter((group) => group.label);

function findGroupIdForSection(sectionId) {
  return ACCORDION_GROUPS.find((group) => group.items.some((item) => item.id === sectionId))?.id ?? null;
}

export function AdminSidebarNav({ activeSection, onSectionChange }) {
  const [openGroups, setOpenGroups] = useState(() => {
    const groupId = findGroupIdForSection(activeSection);
    return groupId ? [groupId] : [ACCORDION_GROUPS[0]?.id].filter(Boolean);
  });

  const activeGroupId = findGroupIdForSection(activeSection);
  const effectiveOpenGroups =
    activeGroupId && !openGroups.includes(activeGroupId)
      ? [...openGroups, activeGroupId]
      : openGroups;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav
        aria-label="Admin sections"
        className="meridian-scrollbar-sidebar min-h-0 flex-1 overflow-y-auto px-2 py-3"
      >
        <ul className="flex flex-col gap-1">
          {UNLABELED_GROUPS.flatMap((group) =>
            group.items.map((item) => {
              const Icon = ADMIN_NAV_ICONS[item.icon] ?? LayoutDashboard;
              return (
                <li key={item.id}>
                  <AdminSidebarNavItem
                    label={item.label}
                    icon={Icon}
                    isActive={activeSection === item.id}
                    tone="dark"
                    onClick={() => onSectionChange(item.id)}
                  />
                </li>
              );
            }),
          )}
        </ul>

        <Accordion
          multiple
          value={effectiveOpenGroups}
          onValueChange={setOpenGroups}
          className="mt-2 gap-0"
        >
          {ACCORDION_GROUPS.map((group) => (
            <AccordionItem key={group.id} value={group.id} className="border-0 border-b-0">
              <AccordionTrigger className="px-3 py-2 font-sans text-[11px] font-medium tracking-wide text-white/50 uppercase hover:text-white/80 [&_svg]:text-white/40">
                {group.label}
              </AccordionTrigger>
              <AccordionContent className="pb-2 pt-0">
                <ul className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const Icon = ADMIN_NAV_ICONS[item.icon] ?? LayoutDashboard;
                    return (
                      <li key={item.id}>
                        <AdminSidebarNavItem
                          label={item.label}
                          icon={Icon}
                          isActive={activeSection === item.id}
                          tone="dark"
                          onClick={() => onSectionChange(item.id)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </nav>

      <div className="hidden border-t border-white/10 px-3 py-3 lg:block">
        <AdminApiConnectionStatuses tone="dark" onSectionChange={onSectionChange} />
      </div>
    </div>
  );
}
