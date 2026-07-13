import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  interpolateTemplate,
  renderEmailTemplateContent,
} from '@/lib/email-templates/render-email-template';

describe('render-email-template', () => {
  it('escapes html in interpolated values', () => {
    expect(escapeHtml('<b>x</b>')).toBe('&lt;b&gt;x&lt;/b&gt;');
    expect(interpolateTemplate('Hello {{name}}', { name: '<script>' })).toBe(
      'Hello &lt;script&gt;',
    );
  });

  it('renders subject and html together', () => {
    const rendered = renderEmailTemplateContent(
      {
        subject: 'Alert for {{cityName}}',
        html: '<p>{{condition}}</p>',
      },
      { cityName: 'Bolton', condition: 'Rain' },
    );

    expect(rendered.subject).toBe('Alert for Bolton');
    expect(rendered.html).toBe('<p>Rain</p>');
  });
});
