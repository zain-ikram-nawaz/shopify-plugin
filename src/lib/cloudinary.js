import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary config using .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Product images storage
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "product",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// 3D models storage
const uploadModelStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "shopify_models",
    allowed_formats: ["glb", "usdz"],
  },
});

export { cloudinary, productStorage, uploadModelStorage };
