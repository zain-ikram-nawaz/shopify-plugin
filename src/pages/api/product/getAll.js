import connectDB from "../../../lib/connectDB";
import { getTokenByShop } from "../../../lib/controlles/getTokenByShop";
import axios from "axios";

export default async function getAll(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await connectDB().catch((err) => {
    console.error(err);
    return res.status(500).json({ error: "DB connection failed" });
  });

  const shop = req.cookies.shop_domain // 🔑 Tumhare shop ka naam

  try {
    const accessToken = await getTokenByShop(shop);
    if (!accessToken) {
      return res.status(404).json({ error: "Token not found" });
    }

    // 🔹 Shopify products fetch
    const response = await axios.get(
      `https://${shop}/admin/api/2025-01/products.json?limit=50`, // 50 ek sath
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      products: response.data.products,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
