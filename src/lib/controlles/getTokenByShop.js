const ShopSchema = require("../models/shopSchema"); // Note: path updated

/**
 * Fetch Shopify access token by shop domain
 * @param {string} shop - Shop domain
 * @returns {string|null} - Access token if found, else null
 */
async function getTokenByShop(shop) {
  try {
    const shopData = await ShopSchema.findOne({ shopDomain: shop });
    return shopData ? shopData.accessToken : null;
  } catch (error) {
    console.error("❌ Error fetching token for shop:", error.message);
    return null;
  }
}

module.exports = { getTokenByShop };
