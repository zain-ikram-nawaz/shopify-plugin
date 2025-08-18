// src/pages/api/product/updateProduct.js
import connectDB from "../../../../lib/connectDB"
import { getTokenByShop } from "../../../../lib/controlles/getTokenByShop"
import { productStorage, uploadModelStorage } from "../../../../lib/cloudinary"
import multer from "multer";
import axios from "axios";

// Separate multer storages
const uploadImages = multer({ storage: productStorage });
const uploadModels = multer({ storage: uploadModelStorage });

// Dynamic storage handler
function dynamicStorage(req, file, cb) {
  if (file.fieldname === "images") {
    uploadImages.storage._handleFile(req, file, cb);
  } else if (file.fieldname === "model") {
    uploadModels.storage._handleFile(req, file, cb);
  }
}

const finalUpload = multer({
  storage: { _handleFile: dynamicStorage, _removeFile: () => { } },
}).fields([
  { name: "images", maxCount: 5 },
  { name: "model", maxCount: 1 },
]);

// Disable bodyParser
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "PUT")
    return res.status(405).json({ error: "Method not allowed" });

  await connectDB().catch((err) => {
    console.error(err);
    return res.status(500).json({ error: "DB connection failed" });
  });

  finalUpload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: err.message });
    const { updateProduct } = req.query;
    console.log(updateProduct, "id")
    const { title, body_html, vendor, product_type, price } = req.body;
    if (!updateProduct) return res.status(400).json({ error: "Product ID required" });

    const shop = req.cookies.shop_domain

    try {
      const accessToken = await getTokenByShop(shop);
      if (!accessToken) return res.status(404).json({ error: "Token not found" });

      // Handle Cloudinary Images
      const imageUrls = (req.files["images"] || []).map((file) => ({
        src: file.path,
        alt: file.originalname,
      }));

      // Handle Cloudinary Model
      const modelFile = req.files["model"]?.[0];
      const modelUrl = modelFile ? modelFile.path : null;

      // Shopify update payload
      const payload = {
        product: {
          id: updateProduct,
          title,
          body_html,
          vendor,
          product_type,
          price,
          images: imageUrls.length > 0 ? imageUrls : undefined, // replace only if new uploaded
        },
      };

      // Update product in Shopify
      const updateRes = await axios.put(
        `https://${shop}/admin/api/2025-01/products/${updateProduct}.json`,
        payload,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      // If new model uploaded → replace metafield
      if (modelUrl) {
        await axios.post(
          `https://${shop}/admin/api/2025-01/metafields.json`,
          {
            metafield: {
              namespace: "custom",
              key: "3d_model",
              type: "url",
              value: modelUrl,
              owner_resource: "product",
              owner_id: updateProduct,
            },
          },
          {
            headers: {
              "X-Shopify-Access-Token": accessToken,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Fetch latest metafields
      const metafieldsRes = await axios.get(
        `https://${shop}/admin/api/2025-01/products/${updateProduct}/metafields.json`,
        {
          headers: { "X-Shopify-Access-Token": accessToken },
        }
      );

      res.json({
        success: true,
        product: updateRes.data.product,
        metafields: metafieldsRes.data.metafields,
      });
    } catch (error) {
      console.error(error.response?.data || error.message);
      res.status(500).json({ error: "Failed to update product" });
    }
  });
}
