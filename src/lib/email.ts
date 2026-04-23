import { Resend } from "resend";
import { generateInvoicePDF } from "./invoice";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendOrderConfirmationEmail(order: any) {
  if (!order.shippingAddress.email) return;

  const itemsList = order.items
    .map(
      (item: any) => `
    <tr style="border-bottom: 1px solid #334155;">
      <td style="padding: 12px 0;">
        <p style="margin: 0; font-weight: 600; color: #f8fafc;">${item.productName}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">SKU: ${item.variant.sku}</p>
      </td>
      <td style="padding: 12px 0; text-align: right; color: #f8fafc;">x${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; color: #f8fafc;">৳${item.subtotal.toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  try {
    const invoiceBuffer = await generateInvoicePDF(order);

    const { data, error } = await resend.emails.send({
      from: "Velocity <onboarding@resend.dev>",
      to: order.shippingAddress.email,
      subject: `Order Confirmed - #${order.orderNumber}`,
      attachments: [
        {
          filename: `Invoice-${order.orderNumber}.pdf`,
          content: invoiceBuffer,
        },
      ],
      html: `
        <div style="background-color: #0f172a; color: #e2e8f0; font-family: sans-serif; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden;">
            <div style="padding: 40px 30px; background-color: #000000; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">VELOCITY</h1>
              <p style="color: #3b82f6; margin-top: 10px; font-weight: 500;">PREMIUM SPORTS GEAR</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #ffffff; margin: 0 0 20px;">Thanks for your order, ${order.shippingAddress.fullName}!</h2>
              <p style="line-height: 1.6; color: #94a3b8;">
                We've received your order <strong>#${order.orderNumber}</strong> and we're getting it ready for shipment. 
                You'll receive another email with a tracking link once it's on the way.
              </p>
              
              <div style="margin-top: 40px; border-top: 1px solid #334155;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="padding: 12px 0; text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase;">Items</th>
                      <th style="padding: 12px 0; text-align: right; color: #64748b; font-size: 12px; text-transform: uppercase;">Qty</th>
                      <th style="padding: 12px 0; text-align: right; color: #64748b; font-size: 12px; text-transform: uppercase;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsList}
                  </tbody>
                </table>
              </div>
              
              <div style="margin-top: 20px; padding: 20px; background-color: #0f172a; border-radius: 12px;">
                <table style="width: 100%; color: #94a3b8; font-size: 14px;">
                  <tr>
                    <td style="padding: 4px 0;">Subtotal</td>
                    <td style="padding: 4px 0; text-align: right;">৳${order.subtotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;">Shipping</td>
                    <td style="padding: 4px 0; text-align: right;">৳${order.shippingCost.toLocaleString()}</td>
                  </tr>
                  ${
                    order.discount > 0
                      ? `<tr><td style="padding: 4px 0; color: #10b981;">Discount</td><td style="padding: 4px 0; text-align: right; color: #10b981;">-৳${order.discount.toLocaleString()}</td></tr>`
                      : ""
                  }
                  <tr style="color: #ffffff; font-weight: bold; font-size: 18px;">
                    <td style="padding: 12px 0 0;">Total</td>
                    <td style="padding: 12px 0 0; text-align: right;">৳${order.total.toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="padding: 20px; background-color: #334155; border-radius: 12px;">
                  <h4 style="margin: 0 0 10px; color: #ffffff; font-size: 14px;">Shipping Address</h4>
                  <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city} ${order.shippingAddress.postalCode}<br>
                    Phone: ${order.shippingAddress.phone}
                  </p>
                </div>
              </div>
              
              <div style="margin-top: 40px; text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/track-order?number=${order.orderNumber}" 
                   style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px;">
                  Track Your Order
                </a>
              </div>
            </div>
            
            <div style="padding: 30px; background-color: #0f172a; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                &copy; 2026 VELOCITY Sports. All rights reserved.<br>
                This is an automated email, please do not reply.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email send catch error:", err);
    return { success: false, error: err };
  }
}

export async function sendContactEmail(contactData: { name: string; email: string; subject: string; message: string }) {
  const { name, email, subject, message } = contactData;

  try {
    const { data, error } = await resend.emails.send({
      from: "Velocity Contact <onboarding@resend.dev>",
      to: "syedtaj1234@gmail.com",
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="background-color: #0f172a; color: #e2e8f0; font-family: sans-serif; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden;">
            <div style="padding: 30px; background-color: #000000; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 2px;">CONTACT TRANSMISSION</h1>
            </div>
            <div style="padding: 40px 30px;">
              <div style="margin-bottom: 24px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">From</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0;">${name} (${email})</p>
              </div>
              <div style="margin-bottom: 24px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">Subject</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0;">${subject}</p>
              </div>
              <div style="padding: 20px; background-color: #0f172a; border-radius: 12px; border: 1px solid #334155;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 12px;">Message Intelligence</p>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend contact email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Contact email catch error:", err);
    return { success: false, error: err };
  }
}
