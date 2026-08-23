import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set — email sending disabled");
      return;
    }

    const data = await resend.emails.send({
      from: process.env.MAIL_FROM || 'Society Admin <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    console.log("Message sent via Resend: %s", data.data?.id);
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
  }
}
