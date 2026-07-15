import { usesEnglishContentPack } from '@/content/locale-content';
import { BLOG_POSTS_I18N as de } from './de';
import { BLOG_POSTS_I18N as fr } from './fr';
import { BLOG_POSTS_I18N as es } from './es';
import { BLOG_POSTS_I18N as ja } from './ja';
import { BLOG_POSTS_I18N as ar } from './ar';

export const blogPostsByLocale = { de, fr, es, ja, ar };

/**
 * @param {string | null | undefined} locale
 * @returns {typeof de | null}
 */
export function getLocalizedBlogPosts(locale) {
  if (usesEnglishContentPack(locale)) return null;
  return blogPostsByLocale[locale] ?? null;
}

/**
 * @param {string | null | undefined} locale
 * @param {string} id
 * @returns {object | null}
 */
export function getLocalizedBlogPost(locale, id) {
  const posts = getLocalizedBlogPosts(locale);
  if (!posts) return null;
  return posts.find((post) => post.id === id) ?? null;
}
