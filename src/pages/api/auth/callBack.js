import axios from "axios";
import connectDB from "../../../lib/connectDB";
import Shop from "../../../lib/models/shopSchema"
import { injectModelViewer } from "../../../lib/controlles/injectModelViewer"

export default async function callback(req, res) {
  await connectDB();

  const { shop, code } = req.query;
  if (!shop || !code) {
    return res.status(400).send("Missing shop or code");
  }

  try {
    const tokenResponse = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }
    );

    const accessToken = tokenResponse.data.access_token;

    await Shop.findOneAndUpdate(
      { shopDomain: shop },
      { accessToken },
      { upsert: true, new: true }
    );

    res.setHeader(
      "Set-Cookie",
      `shop_domain=${shop}; Path=/; HttpOnly; Max-Age=${24 * 60 * 60}`
    );

    await injectModelViewer(shop, accessToken);

    res.redirect("/");
  } catch (error) {
    console.error("❌ Error exchanging token:", error.response?.data || error.message);
    res.status(500).send("Error exchanging token");
  }
}
