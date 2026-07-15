/**
 * Journal posts — English reads from SQLite CMS (seeded from defaults);
 * localized packs remain in blog-posts-i18n for non-en locales.
 */

import { HOME_BLOG_POSTS } from '@/constants/blog-posts-defaults';
import {
  getLocalizedBlogPost,
  getLocalizedBlogPosts,
} from '@/constants/blog-posts-i18n';
import {
  getPublicBlogPost,
  listBlogPostSlugs,
  listPublicBlogPosts,
} from '@/lib/cms/blog-post-repo';

export { HOME_BLOG_POSTS };

/**
 * @param {string | null | undefined} [locale]
 */
export function getBlogPosts(locale) {
  const localized = getLocalizedBlogPosts(locale);
  if (localized) {
    return localized;
  }

  return listPublicBlogPosts();
}

/**
 * @param {string} id
 * @param {string | null | undefined} [locale]
 */
export function getBlogPostById(id, locale) {
  const localized = getLocalizedBlogPost(locale, id);
  if (localized) {
    return localized;
  }

  return getPublicBlogPost(id);
}

export function getBlogPostIds() {
  return listBlogPostSlugs();
}
