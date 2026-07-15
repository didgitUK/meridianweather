import { describe, expect, it } from 'vitest';
import {
  ADMIN_EMAIL_TEMPLATE_SLUGS,
  AUTH_EMAIL_TEMPLATE_SLUGS,
  EMAIL_TEMPLATE_CATEGORIES,
  EMAIL_TEMPLATE_SLUGS,
  isAdminReplyTemplateSlug,
} from '@/constants/email-template-slugs';
import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_DEFINITIONS,
  EMAIL_TEMPLATE_PREVIEW_VARS,
} from '@/constants/email-templates';
import { createAuthToken, hashAuthToken } from '@/lib/admin-invites-repo';

describe('email template categories', () => {
  it('marks mailing, auth, and admin templates', () => {
    const mailing = EMAIL_TEMPLATE_DEFINITIONS.filter(
      (item) => item.category === EMAIL_TEMPLATE_CATEGORIES.MAILING,
    );
    const auth = EMAIL_TEMPLATE_DEFINITIONS.filter(
      (item) => item.category === EMAIL_TEMPLATE_CATEGORIES.AUTH,
    );
    const admin = EMAIL_TEMPLATE_DEFINITIONS.filter(
      (item) => item.category === EMAIL_TEMPLATE_CATEGORIES.ADMIN,
    );

    expect(mailing.length).toBeGreaterThan(0);
    expect(auth.map((item) => item.slug).sort()).toEqual([...AUTH_EMAIL_TEMPLATE_SLUGS].sort());
    expect(admin.map((item) => item.slug).sort()).toEqual([...ADMIN_EMAIL_TEMPLATE_SLUGS].sort());
  });

  it('seeds defaults and preview vars for auth and admin templates', () => {
    for (const slug of [...AUTH_EMAIL_TEMPLATE_SLUGS, ...ADMIN_EMAIL_TEMPLATE_SLUGS]) {
      expect(DEFAULT_EMAIL_TEMPLATES[slug]?.html).toBeTruthy();
      expect(EMAIL_TEMPLATE_PREVIEW_VARS[slug]).toBeTruthy();
    }
  });

  it('identifies admin reply slugs', () => {
    expect(isAdminReplyTemplateSlug(EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_CONTACT)).toBe(true);
    expect(isAdminReplyTemplateSlug(EMAIL_TEMPLATE_SLUGS.WELCOME)).toBe(false);
  });
});

describe('auth token hashing', () => {
  it('hashes tokens deterministically and uniquely', () => {
    const token = createAuthToken();
    expect(token.length).toBeGreaterThan(20);
    expect(hashAuthToken(token)).toBe(hashAuthToken(token));
    expect(hashAuthToken(token)).not.toBe(token);
    expect(hashAuthToken(token)).not.toBe(hashAuthToken(`${token}x`));
  });
});
