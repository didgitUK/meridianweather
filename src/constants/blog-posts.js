/**
 * Client-safe journal helpers (file defaults + i18n packs).
 * Server pages that should respect CMS edits import `@/lib/cms/get-blog-content`.
 */

import { HOME_BLOG_POSTS } from '@/constants/blog-posts-defaults';
import {
  getLocalizedBlogPost,
  getLocalizedBlogPosts,
} from '@/constants/blog-posts-i18n';

export { HOME_BLOG_POSTS };

/**
 * @param {string | null | undefined} [locale]
 */
export function getBlogPosts(locale) {
  return getLocalizedBlogPosts(locale) ?? HOME_BLOG_POSTS;
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

  return HOME_BLOG_POSTS.find((post) => post.id === id) ?? null;
}

export function getBlogPostIds() {
  return HOME_BLOG_POSTS.map((post) => post.id);
}
