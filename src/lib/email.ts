const MAILJET_APIKEY = process.env.MAILJET_APIKEY!;
const MAILJET_SECRET = process.env.MAILJET_SECRET!;
const FROM_EMAIL = "perfumeskartel@gmail.com";
const FROM_NAME = "Kartel";

interface SendEmailParams {
  to: { email: string; name?: string };
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const credentials = btoa(`${MAILJET_APIKEY}:${MAILJET_SECRET}`);

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
