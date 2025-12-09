const nodemailer = require('nodemailer');

function createTransport() {
  const host = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in';
  const port = parseInt(process.env.ZOHO_SMTP_PORT || '465', 10);
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

function formatCurrency(n) {
  const v = Number(n || 0);
  return `₹${v.toFixed(2)}`;
}

function buildOrderHtml({ order, customer, address, items, summary }) {
  const rows = (items || [])
    .map((it, idx) => {
      const mrp = it.mrp_price != null ? Number(it.mrp_price) : null;
      const price = Number(it.price || 0);
      const qty = Number(it.quantity || 1);
      const lineMrp = mrp ? mrp * qty : null;
      const linePrice = price * qty;
      const discountPct =
        mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

      return `
        <tr>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;font-size:12px;color:#555;">${idx + 1}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;">
            <div style="font-weight:600;color:#111;font-size:13px;">${it.product_name || ''}</div>
            <div style="font-size:11px;color:#777;margin-top:2px;">Variant: ${it.variant_name || it.variant_id || ''}</div>
          </td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;font-size:12px;color:#555;">
            ${
              lineMrp
                ? `<span style="text-decoration:line-through;color:#999;">${formatCurrency(
                    lineMrp
                  )}</span>`
                : '-'
            }
          </td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;font-size:12px;color:#e53935;font-weight:600;">
            ${discountPct ? `${discountPct}%` : '-'}
          </td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;font-size:12px;color:#111;">
            ${formatCurrency(price)}
          </td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;font-size:12px;color:#111;">
            ${qty}
          </td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;font-size:12px;color:#111;font-weight:600;">
            ${formatCurrency(linePrice)}
          </td>
        </tr>
      `;
    })
    .join('');

  const orderId = order.order_number || order.order_id || '';

  const logoUrl =
    process.env.BRAND_LOGO_URL ||
    'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/Vector-1%20(3).png';

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Order Confirmation</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { margin: 0; padding: 0; background-color: #f3f4f6; }
        table { border-spacing: 0; border-collapse: collapse; }
        img { border: 0; display: block; max-width: 100%; }
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; }
          .section-padding { padding-left: 16px !important; padding-right: 16px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f3f4f6;">
      <center style="width:100%;background-color:#f3f4f6;">
        <table role="presentation" width="100%" style="max-width:100%;margin:0 auto;background-color:#f3f4f6;">
          <tr>
            <td align="center" style="padding:24px 12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:680px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                
                <tr>
                  <td align="center" style="padding:18px 20px 12px;background:#ffffff;border-bottom:1px solid #f3f4f6;">
                    <a href="https://uandinaturals.com">
                      <img src="${logoUrl}" alt="U&I Naturals" width="140" />
                    </a>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:10px 20px;background:#D8234B;color:#ffffff;font-size:13px;font-weight:600;">
                    ORDER CONFIRMED
                  </td>
                </tr>

                <tr>
                  <td class="section-padding" style="padding:18px 24px 10px;font-family:Arial,Helvetica,sans-serif;">
                    <h2 style="margin:0;font-size:18px;color:#111111;font-weight:600;">Thank you for shopping with U&I Naturals</h2>
                    <p style="margin:0;font-size:13px;color:#4b5563;">
                      Order ID: <span style="font-weight:600;color:#111111;">#${orderId}</span>
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">
                      Placed on ${new Date().toLocaleString()}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td class="section-padding" style="padding:10px 24px 4px;font-family:Arial,Helvetica,sans-serif;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td valign="top" style="width:50%;padding-right:10px;">
                          <h3 style="margin:0;font-size:14px;color:#111111;font-weight:600;">Customer Details</h3>
                          <p style="margin:0;font-size:13px;color:#111111;">
                            ${customer?.name || customer?.full_name || '-'}
                          </p>
                          <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">
                            ${customer?.email || '-'}
                          </p>
                          <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">
                            ${customer?.mobile || customer?.phone || '-'}
                          </p>
                        </td>
                        <td valign="top" style="width:50%;padding-left:10px;">
                          <h3 style="margin:0;font-size:14px;color:#111111;font-weight:600;">Delivery Address</h3>
                          <p style="margin:0;font-size:13px;color:#111111;">
                            ${address?.address_line1 || address?.address || '-'}
                          </p>
                          ${
                            address?.address_line2
                              ? `<p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${address.address_line2}</p>`
                              : ''
                          }
                          <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">
                            ${[address?.city, address?.state, address?.pincode].filter(Boolean).join(', ')}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td class="section-padding" style="padding:10px 24px 6px;font-family:Arial,Helvetica,sans-serif;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#111111;font-weight:600;">Order Summary</h3>
                    <table role="presentation" width="100%">
                      <thead>
                        <tr>
                          <th align="left" style="padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">#</th>
                          <th align="left" style="padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">Item</th>
                          <th align="left" style="padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">MRP</th>
                          <th align="left" style="padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">Discount</th>
                          <th align="left" style="padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">Price</th>
                          <th align="left" style="padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">Qty</th>
                          <th align="left" style="padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td class="section-padding" style="padding:10px 24px 16px;border-top:1px solid #f3f4f6;font-family:Arial,Helvetica,sans-serif;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td style="font-size:13px;color:#4b5563;padding:4px 0;">Total MRP</td>
                        <td align="right" style="font-size:13px;color:#111;padding:4px 0;">${formatCurrency(summary.totalMrp)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#4b5563;padding:4px 0;">Discount on MRP</td>
                        <td align="right" style="font-size:13px;color:#16a34a;padding:4px 0;">- ${formatCurrency(summary.discountOnMrp)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#4b5563;padding:4px 0;">Delivery</td>
                        <td align="right" style="font-size:13px;color:#111;padding:4px 0;">${formatCurrency(summary.deliveryCharge)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:15px;color:#111;font-weight:700;padding-top:8px;border-top:1px dashed #e5e7eb;">Order Total</td>
                        <td align="right" style="font-size:15px;color:#111;font-weight:700;padding-top:8px;border-top:1px dashed #e5e7eb;">${formatCurrency(summary.totalPrice)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 24px 16px;background:#f9fafb;border-top:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">
                      You will receive another email once your order is shipped.
                    </p>
                    <p style="margin:0;font-size:12px;color:#9ca3af;">
                      Thank you for choosing U&I Naturals.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
  </html>
  `;
}

async function sendOrderEmails({ order, customer, address, items, summary }) {
  const transporter = createTransport();
  const from = `"U&I Naturals" <${process.env.ZOHO_SMTP_USER || 'info@uandinaturals.com'}>`;
  const adminEmail = process.env.ADMIN_EMAIL || 'info@uandinaturals.com';
  const subject = `U&I Order Confirmation - #${order.order_number || order.order_id || ''}`;
  const html = buildOrderHtml({ order, customer, address, items, summary });

  const message = {
    from,
    to: customer?.email || adminEmail,
    bcc: adminEmail,
    subject,
    html,
  };

  try {
    await transporter.sendMail(message);
    console.log(`[mailer] Sent email to ${message.to} (BCC: ${adminEmail})`);
  } catch (err) {
    console.error('[mailer] Failed on port 465:', err.message);

    // Fallback to 587
    try {
      console.warn('[mailer] Retrying via TLS on port 587');
      const fallback = nodemailer.createTransport({
        host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in',
        port: 587,
        secure: false,
        auth: { user: process.env.ZOHO_SMTP_USER, pass: process.env.ZOHO_SMTP_PASS },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });

      await fallback.sendMail(message);
      console.log(`[mailer] Sent via fallback 587 to ${message.to} (BCC: ${adminEmail})`);
    } catch (e) {
      console.error('[mailer] Final failure:', e.message);
      throw e;
    }
  }
}

module.exports = { sendOrderEmails };
