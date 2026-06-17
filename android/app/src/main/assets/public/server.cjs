var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/send-confirmation", async (req, res) => {
    const { name, phone, packageName, amount, refId } = req.body;
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ADMIN_WHATSAPP_NUMBER } = process.env;
    if (WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID && ADMIN_WHATSAPP_NUMBER) {
      try {
        const message = `\u{1F697} *New Booking Received*

*Customer Name:* ${name}
*Phone Number:* ${phone}
*Vehicle Type:* ${req.body.vehicle || "Not specified"}
*Service Selected:* ${packageName}
*Address:* ${req.body.address || "Not specified"}
*Total Amount:* \u20B9${amount}

Please check the Admin Panel for full details.`;
        await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: ADMIN_WHATSAPP_NUMBER.replace("+", ""),
            type: "text",
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
          body: `Hi ${name}, your Dritzz car wash (Ref: ${refId}) for ${packageName} is confirmed. Total: \u20B9${amount}. Our professional will contact you shortly!`,
          from: TWILIO_PHONE_NUMBER,
          to: phone.startsWith("+") ? phone : `+91${phone}`
          // Assuming India context based on ₹
        });
        console.log(`[Twilio] Success: Confirmation sent to ${phone}`);
        return res.json({ success: true, message: "Real SMS sent via Twilio" });
      } catch (error) {
        console.error("[Twilio] Error:", error);
      }
    }
    console.log(`[SMS Simulation] Sending confirmation to ${phone}...`);
    setTimeout(() => {
      res.json({ success: true, message: "Simulated confirmation sent successfully" });
    }, 1e3);
  });
  app.post("/api/shopify/graphql", async (req, res) => {
    const { SHOPIFY_SHOP_NAME, SHOPIFY_STOREFRONT_ACCESS_TOKEN } = process.env;
    if (!SHOPIFY_SHOP_NAME || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      console.warn("[Shopify Proxy] Missing credentials. Returning mock data for preview/demo purposes.");
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
            "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN
          },
          body: JSON.stringify(req.body)
        }
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("[Shopify Proxy] Error:", error);
      res.status(500).json({ error: "Failed to fetch from Shopify" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
