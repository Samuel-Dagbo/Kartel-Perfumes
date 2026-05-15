export function wrapLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:'Georgia','Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:40px 30px;text-align:center;">
              <h1 style="margin:0;font-family:'Georgia','Times New Roman',serif;font-size:28px;font-weight:400;letter-spacing:6px;color:#d4af37;text-transform:uppercase;">Kartel</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#a8a8a8;letter-spacing:3px;font-style:italic;">Artisan Fragrances</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#1a1a2e;padding:30px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#888;letter-spacing:1px;">Kartel &mdash; Artisan Fragrances</p>
              <p style="margin:0;font-size:11px;color:#666;">Crafted in limited batches for the discerning few.</p>
              <p style="margin:16px 0 0;font-size:11px;color:#555;">
                <a href="mailto:perfumeskartel@gmail.com" style="color:#d4af37;text-decoration:none;">perfumeskartel@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function orderConfirmationTemplate(params: {
  customerName: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}): string {
  const itemsHtml = params.items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;">${item.name} x${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:right;">$${item.price.toFixed(2)}</td>
    </tr>`
    )
    .join("");

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;font-weight:400;">Thank you for your order</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">Hi ${params.customerName}, we've received your order and will process it shortly.</p>

    <div style="background-color:#f9f6f2;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#888;letter-spacing:1px;text-transform:uppercase;">Order Reference</p>
      <p style="margin:4px 0 0;font-size:18px;color:#1a1a2e;font-weight:600;">${params.orderNumber}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="padding:8px 0;border-bottom:2px solid #1a1a2e;font-size:12px;color:#1a1a2e;letter-spacing:1px;text-transform:uppercase;text-align:left;">Item</th>
          <th style="padding:8px 0;border-bottom:2px solid #1a1a2e;font-size:12px;color:#1a1a2e;letter-spacing:1px;text-transform:uppercase;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding:16px 0 0;font-size:16px;color:#1a1a2e;font-weight:600;">Total</td>
          <td style="padding:16px 0 0;font-size:16px;color:#1a1a2e;font-weight:600;text-align:right;">$${params.total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>

    <p style="margin:0;font-size:13px;color:#888;line-height:1.6;font-style:italic;">A member of our team will confirm once your order ships. If you have any questions, reply to this email.</p>
  `;

  return wrapLayout(content);
}

export function testEmailTemplate(): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;font-weight:400;">You're connected!</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#666;line-height:1.6;">This is a test email from <strong>Kartel</strong> to confirm that your email system is working perfectly.</p>
    <div style="background-color:#f9f6f2;border-radius:8px;padding:20px;text-align:center;">
      <p style="margin:0 0 8px;font-size:32px;line-height:1;">✅</p>
      <p style="margin:0;font-size:14px;color:#333;font-weight:600;">Email service is operational</p>
      <p style="margin:4px 0 0;font-size:12px;color:#888;">All future order confirmations and notifications will be delivered through this channel.</p>
    </div>
    <p style="margin:20px 0 0;font-size:13px;color:#888;line-height:1.6;font-style:italic;">If you're seeing this, everything is set up correctly.</p>
  `;

  return wrapLayout(content);
}
