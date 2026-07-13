import { privacyPolicy } from '@/content/legal/privacy';
import { termsPolicy } from '@/content/legal/terms';
import { cookiesPolicy } from '@/content/legal/cookies';
import { accessibilityPolicy } from '@/content/legal/accessibility';

/** File-backed defaults used to seed and reset CMS policy pages. */
export const LEGAL_POLICIES = [
  termsPolicy,
  privacyPolicy,
  cookiesPolicy,
  accessibilityPolicy,
];
