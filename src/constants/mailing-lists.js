/**
 * Admin mailing-list hub ids. Alert lists are logical views over location alert prefs.
 */

import {
  ALERT_TYPE_BY_ID,
  ALERT_TYPE_GROUPS,
  ALL_ALERT_TYPES,
} from '@/constants/alert-types';
import { EMAIL_TEMPLATE_SLUGS, weatherAlertTemplateSlug } from '@/constants/email-template-slugs';

export const MAILING_LIST_IDS = {
  newsletter: 'newsletter',
  weeklyDigest: 'weekly-digest',
};

export function alertMailingListId(alertTypeId) {
  return `alert:${alertTypeId}`;
}

export function parseMailingListId(listId) {
  if (listId === MAILING_LIST_IDS.newsletter) {
    return { kind: 'newsletter' };
  }

  if (listId === MAILING_LIST_IDS.weeklyDigest) {
    return { kind: 'weekly' };
  }

  if (typeof listId === 'string' && listId.startsWith('alert:')) {
    const alertTypeId = listId.slice('alert:'.length);
    if (!ALERT_TYPE_BY_ID[alertTypeId]) {
      return null;
    }
    return { kind: 'alert', alertTypeId };
  }

  return null;
}

export function templateSlugForMailingList(listId) {
  const parsed = parseMailingListId(listId);
  if (!parsed) return null;

  if (parsed.kind === 'newsletter') {
    return EMAIL_TEMPLATE_SLUGS.WELCOME;
  }

  if (parsed.kind === 'weekly') {
    return EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST;
  }

  return weatherAlertTemplateSlug(parsed.alertTypeId);
}

export function getMailingListMeta(listId) {
  const parsed = parseMailingListId(listId);
  if (!parsed) return null;

  if (parsed.kind === 'newsletter') {
    return {
      id: listId,
      kind: 'newsletter',
      label: 'Platform newsletter',
      description:
        'Product updates from the site footer. Unsubscribe removes this list only; location digests and alerts are separate.',
      emptyMessage: 'No newsletter signups yet.',
      csvBasename: 'meridian-newsletter',
      templateSlug: EMAIL_TEMPLATE_SLUGS.WELCOME,
    };
  }

  if (parsed.kind === 'weekly') {
    return {
      id: listId,
      kind: 'weekly',
      label: 'Weekly digests',
      description:
        'Location weekly forecast emails. One outbound email per address covering every subscribed location (max 20). Each row below is one location signup.',
      emptyMessage: 'No weekly digest signups yet.',
      csvBasename: 'meridian-weekly-digests',
      templateSlug: EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST,
    };
  }

  const alertType = ALERT_TYPE_BY_ID[parsed.alertTypeId];
  return {
    id: listId,
    kind: 'alert',
    alertTypeId: parsed.alertTypeId,
    label: alertType.label,
    shortLabel: alertType.shortLabel ?? alertType.label,
    source: alertType.source,
    description: `Subscribers with the ${alertType.label} alert enabled for a location. Leaving this list means turning off that alert type (or deleting the location alert subscription). Full unsubscribe deactivates all alert types for that location.`,
    emptyMessage: `No subscribers with ${alertType.label} enabled.`,
    csvBasename: `meridian-alert-${parsed.alertTypeId}`,
    templateSlug: weatherAlertTemplateSlug(parsed.alertTypeId),
  };
}

/** Top-level mailing lists shown above the alerts accordion. */
export const MAILING_LIST_TOP_ITEMS = [
  {
    id: MAILING_LIST_IDS.newsletter,
    label: 'Platform newsletter',
  },
  {
    id: MAILING_LIST_IDS.weeklyDigest,
    label: 'Weekly digests',
  },
];

/** Accordion groups for alert-type mailing lists. */
export const MAILING_LIST_ALERT_GROUPS = ALERT_TYPE_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  items: group.types.map((type) => ({
    id: alertMailingListId(type.id),
    label: type.shortLabel ?? type.label,
  })),
}));

export const DEFAULT_MAILING_LIST_ID = MAILING_LIST_IDS.newsletter;

export { ALL_ALERT_TYPES };
