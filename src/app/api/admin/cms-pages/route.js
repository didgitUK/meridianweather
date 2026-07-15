import { NextResponse } from 'next/server';
import { CMS_COLLECTION, CMS_COLLECTIONS } from '@/constants/cms';
import { logAdminAuditEvent } from '@/lib/admin-audit-repo';
import {
  getCmsPage,
  listCmsPages,
  resetCmsPage,
  upsertCmsPage,
} from '@/lib/cms/cms-page-repo';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

const VALID_COLLECTIONS = new Set(Object.values(CMS_COLLECTION));

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');
  const slug = searchParams.get('slug');

  if (!collection || !VALID_COLLECTIONS.has(collection)) {
    return NextResponse.json({
      collections: CMS_COLLECTIONS,
    });
  }

  if (slug) {
    const page = getCmsPage(collection, slug);
    if (!page) {
      return NextResponse.json({ error: 'not_found', message: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  }

  return NextResponse.json({
    collection,
    pages: listCmsPages(collection),
  });
}

export async function PUT(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const collection = body.collection;
    const slug = body.slug;

    if (!collection || !VALID_COLLECTIONS.has(collection)) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'Valid collection is required' },
        { status: 400 },
      );
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'invalid_request', message: 'slug is required' },
        { status: 400 },
      );
    }

    if (body.action === 'reset') {
      const page = resetCmsPage(collection, slug);
      if (!page) {
        return NextResponse.json({ error: 'not_found', message: 'Page not found' }, { status: 404 });
      }

      logAdminAuditEvent({
        action: 'cms_page_reset',
        meta: { collection, slug },
      });

      return NextResponse.json({ page, pages: listCmsPages(collection) });
    }

    const page = upsertCmsPage(collection, slug, {
      title: body.title,
      lastUpdated: body.lastUpdated,
      sections: body.sections,
    });

    if (!page) {
      return NextResponse.json({ error: 'not_found', message: 'Page not found' }, { status: 404 });
    }

    logAdminAuditEvent({
      action: 'cms_page_saved',
      meta: { collection, slug },
    });

    return NextResponse.json({ page, pages: listCmsPages(collection) });
  } catch (error) {
    return NextResponse.json(
      { error: 'invalid_request', message: error.message ?? 'Unable to save page' },
      { status: 400 },
    );
  }
}
