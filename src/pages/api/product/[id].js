// pages/api/product/[id].js
import axios from "axios";
import { getTokenByShop } from "../../../lib/controlles/getTokenByShop";

export default async function handler(req, res) {
  const { id } = req.query;
  const shop = req.cookies.shop_domain
  // console.log(id,"id")
  try {
    const accessToken = await getTokenByShop(shop);
    const response = await axios.get(
      `https://${shop}/admin/api/2025-01/products/${id}/metafields.json`,
      {
        headers: { "X-Shopify-Access-Token": accessToken },
      }
    );

    res.status(200).json({
      success: true,
      metafields: response.data.metafields,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch metafields",
    });
  }
}
