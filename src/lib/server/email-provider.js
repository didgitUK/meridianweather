import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { DEFAULT_SES_REGION } from '@/constants/email-providers';
import {
  EMAIL_PROVIDERS,
  resolveActiveEmailConnector,
} from '@/lib/server/email-connectors';

/**
 * @param {{ to: string, subject: string, html: string }} message
 */
export async function sendTransactionalEmail(message) {
  const connector = resolveActiveEmailConnector();

  if (connector.provider === EMAIL_PROVIDERS.none) {
    return { sent: false, reason: 'email_not_configured' };
  }

  if (connector.provider === EMAIL_PROVIDERS.ses) {
    if (!connector.accessKeyId || !connector.apiKey || !connector.fromEmail) {
      return { sent: false, reason: 'email_not_configured' };
    }
    return sendViaSes(connector, message);
  }

  if (connector.provider === EMAIL_PROVIDERS.smtp) {
    if (!connector.host || !connector.apiKey || !connector.fromEmail) {
      return { sent: false, reason: 'email_not_configured' };
    }
    return sendViaSmtp(connector, message);
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
 * @param {{ accessKeyId?: string, apiKey: string, region?: string, fromEmail: string }} connector
 * @param {{ to: string, subject: string, html: string }} message
 */
async function sendViaSes(connector, message) {
  const region = connector.region?.trim() || DEFAULT_SES_REGION;
  const host = `email.${region}.amazonaws.com`;
  const path = '/v2/email/outbound-emails';
  const body = JSON.stringify({
    FromEmailAddress: connector.fromEmail,
    Destination: { ToAddresses: [message.to] },
    Content: {
      Simple: {
        Subject: { Data: message.subject, Charset: 'UTF-8' },
        Body: { Html: { Data: message.html, Charset: 'UTF-8' } },
      },
    },
  });

  const { headers } = signAwsSesRequest({
    method: 'POST',
    path,
    host,
    region,
    accessKeyId: connector.accessKeyId,
    secretAccessKey: connector.apiKey,
    body,
  });

  const response = await fetch(`https://${host}${path}`, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `Amazon SES mail send failed (${response.status})`);
  }

  return { sent: true, provider: EMAIL_PROVIDERS.ses };
}

/**
 * @param {{ host?: string, port?: number, user?: string, apiKey: string, secure?: boolean, fromEmail: string }} connector
 * @param {{ to: string, subject: string, html: string }} message
 */
async function sendViaSmtp(connector, message) {
  const transporter = nodemailer.createTransport({
    host: connector.host,
    port: connector.port,
    secure: connector.secure,
    auth: connector.user
      ? { user: connector.user, pass: connector.apiKey }
      : undefined,
  });

  await transporter.sendMail({
    from: connector.fromEmail,
    to: message.to,
    subject: message.subject,
    html: message.html,
  });

  return { sent: true, provider: EMAIL_PROVIDERS.smtp };
}

/**
 * @param {{
 *   method: string,
 *   path: string,
 *   host: string,
 *   region: string,
 *   accessKeyId: string,
 *   secretAccessKey: string,
 *   body: string,
 * }}
 */
function signAwsSesRequest({
  method,
  path,
  host,
  region,
  accessKeyId,
  secretAccessKey,
  body,
}) {
  const service = 'ses';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';
  const canonicalRequest = [
    method,
    path,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');
  const signingKey = getAwsSigningKey(secretAccessKey, dateStamp, region, service);
  const signature = hmacSha256(signingKey, stringToSign).toString('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    headers: {
      'Content-Type': 'application/json',
      Host: host,
      'x-amz-date': amzDate,
      Authorization: authorization,
    },
  };
}

/** @param {string} data */
function sha256Hex(data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/** @param {Buffer | string} key @param {string} data */
function hmacSha256(key, data) {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

/** @param {string} secretAccessKey @param {string} dateStamp @param {string} region @param {string} service */
function getAwsSigningKey(secretAccessKey, dateStamp, region, service) {
  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, 'aws4_request');
}

/**
 * Upsert newsletter contacts into the active provider's audience/list.
 * @param {{ email: string }[]} contacts
 */
export async function syncNewsletterContacts(contacts) {
  const connector = resolveActiveEmailConnector();

  if (connector.provider === EMAIL_PROVIDERS.none) {
    return { synced: false, reason: 'email_not_configured', count: 0 };
  }

  if (connector.provider === EMAIL_PROVIDERS.ses) {
    return {
      synced: false,
      reason: 'ses_meridian_local',
      count: 0,
      message: 'Amazon SES has no ESP audience sync — contacts stay in Meridian only.',
      provider: EMAIL_PROVIDERS.ses,
    };
  }

  if (connector.provider === EMAIL_PROVIDERS.smtp) {
    return {
      synced: false,
      reason: 'smtp_meridian_local',
      count: 0,
      message: 'SMTP has no audience sync — contacts stay in Meridian only.',
      provider: EMAIL_PROVIDERS.smtp,
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
