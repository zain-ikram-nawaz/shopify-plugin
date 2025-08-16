import crypto from "crypto";

function generateNonce() {
  return crypto.randomBytes(16).toString("hex");
}

export default function index(req, res) {
  const { shop } = req.query;
  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  const state = generateNonce();
  const redirectUri = `${process.env.FORWARDING_ADDRESS}/api/auth/callBack`;

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SCOPES}&state=${state}&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
}
