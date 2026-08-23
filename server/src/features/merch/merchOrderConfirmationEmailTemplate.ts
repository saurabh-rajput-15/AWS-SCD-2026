export const merchOrderConfirmationEmailTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>
      Order Confirmed — AWS SCD Dhule 2026 Official Merch Store
    </title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background: #f0f2f5;
      font-family: Arial, Helvetica, sans-serif;
      color: #1f2937;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background: #f0f2f5; padding: 32px 16px"
    >
      <tr>
        <td align="center">
          <!-- Card -->
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              background: #ffffff;
              border-radius: 14px;
              overflow: hidden;
              border: 1px solid #e5e7eb;
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            "
          >
            <!-- ═══ HEADER ═══ -->
            <tr>
              <td
                align="center"
                style="background: #0f1923; padding: 32px 30px 28px"
              >
                <!-- Logo centered -->
                <img
                  src="https://aws-scd-dhule.tech/scd-dhule-logo.png"
                  alt="AWS Student Community Day Dhule"
                  width="180"
                  style="display: block; margin: 0 auto 16px; max-width: 180px"
                />

                <h1
                  style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                  "
                >
                  AWS Student Community Day
                </h1>
                <p
                  style="
                    margin: 6px 0 0;
                    color: #ff9900;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                  "
                >
                  Official Merchandise Store &nbsp;·&nbsp; Dhule 2026
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 36px 32px">
                <p style="margin: 0 0 16px; font-size: 16px; color: #374151">
                  Hello <strong>{{customer_name}}</strong>,
                </p>

                <p
                  style="
                    margin: 0 0 24px;
                    font-size: 15px;
                    line-height: 1.7;
                    color: #4b5563;
                  "
                >
                  Thank you for your order! Your payment has been verified via <strong>Razorpay</strong>. Your official AWS Student Community Day Dhule 2026 merchandise is confirmed and recorded in our fulfillment queue.
                </p>

                <!-- Order Success Banner -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background: #ecfdf5;
                    border: 1px solid #a7f3d0;
                    border-radius: 10px;
                    margin-bottom: 24px;
                  "
                >
                  <tr>
                    <td style="padding: 16px 20px">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="vertical-align: middle">
                            <span style="display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px">
                              ✓ Payment Verified
                            </span>
                            <p style="margin: 6px 0 0; font-size: 14px; color: #065f46; font-weight: 600">
                              Order Reference: <span style="color: #ff9900; font-family: monospace; font-size: 15px">{{order_ref}}</span>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Order Summary Table -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 24px;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding: 12px 18px;
                        background: #f9fafb;
                        border-bottom: 1px solid #e5e7eb;
                        font-size: 12px;
                        font-weight: 700;
                        color: #111827;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      "
                    >
                      Order Receipt Details
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 18px">
                      <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 13.5px; color: #374151">
                        <tr>
                          <td style="color: #6b7280; width: 40%">Order Reference:</td>
                          <td align="right" style="font-weight: 700; color: #ff9900; font-family: monospace">{{order_ref}}</td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280">Payment ID:</td>
                          <td align="right" style="font-weight: 600; color: #059669; font-family: monospace">{{payment_id}}</td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280">Product Item:</td>
                          <td align="right" style="font-weight: 700; color: #111827">{{product_title}}</td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280">Quantity:</td>
                          <td align="right" style="font-weight: 600; color: #111827">{{quantity}} Unit(s)</td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280">Item Price:</td>
                          <td align="right" style="color: #374151">₹{{unit_price}} x {{quantity}} = ₹{{subtotal}}</td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280">Delivery Mode:</td>
                          <td align="right" style="color: #374151">{{delivery_option_name}} (₹{{delivery_charge}})</td>
                        </tr>
                        <tr>
                          <td style="color: #6b7280; vertical-align: top">Delivery Address:</td>
                          <td align="right" style="color: #4b5563; max-width: 250px">{{delivery_address}}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top: 10px; border-top: 1px solid #e5e7eb"></td>
                        </tr>
                        <tr>
                          <td style="font-size: 15px; font-weight: 700; color: #111827">Total Amount Paid:</td>
                          <td align="right" style="font-size: 17px; font-weight: 800; color: #ff9900">₹{{total_amount}} INR</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Live Tracking CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px">
                  <tr>
                    <td align="center">
                      <a
                        href="{{order_url}}"
                        target="_blank"
                        style="
                          display: block;
                          background: #ff9900;
                          color: #111827;
                          text-align: center;
                          padding: 14px 28px;
                          border-radius: 8px;
                          font-size: 14px;
                          font-weight: 800;
                          text-decoration: none;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          box-shadow: 0 2px 8px rgba(255, 153, 0, 0.35);
                        "
                      >
                        Track Live Order Status &amp; View Invoice →
                      </a>
                    </td>
                  </tr>
                </table>



                <!-- Info Box -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    margin-bottom: 24px;
                  "
                >
                  <tr>
                    <td style="padding: 16px 18px">
                      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #1e293b;">
                        📦 Fulfillment &amp; Handover Details
                      </p>
                      <p
                        style="
                          margin: 0;
                          font-size: 12.5px;
                          color: #475569;
                          line-height: 1.6;
                        "
                      >
                        • <strong>Campus Pickup</strong>: Collect from the official Organizing Desk at SVKM IOT Dhule Campus with your Order Reference ID.<br/>
                        • <strong>Hand Delivery / Courier</strong>: Our team leader or courier partner will dispatch and deliver to your given address with tracking updates.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- ═══ CONTACT HELP & SUPPORT ═══ -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px 20px;
                  "
                >
                  <tr>
                    <td>
                      <p style="margin: 0 0 8px; font-size: 13px; font-weight: bold; color: #111827; text-align: center">
                        Need Help With Your Order?
                      </p>
                      <p style="margin: 0 0 6px; font-size: 12.5px; color: #4b5563; text-align: center">
                        Official Support Email:
                        <a
                          href="mailto:info@aws-scd-dhule.tech"
                          style="color: #ff9900; font-weight: 700; text-decoration: none"
                        >
                          info@aws-scd-dhule.tech
                        </a>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center">
                        Organizers Helpline: Soham (+91 98343 82337) &nbsp;·&nbsp; Vaibhav (+91 80072 98092)
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ═══ FOOTER ═══ -->
            <tr>
              <td
                align="center"
                style="
                  background: #0f1923;
                  padding: 28px 30px;
                  text-align: center;
                "
              >
                <img
                  src="https://aws-scd-2026.vercel.app/AWS_Builder.png"
                  alt="AWS Student Community Day"
                  style="display: block; margin: 0 auto 14px; max-width: 250px"
                />

                <p
                  style="
                    margin: 0;
                    color: #d1d5db;
                    font-size: 13px;
                    font-weight: 600;
                  "
                >
                  AWS Student Community Day Dhule 2026
                </p>
                <p style="margin: 6px 0 0; color: #9ca3af; font-size: 12px">
                  Official Merchandise &amp; Builder Collectibles Desk
                </p>
                <p style="margin: 16px 0 0; color: #4b5563; font-size: 11px">
                  © 2026 AWS Student Community Day Dhule. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
          <!-- /Card -->
        </td>
      </tr>
    </table>
  </body>
</html>`;
