import { useState, useEffect } from "react";

export default function EditProductModal({ product, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: "",
    body_html: "",
    vendor: "3D Products",
    product_type: "3D Model",
    price: "",
    images: [],
    model: null,
  });
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        body_html: product.body_html || "",
        vendor: product.vendor || "3D Products",
        product_type: product.product_type || "3D Model",
        price: product.variants?.[0]?.price || "",
        images: product.images || [],
        model: product.model || null,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "images") {
      setFormData({ ...formData, images: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("body_html", formData.body_html);
    fd.append("vendor", formData.vendor);
    fd.append("product_type", formData.product_type);
    fd.append("price", formData.price);

    // images
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((img) => {
        fd.append("images", img);
      });
    }

    // model
    if (formData.model) {
      fd.append("model", formData.model);
    }

    const response = await fetch(`/api/product/updateProduct/${product.id}`, {
      method: "PUT",
      body: fd, // 👈 no stringify
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Update failed");

    onUpdate(result.product);
    onClose();
  } catch (err) {
    console.error("Update error:", err);
    alert(err.message);
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <input
              type="text"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Type</label>
            <input
              type="text"
              name="product_type"
              value={formData.product_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="body_html"
              value={formData.body_html}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              rows="3"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <input
              type="file"
              name="images"
              multiple
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          {/* Model File */}
          <div>
            <label className="block text-sm font-medium mb-1">3D Model</label>
            <input
              type="file"
              name="model"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
