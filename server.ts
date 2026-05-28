import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/send-confirmation", async (req, res) => {
    const { name, phone, packageName, amount, refId } = req.body;

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ADMIN_WHATSAPP_NUMBER } = process.env;

    // Send WhatsApp Admin Notification
    if (WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID && ADMIN_WHATSAPP_NUMBER) {
      try {
        const message = `🚗 *New Booking Received*\n\n*Customer Name:* ${name}\n*Phone Number:* ${phone}\n*Vehicle Type:* ${req.body.vehicle || 'Not specified'}\n*Service Selected:* ${packageName}\n*Address:* ${req.body.address || 'Not specified'}\n*Total Amount:* ₹${amount}\n\nPlease check the Admin Panel for full details.`;
        
        await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: ADMIN_WHATSAPP_NUMBER.replace('+', ''),
            type: 'text',
            text: { body: message }
          })
        });
        console.log(`[WhatsApp] Success: Admin notification sent for ref ${refId}`);
      } catch (error) {
        console.error("[WhatsApp] Error sending admin notification:", error);
      }
    }

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      try {
        const { default: twilio } = await import("twilio");
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        
        await client.messages.create({
          body: `Hi ${name}, your Dritzz car wash (Ref: ${refId}) for ${packageName} is confirmed. Total: ₹${amount}. Our professional will contact you shortly!`,
          from: TWILIO_PHONE_NUMBER,
          to: phone.startsWith('+') ? phone : `+91${phone}` // Assuming India context based on ₹
        });

        console.log(`[Twilio] Success: Confirmation sent to ${phone}`);
        return res.json({ success: true, message: "Real SMS sent via Twilio" });
      } catch (error) {
        console.error("[Twilio] Error:", error);
        // Fallback to simulation in case of error during dev/testing
      }
    }

    console.log(`[SMS Simulation] Sending confirmation to ${phone}...`);
    // Simulation delay
    setTimeout(() => {
      res.json({ success: true, message: "Simulated confirmation sent successfully" });
    }, 1000);
  });

  // Shopify Proxy Endpoint
  app.post("/api/shopify/graphql", async (req, res) => {
    const { SHOPIFY_SHOP_NAME, SHOPIFY_STOREFRONT_ACCESS_TOKEN } = process.env;

    if (!SHOPIFY_SHOP_NAME || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      console.warn("[Shopify Proxy] Missing credentials. Returning mock data for preview/demo purposes.");
      
      // Return mock data for the 'products' query if credentials are missing
      if (req.body?.query?.includes("products")) {
        return res.json({
          data: {
            products: {
              nodes: [
                {
                  id: "gid://shopify/Product/1",
                  title: "Elite Ceramic Coating",
                  handle: "elite-ceramic-coating",
                  description: "Professional grade ceramic coating for long-lasting protection and shine. Gives your car a mirror-like finish that lasts for years.",
                  images: { nodes: [{ url: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800", altText: "Ceramic Coating" }] },
                  variants: { nodes: [{ price: { amount: "2499.00", currencyCode: "INR" } }] }
                },
                {
                  id: "gid://shopify/Product/2",
                  title: "Premium Microfiber Set",
                  handle: "microfiber-set",
                  description: "Ultra-soft, highly absorbent microfiber towels designed for lint-free cleaning and polishing without scratching.",
                  images: { nodes: [{ url: "https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&q=80&w=800", altText: "Microfiber Towels" }] },
                  variants: { nodes: [{ price: { amount: "899.00", currencyCode: "INR" } }] }
                },
                {
                  id: "gid://shopify/Product/3",
                  title: "Dritzz Gloss Shampoo",
                  handle: "dritzz-shampoo",
                  description: "pH-neutral car shampoo that removes dirt safely while adding a layer of high-gloss protection during every wash.",
                  images: { nodes: [{ url: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800", altText: "Car Shampoo" }] },
                  variants: { nodes: [{ price: { amount: "1299.00", currencyCode: "INR" } }] }
                }
              ]
            }
          }
        });
      }
      
      return res.status(500).json({ 
        error: "Shopify credentials not configured in environment. Please set SHOPIFY_SHOP_NAME and SHOPIFY_STOREFRONT_ACCESS_TOKEN in your environment variables." 
      });
    }

    try {
      const response = await fetch(
        `https://${SHOPIFY_SHOP_NAME}.myshopify.com/api/2024-04/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
          },
          body: JSON.stringify(req.body),
        }
      );

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("[Shopify Proxy] Error:", error);
      res.status(500).json({ error: "Failed to fetch from Shopify" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
