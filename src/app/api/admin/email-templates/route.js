import { NextResponse } from 'next/server';
import { EMAIL_TEMPLATE_DEFINITIONS } from '@/constants/email-templates';
import {
  getEmailTemplate,
  listEmailTemplates,
  resetEmailTemplate,
  upsertEmailTemplate,
} from '@/lib/email-templates/email-template-repo';
import { renderEmailTemplateContent } from '@/lib/email-templates/render-email-template';
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
  const preview = searchParams.get('preview') === '1';

  if (slug) {
    const template = getEmailTemplate(slug);

    if (!template) {
      return NextResponse.json({ error: 'not_found', message: 'Template not found' }, { status: 404 });
    }

    if (preview) {
      const rendered = renderEmailTemplateContent(template, template.previewVars ?? {});
      return NextResponse.json({
        slug,
        subject: rendered.subject,
        html: rendered.html,
      });
    }

    return NextResponse.json({ template });
  }

  const category = searchParams.get('category');
  const templates = listEmailTemplates().filter((template) =>
    category ? template.category === category : true,
  );
  const definitions = EMAIL_TEMPLATE_DEFINITIONS.filter((definition) =>
    category ? definition.category === category : true,
  );

  return NextResponse.json({
    templates,
    definitions,
  });
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
      const template = resetEmailTemplate(slug);
      if (!template) {
        return NextResponse.json({ error: 'not_found', message: 'Template not found' }, { status: 404 });
      }

      return NextResponse.json({ template, templates: listEmailTemplates() });
    }

    const template = upsertEmailTemplate(slug, {
      subject: body.subject,
      html: body.html,
    });

    if (!template) {
      return NextResponse.json({ error: 'not_found', message: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template, templates: listEmailTemplates() });
  } catch (error) {
    return NextResponse.json(
      { error: 'invalid_request', message: error.message ?? 'Unable to save template' },
      { status: 400 },
    );
  }
}
