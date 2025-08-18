import axios from "axios";
import { getTokenByShop } from "@/lib/controlles/getTokenByShop";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Product ID required" });

     const shop = req.cookies.shop_domain // e.g. 3d-model-project.myshopify.com
     const accessToken = await getTokenByShop(shop);
        if (!accessToken) return res.status(404).json({ error: "Token not found" });

    // Shopify delete API
    const deleteRes = await axios.delete(
      `https://${shop}/admin/api/2025-01/products/${id}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (deleteRes.status === 200) {
      return res.status(200).json({ success: true, message: "Product deleted successfully" });
    } else {
      return res.status(deleteRes.status).json({ error: "Failed to delete product" });
    }
  } catch (err) {
    console.error("Delete error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Server error while deleting product" });
  }
}
