import { Resend } from 'resend';
import {
  EMAIL_PROVIDERS,
  resolveActiveEmailConnector,
} from '@/lib/server/email-connectors';

/**
 * @param {{ to: string, subject: string, html: string }} message
 */
export async function sendTransactionalEmail(message) {
  const connector = resolveActiveEmailConnector();

  if (connector.provider === EMAIL_PROVIDERS.ses) {
    if (!connector.accessKeyId || !connector.apiKey || !connector.fromEmail) {
      return { sent: false, reason: 'email_not_configured' };
    }
    return sendViaSes(connector, message);
  }

  if (!connector.apiKey) {
    return { sent: false, reason: 'email_not_configured' };
  }

  if (connector.provider === EMAIL_PROVIDERS.sendgrid) {
    return sendViaSendGrid(connector, message);
  }

  return sendViaResend(connector, message);
}

/**
 * @param {{ apiKey: string, fromEmail: string }} connector
 * @param {{ to: string, subject: string, html: string }} message
 */
async function sendViaResend(connector, message) {
  const resend = new Resend(connector.apiKey);
  await resend.emails.send({
    from: connector.fromEmail,
    to: message.to,
    subject: message.subject,
    html: message.html,
  });

  return { sent: true, provider: EMAIL_PROVIDERS.resend };
}

/**
 * @param {{ apiKey: string, fromEmail: string }} connector
 * @param {{ to: string, subject: string, html: string }} message
 */
async function sendViaSendGrid(connector, message) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${connector.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: message.to }] }],
      from: { email: connector.fromEmail },
      subject: message.subject,
      content: [{ type: 'text/html', value: message.html }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `SendGrid mail send failed (${response.status})`);
  }

  return { sent: true, provider: EMAIL_PROVIDERS.sendgrid };
}

/**
 * SES send scaffold — live AWS SDK wiring lands with the SES agent.
 * @param {{ accessKeyId?: string, apiKey: string, region?: string, fromEmail: string }} connector
 * @param {{ to: string, subject: string, html: string }} _message
 */
async function sendViaSes(connector, _message) {
  return {
    sent: false,
    reason: 'ses_not_implemented',
    provider: EMAIL_PROVIDERS.ses,
    message: 'Amazon SES send is scaffolded but not wired yet.',
    region: connector.region,
  };
}

/**
 * Upsert newsletter contacts into the active provider's audience/list.
 * @param {{ email: string }[]} contacts
 */
export async function syncNewsletterContacts(contacts) {
  const connector = resolveActiveEmailConnector();

  if (connector.provider === EMAIL_PROVIDERS.ses) {
    return {
      synced: false,
      reason: 'ses_not_implemented',
      count: 0,
      message: 'Amazon SES audience sync is not available yet.',
      provider: EMAIL_PROVIDERS.ses,
    };
  }

  if (!connector.apiKey) {
    return { synced: false, reason: 'email_not_configured', count: 0 };
  }

  if (!connector.audienceId) {
    return {
      synced: false,
      reason: 'audience_not_configured',
      count: 0,
      message:
        connector.provider === EMAIL_PROVIDERS.sendgrid
          ? 'Add a SendGrid Marketing list ID before syncing.'
          : 'Add a Resend Audience ID before syncing.',
    };
  }

  const emails = [...new Set(contacts.map((c) => c.email?.trim().toLowerCase()).filter(Boolean))];

  if (emails.length === 0) {
    return { synced: true, count: 0, provider: connector.provider };
  }

  if (connector.provider === EMAIL_PROVIDERS.sendgrid) {
    return syncSendGridContacts(connector, emails);
  }

  return syncResendContacts(connector, emails);
}

/**
 * @param {{ apiKey: string, audienceId: string }} connector
 * @param {string[]} emails
 */
async function syncResendContacts(connector, emails) {
  let synced = 0;
  const errors = [];

  for (const email of emails) {
    const response = await fetch(
      `https://api.resend.com/audiences/${encodeURIComponent(connector.audienceId)}/contacts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${connector.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          unsubscribed: false,
        }),
      },
    );

    if (response.ok || response.status === 409) {
      synced += 1;
      continue;
    }

    const detail = await response.text().catch(() => '');
    errors.push({ email, status: response.status, detail });
  }

  return {
    synced: errors.length === 0,
    count: synced,
    provider: EMAIL_PROVIDERS.resend,
    errors: errors.slice(0, 10),
  };
}

/**
 * @param {{ apiKey: string, audienceId: string }} connector
 * @param {string[]} emails
 */
async function syncSendGridContacts(connector, emails) {
  const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${connector.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      list_ids: [connector.audienceId],
      contacts: emails.map((email) => ({ email })),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `SendGrid contact sync failed (${response.status})`);
  }

  return {
    synced: true,
    count: emails.length,
    provider: EMAIL_PROVIDERS.sendgrid,
  };
}
