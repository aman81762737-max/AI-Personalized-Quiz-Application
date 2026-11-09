import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import crypto from 'crypto';

interface StoredOtp {
  code: string;
  expiresAt: number;
  attempts: number;
}

const otpStorage = new Map<string, StoredOtp>();
const lastOtpRequestTimestamp = new Map<string, number>();

let etherealTransporterPromise: Promise<Transporter | null> | null = null;

async function getTransporter(): Promise<{ transporter: Transporter | null; isCustomSmtp: boolean }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    return { transporter, isCustomSmtp: true };
  }

  if (!etherealTransporterPromise) {
    etherealTransporterPromise = nodemailer.createTestAccount()
      .then((testAccount) => {
        return nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      })
      .catch((err) => {
        console.error('[EMAIL SERVICE] Failed to init fallback transporter:', err);
        return null;
      });
  }

  const transporter = await etherealTransporterPromise;
  return { transporter, isCustomSmtp: false };
}

async function sendViaResend(
  apiKey: string,
  toEmail: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const fromAddress = process.env.SMTP_FROM || 'onboarding@resend.dev';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject,
        html,
        text,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data?.message || 'Resend API failed' };
    }
    return { success: true, messageId: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Background Email Dispatcher
 * Dispatches email asynchronously so the client request is fulfilled instantly.
 */
async function dispatchEmailInBackground(
  cleanEmail: string,
  actionName: string,
  otpCode: string
) {
  const subject = `[AI-IAPLP] ${otpCode} is your Academic Verification Passcode`;
  const textBody = `Your single-use 6-digit institutional verification passcode for ${actionName} is: ${otpCode}\n\nThis code will expire in 10 minutes.\nIf you did not request this, please disregard.`;
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0B0F19; color: #F8FAFC; padding: 40px 16px;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #1E293B; border-radius: 20px; border: 1px solid #334155; padding: 32px; box-shadow: 0 20px 30px rgba(0,0,0,0.5);">
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; padding: 5px 12px; background-color: #1E3A8A; color: #60A5FA; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
            Institutional Security Portal
          </span>
        </div>
        
        <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0 0 12px 0;">
          Verify Your Institutional Identity
        </h1>
        
        <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
          A request was initiated for <strong>${actionName}</strong> for: <code style="color: #60A5FA;">${cleanEmail}</code>. Enter this single-use passcode to proceed:
        </p>
        
        <div style="background-color: #0F172A; border: 1.5px solid #2563EB; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #38BDF8;">
            ${otpCode}
          </span>
        </div>
        
        <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin: 0 0 16px 0;">
          ⏳ This verification passcode expires in <strong>10 minutes</strong> and can only be used once. Never share this code with anyone.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0 16px 0;" />
        
        <p style="color: #475569; font-size: 11px; margin: 0; text-align: center;">
          AI-IAPLP Academic Platform · Supporting Multi-Institution Deployments Across 140+ Accredited Colleges
        </p>
      </div>
    </div>
  `;

  // 1. Try Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resendResult = await sendViaResend(process.env.RESEND_API_KEY, cleanEmail, subject, htmlBody, textBody);
      if (resendResult.success) {
        console.log(`[RESEND OTP DELIVERED] To: ${cleanEmail} | MessageId: ${resendResult.messageId}`);
        return;
      }
    } catch (e) {
      console.warn('[RESEND DISPATCH FAILED]:', e);
    }
  }

  // 2. Try SMTP
  try {
    const { transporter, isCustomSmtp } = await getTransporter();
    if (!transporter) return;

    const fromAddress =
      process.env.SMTP_FROM || '"AI-IAPLP Academic Security" <security@evalplatform.edu>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to: cleanEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    if (isCustomSmtp) {
      console.log(`[SMTP OTP DELIVERED] To: ${cleanEmail}`);
    } else if (info) {
      console.log(`[DEV EMAIL DISPATCHED] To: ${cleanEmail} | MessageId: ${info.messageId}`);
    }
  } catch (error: any) {
    console.error('[EMAIL DISPATCH ERROR]:', error?.message || error);
  }
}

/**
 * Ultra-Fast OTP Generation & Dispatch
 * Immediately registers the OTP and kicks off email delivery without latency.
 */
export async function sendOtpEmail(
  email: string,
  actionType?: string
): Promise<{
  success: boolean;
  message: string;
  hasCustomSmtp: boolean;
  devPasscode?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();

  const hasCustomSmtp = !!(
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    process.env.RESEND_API_KEY
  );

  // Rate limiting: enforce at least 30 seconds between OTP requests per email
  const lastRequest = lastOtpRequestTimestamp.get(cleanEmail);
  const now = Date.now();
  if (lastRequest && now - lastRequest < 30000) {
    const waitSec = Math.ceil((30000 - (now - lastRequest)) / 1000);
    return {
      success: false,
      hasCustomSmtp,
      message: `Rate limit: Please wait ${waitSec}s before requesting a new verification code.`,
    };
  }
  lastOtpRequestTimestamp.set(cleanEmail, now);

  // Cryptographically secure 6-digit OTP generation
  const otpCode = crypto.randomInt(100000, 1000000).toString();

  // Store OTP with 10-minute expiry immediately
  otpStorage.set(cleanEmail, {
    code: otpCode,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  const actionName =
    actionType === 'student-register'
      ? 'Student Account Registration'
      : actionType === 'teacher-register'
      ? 'Faculty Account Registration'
      : 'Institutional Sign-In';

  // Dispatch email in background non-blocking for instant UI response (<50ms)
  void dispatchEmailInBackground(cleanEmail, actionName, otpCode);

  const isProd = process.env.NODE_ENV === 'production';

  return {
    success: true,
    hasCustomSmtp,
    // Never leak devPasscode in production environments
    devPasscode: !hasCustomSmtp && !isProd ? otpCode : undefined,
    message: hasCustomSmtp
      ? `Verification code successfully dispatched to ${cleanEmail}. Check your inbox.`
      : isProd
      ? `Verification code dispatched to ${cleanEmail}.`
      : `Verification code generated for ${cleanEmail}.`,
  };
}

export function verifyOtp(
  email: string,
  code: string
): { success: boolean; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const stored = otpStorage.get(cleanEmail);

  if (!stored) {
    return {
      success: false,
      error: 'No active OTP verification code found for this email. Please request a new code.',
    };
  }

  if (Date.now() > stored.expiresAt) {
    otpStorage.delete(cleanEmail);
    return {
      success: false,
      error: 'The verification code has expired. Please request a fresh code.',
    };
  }

  stored.attempts += 1;
  if (stored.attempts >= 5) {
    // Invalidate immediately after 5 failed attempts to prevent brute force
    otpStorage.delete(cleanEmail);
    return {
      success: false,
      error: 'Too many incorrect attempts. This verification code has been invalidated. Please request a new code.',
    };
  }

  if (stored.code !== code.trim()) {
    const remainingAttempts = 5 - stored.attempts;
    return {
      success: false,
      error: `Incorrect 6-digit verification code (${remainingAttempts} attempts remaining). Please check your email and try again.`,
    };
  }

  // Successfully verified! Consume single-use OTP
  otpStorage.delete(cleanEmail);
  return { success: true };
}
