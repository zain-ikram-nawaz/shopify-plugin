// src/pages/api/product/addProduct.js

import connectDB from "../../../lib/connectDB";
import { getTokenByShop } from "../../../lib/controlles/getTokenByShop";
import { productStorage, uploadModelStorage } from "../../../lib/cloudinary"
import multer from "multer";
import axios from "axios";

// Separate multer storages
const uploadImages = multer({ storage: productStorage });
const uploadModels = multer({ storage: uploadModelStorage });

// Custom dynamic storage handler
function dynamicStorage(req, file, cb) {
  if (file.fieldname === "images") {
    uploadImages.storage._handleFile(req, file, cb);
  } else if (file.fieldname === "model") {
    uploadModels.storage._handleFile(req, file, cb);
  }
}

// Multer instance with dynamic storage
const finalUpload = multer({
  storage: { _handleFile: dynamicStorage, _removeFile: () => { } },
}).fields([
  { name: "images", maxCount: 5 },
  { name: "model", maxCount: 1 },
]);

// Disable Next.js bodyParser (important for multer)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  await connectDB().catch((err) => {
    console.error(err);
    return res.status(500).json({ error: "DB connection failed" });
  });

  finalUpload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log("REQ FILES:", req.files);
    const { title, body_html, vendor, product_type } = req.body;
    if (!title || !body_html || !vendor || !product_type) {
      return res.status(400).json({ error: "All fields are required" });
    }
// const shop = "3d-model-project.myshopify.com"
    const shop = req.cookies.shop_domain  // 🟢 From cookie (same as Express)

    try {
      const accessToken = await getTokenByShop(shop);
      if (!accessToken) return res.status(404).json({ error: "Token not found" });

      // Images from Cloudinary
      const imageUrls = (req.files["images"] || []).map((file) => ({
        src: file.path,
        alt: file.originalname,
      }));

      // Single model from Cloudinary
      const modelFile = req.files["model"]?.[0];
      const modelUrl = modelFile ? modelFile.path : null;

      // Shopify product payload
      const payload = {
        product: {
          title,
          body_html,
          vendor,
          product_type,
          status: "active",
          images: imageUrls,
          metafields: modelUrl
            ? [
              {
                namespace: "custom",
                key: "3d_model",
                type: "url",
                value: modelUrl,
              },
            ]
            : [],
        },
      };

      // 1️⃣ Create product
      const createRes = await axios.post(
        `https://${shop}/admin/api/2025-01/products.json`,
        payload,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      const productId = createRes.data.product.id;

      // 2️⃣ Fetch product metafields immediately
      const metafieldsRes = await axios.get(
        `https://${shop}/admin/api/2025-01/products/${productId}/metafields.json`,
        {
          headers: { "X-Shopify-Access-Token": accessToken },
        }
      );

      // 3️⃣ Send back product + metafields in response
      res.json({
        success: true,
        product: createRes.data.product,
        metafields: metafieldsRes.data.metafields,
      });
    } catch (error) {
      console.error(error.response?.data || error.message);
      res.status(500).json({ error: "Failed to add product" });
    }
  });
}
