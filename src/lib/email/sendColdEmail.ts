import nodemailer from 'nodemailer';
import { CandidateProfile, Job, ColdEmailContent, DEMO_RECRUITER_EMAIL } from '@/lib/types';

export interface SendEmailInput {
  candidate: CandidateProfile;
  job: Job;
  coldEmail?: ColdEmailContent;
}

export interface SendEmailResult {
  status: 'SENT' | 'FAILED';
  timestamp: string;
  outreachId: string;
  message?: string;
}

/**
 * Server-side email delivery tool.
 * Reads secrets exclusively from process.env on the server.
 * Falls back to DEMO MODE (console log) if SMTP is not configured.
 */
export async function sendColdEmailServer(input: SendEmailInput): Promise<SendEmailResult> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const recipientEmail = input.coldEmail?.recipientEmail || DEMO_RECRUITER_EMAIL;

  const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  const outreachId = `outreach_${Date.now()}`;

  const subject = input.coldEmail?.subject ||
    `${input.candidate.fullName} — ${input.job.title} Outreach (${input.job.company})`;
  const bodyText = input.coldEmail?.body ||
    `Hi Recruiting Team,\n\nI recently came across the ${input.job.title} role at ${input.job.company} and wanted to reach out directly.\n\nBest regards,\n${input.candidate.fullName}`;

  // DEMO MODE: If SMTP credentials are not configured, simulate the send
  if (!smtpUser || !smtpPass) {
    console.log('\n========== DEMO MODE: EMAIL SIMULATED ==========');
    console.log(`FROM: ${input.candidate.email}`);
    console.log(`TO:   ${recipientEmail}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY:\n${bodyText}`);
    console.log('================================================\n');
    return {
      status: 'SENT',
      timestamp,
      outreachId,
      message: 'DEMO MODE: Email simulated (no SMTP configured)'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });

    await transporter.sendMail({
      from: `"${input.candidate.fullName}" <${smtpUser}>`,
      to: recipientEmail,
      subject,
      text: bodyText,
      html: `<p>${bodyText.replace(/\n/g, '<br/>')}</p>`
    });

    console.log(`[Email] ✅ Sent to ${recipientEmail} — ${subject}`);
    return {
      status: 'SENT',
      timestamp,
      outreachId,
      message: 'Email sent successfully via SMTP.'
    };
  } catch (err: unknown) {
    console.error('[Email] ❌ SMTP error:', err);
    return {
      status: 'FAILED',
      timestamp,
      outreachId,
      message: `SMTP Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
}

