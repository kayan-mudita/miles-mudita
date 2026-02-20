import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || "Miles <reports@mudita.com>";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
