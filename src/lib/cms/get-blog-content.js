/**
 * Server-only journal content (SQLite CMS for default locale).
 * Client UI must not import this module — use `@/constants/blog-posts` instead.
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

/**
 * @param {string | null | undefined} [locale]
 */
export function getBlogPosts(locale) {
  const localized = getLocalizedBlogPosts(locale);
  if (localized) {
    return localized;
  }

  try {
    return listPublicBlogPosts();
  } catch {
    return HOME_BLOG_POSTS;
  }
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

  try {
    return getPublicBlogPost(id) ?? HOME_BLOG_POSTS.find((post) => post.id === id) ?? null;
  } catch {
    return HOME_BLOG_POSTS.find((post) => post.id === id) ?? null;
  }
}

export function getBlogPostIds() {
  try {
    return listBlogPostSlugs();
  } catch {
    return HOME_BLOG_POSTS.map((post) => post.id);
  }
}
