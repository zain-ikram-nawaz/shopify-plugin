import { useEffect, useState } from "react";

export default function ProductPreview({ product, onClose }) {
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchMetafields() {
    try {
      const res = await fetch(`/api/product/${product.id}`);
      const data = await res.json();
      if(data){
        setModelUrl(data.metafields[0].value);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (product?.id) {
    fetchMetafields();
  }
}, [product?.id]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">3D Preview: {product.title}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Back to Products
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center bg-gray-50">
            {loading ? (
              <p className="text-gray-500">Loading 3D model...</p>
            ) : modelUrl ? (
              <div className="text-center">
                <p className="text-gray-500 mb-2">3D Model Viewer</p>
                <p className="text-sm text-gray-400">Model: {modelUrl}</p>
                {/* yahan tum GLTF/GLB viewer embed kar sakte ho */}
              </div>
            ) : (
              <p className="text-gray-400">No 3D model available</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Product Details</h3>
            <p><span className="font-medium">Name:</span> {product.title}</p>
            <p><span className="font-medium">Price:</span> ${product.price}</p>
            <p><span className="font-medium">3D Model:</span> {modelUrl ? "Uploaded" : "Not available"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Description</h3>
            <p>{product.description || "No description provided"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Thumbnail</h3>
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-auto rounded"
              />
            ) : (
              <p className="text-gray-500">No thumbnail available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
