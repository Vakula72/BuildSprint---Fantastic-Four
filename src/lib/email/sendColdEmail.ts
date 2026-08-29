import nodemailer from 'nodemailer';
import { CandidateProfile, Job, ColdEmailContent, DEMO_RECRUITER_EMAIL } from '@/lib/types';

export interface SendEmailInput {
  candidate: CandidateProfile;
  job: Job;
  coldEmail?: ColdEmailContent;
}

export interface SendEmailResult {
  status: 'SENT' | 'NOT_CONFIGURED' | 'FAILED';
  timestamp: string;
  outreachId: string;
  message?: string;
}

/**
 * Server-side email delivery tool.
 * Reads secrets exclusively from process.env on the server.
 * Never exposes credentials to the frontend.
 */
export async function sendColdEmailServer(input: SendEmailInput): Promise<SendEmailResult> {
  const candidateEmail = process.env.CANDIDATE_EMAIL || process.env.SMTP_USER;
  const candidatePassword = process.env.CANDIDATE_EMAIL_PASSWORD || process.env.SMTP_PASSWORD;
  const recruiterRecipient = process.env.RECRUITER_EMAIL || process.env.DEMO_RECRUITER_EMAIL || DEMO_RECRUITER_EMAIL;

  const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  const outreachId = `outreach_${Date.now()}`;

  // If server-side SMTP credentials are NOT configured
  if (!candidateEmail || !candidatePassword) {
    return {
      status: 'NOT_CONFIGURED',
      timestamp,
      outreachId,
      message: 'Unable to send email. Please try again.'
    };
  }

  try {
    const isGmail = candidateEmail.includes('@gmail.com');
    const smtpHost = process.env.SMTP_HOST || (isGmail ? 'smtp.gmail.com' : 'smtp.office365.com');
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const isSecure = smtpPort === 465;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: candidateEmail,
        pass: candidatePassword
      }
    });

    const subject = input.coldEmail?.subject || `${input.candidate.fullName} — ${input.job.title} Outreach (${input.job.company})`;
    const bodyText = input.coldEmail?.body || `Hi Recruiting Team,\n\nI recently came across the ${input.job.title} role at ${input.job.company} and wanted to reach out directly.\n\nBest regards,\n${input.candidate.fullName}`;

    await transporter.sendMail({
      from: `"${input.candidate.fullName}" <${candidateEmail}>`,
      to: recruiterRecipient,
      subject,
      text: bodyText
    });

    return {
      status: 'SENT',
      timestamp,
      outreachId,
      message: 'Email sent successfully.'
    };
  } catch (err: unknown) {
    console.error('[Server Email Error]:', err);
    return {
      status: 'FAILED',
      timestamp,
      outreachId,
      message: 'Unable to send email. Please try again.'
    };
  }
}
