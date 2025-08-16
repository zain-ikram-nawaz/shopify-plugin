export default function handler(req, res) {
  res.status(200).json({
    key: process.env.SHOPIFY_API_KEY || "NOT_FOUND",
  });
}