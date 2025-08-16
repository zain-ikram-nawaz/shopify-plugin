import connectDB from "../../../lib/connectDB"
import { getTokenByShop } from "../../../lib/controlles/getTokenByShop"
import { productStorage, uploadModelStorage } from "../../../lib/cloudinary";
import multer from "multer";
import nc from "next-connect";
import axios from "axios";

// Multer upload instances
const uploadImages = multer({ storage: productStorage });
const uploadModels = multer({ storage: uploadModelStorage });

// Use next-connect to handle middleware
const addProduct = nc({
  onError(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  },
});

// Middleware for multiple file fields
const multiUpload = multer().fields([
  { name: "images", maxCount: 5 },
  { name: "model", maxCount: 1 },
]);

addProduct.use(async (req, res, next) => {
  await connectDB();
  next();
});

addProduct.use((req, res, next) => {
  multiUpload(req, res, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    next();
  });
});

addProduct.post(async (req, res) => {
  const { title, body_html, vendor, product_type } = req.body;

  if (!title || !body_html || !vendor || !product_type) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const shop = req.cookies.shop_domain;
  if (!shop) return res.status(400).json({ error: "Shop domain cookie missing" });

  try {
    const accessToken = await getTokenByShop(shop);
    if (!accessToken) return res.status(404).json({ error: "Token not found" });

    // Images from Cloudinary
    const imageUrls = (req.files?.images || []).map((file) => ({
      src: file.path,
      alt: file.originalname,
    }));

    // Single model from Cloudinary
    const modelFile = req.files?.model?.[0];
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

    // 1️⃣ Create product in Shopify
    const createRes = await axios.post(
      `https://${shop}/admin/api/2025-01/products.json`,
      payload,
      { headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" } }
    );

    const productId = createRes.data.product.id;

    // 2️⃣ Fetch product metafields
    const metafieldsRes = await axios.get(
      `https://${shop}/admin/api/2025-01/products/${productId}/metafields.json`,
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );

    // 3️⃣ Send response
    res.status(200).json({
      success: true,
      product: createRes.data.product,
      metafields: metafieldsRes.data.metafields,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to add product" });
  }
});

export const config = {
  api: {
    bodyParser: false, // multer will handle parsing
  },
};

export default handler;
