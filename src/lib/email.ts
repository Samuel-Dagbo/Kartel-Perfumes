const FROM_EMAIL = process.env.MAILJET_FROM_EMAIL;
const FROM_NAME = process.env.MAILJET_FROM_NAME || "Kartel";

interface SendEmailParams {
  to: { email: string; name?: string };
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.MAILJET_APIKEY;
  const secret = process.env.MAILJET_SECRET;
  if (!FROM_EMAIL) {
    throw new Error("MAILJET_FROM_EMAIL is not configured");
  }
  if (!apiKey || !secret) {
    console.error("Mailjet not configured: missing MAILJET_APIKEY or MAILJET_SECRET");
    return;
  }
  const credentials = Buffer.from(`${apiKey}:${secret}`).toString("base64");

  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: FROM_EMAIL, Name: FROM_NAME },
          To: [{ Email: to.email, Name: to.name || to.email }],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Mailjet error: ${data.ErrorMessage || data.Status || response.statusText}`
    );
  }

  return data;
}
