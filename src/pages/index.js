import { useState } from "react";

export default function Home() {
  const [shop, setShop] = useState("");

  const handleInstall = (e) => {
    e.preventDefault();
    if (!shop) return alert("Please enter your Shopify store domain");

    // shop ko query param me dal kar redirect
    window.location.href = `/api/auth?shop=${shop}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Install Shopify 3D Plugin</h1>
      <form onSubmit={handleInstall} className="flex gap-3">
        <input
          type="text"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          placeholder="yourstore.myshopify.com"
          className="px-4 py-2 w-80 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Install
        </button>
      </form>
    </div>
  );
}
