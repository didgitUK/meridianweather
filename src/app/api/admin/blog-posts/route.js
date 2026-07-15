import { NextResponse } from 'next/server';
import {
  getBlogPost,
  listBlogPosts,
  resetBlogPost,
  upsertBlogPost,
} from '@/lib/cms/blog-post-repo';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const post = getBlogPost(slug);
    if (!post) {
      return NextResponse.json({ error: 'not_found', message: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  }

  return NextResponse.json({ posts: listBlogPosts() });
}

export async function PUT(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const slug = body.slug;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'invalid_request', message: 'slug is required' },
        { status: 400 },
      );
    }

    if (body.action === 'reset') {
      const post = resetBlogPost(slug);
      if (!post) {
        return NextResponse.json({ error: 'not_found', message: 'Post not found' }, { status: 404 });
      }

      return NextResponse.json({ post, posts: listBlogPosts() });
    }

    const post = upsertBlogPost(slug, {
      title: body.title,
      excerpt: body.excerpt,
      category: body.category,
      dateIso: body.dateIso,
      dateLabel: body.dateLabel,
      imageUrl: body.imageUrl,
      imageAlt: body.imageAlt,
      bodyHtml: body.bodyHtml,
    });

    return NextResponse.json({ post, posts: listBlogPosts() });
  } catch (error) {
    return NextResponse.json(
      { error: 'invalid_request', message: error.message ?? 'Unable to save post' },
      { status: 400 },
    );
  }
}
