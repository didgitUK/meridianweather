import { NextResponse } from 'next/server';
import { logAdminAuditEvent } from '@/lib/admin-audit-repo';
import { PLACE_ARTICLE_STATUS } from '@/constants/place-content';
import {
  getPlaceArticle,
  listAllPlaceArticles,
  updatePlaceArticleAdmin,
} from '@/lib/places/place-articles-repo';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const placeSlug = searchParams.get('placeSlug');
  const slug = searchParams.get('slug');
  const status = searchParams.get('status') || undefined;

  if (placeSlug && slug) {
    const article = getPlaceArticle(placeSlug, slug);
    if (!article) {
      return NextResponse.json({ error: 'not_found', message: 'Guide not found' }, { status: 404 });
    }
    return NextResponse.json({ article });
  }

  return NextResponse.json({
    articles: listAllPlaceArticles({ status, limit: 200 }),
  });
}

export async function PUT(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const placeSlug = String(body.placeSlug ?? '').trim();
    const slug = String(body.slug ?? '').trim();

    if (!placeSlug || !slug) {
      return NextResponse.json(
        { error: 'invalid', message: 'placeSlug and slug are required' },
        { status: 400 },
      );
    }

    const status = body.status
      ? String(body.status)
      : undefined;

    if (
      status
      && !Object.values(PLACE_ARTICLE_STATUS).includes(status)
    ) {
      return NextResponse.json(
        { error: 'invalid', message: 'Invalid status' },
        { status: 400 },
      );
    }

    const article = updatePlaceArticleAdmin(placeSlug, slug, {
      status,
      lockedByAdmin: body.lockedByAdmin,
      title: body.title,
      excerpt: body.excerpt,
      bodyHtml: body.bodyHtml,
    });

    if (!article) {
      return NextResponse.json({ error: 'not_found', message: 'Guide not found' }, { status: 404 });
    }

    logAdminAuditEvent({
      action: 'place_article_update',
      meta: { placeSlug, slug, status: article.status },
    });

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json(
      { error: 'save_failed', message: error.message },
      { status: 500 },
    );
  }
}
