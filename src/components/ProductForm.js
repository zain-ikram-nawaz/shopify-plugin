// pages/dashboard/components/ProductForm.js
import { useState, useEffect } from "react";
import { FiUpload, FiX } from "react-icons/fi";

export default function ProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    body_html: "",
    vendor: "3D Products",
    product_type: "3D Model",
    price: "",
    images: [],
    model: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form for edit mode
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        body_html: product.body_html || "",
        vendor: product.vendor || "3D Products",
        product_type: product.product_type || "3D Model",
        price: product.variants?.[0]?.price || "",
        images: [],
        model: null
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleFileChange = (e) => {
    if (e.target.name === "images") {
      setFormData({...formData, images: Array.from(e.target.files)});
    } else {
      setFormData({...formData, [e.target.name]: e.target.files[0]});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     console.log("hola","formdata")
    console.log(formData,"formdata")
    setIsSubmitting(true);
    setError(null);

    try {
      const formPayload = new FormData();

      // Append basic fields
      formPayload.append('title', formData.title);
      formPayload.append('body_html', formData.body_html);
      formPayload.append('vendor', formData.vendor);
      formPayload.append('product_type', formData.product_type);
      formPayload.append('price', formData.price);

      // Append images
      formData.images.forEach(file => {
        formPayload.append('images', file);
      });

      // Append 3D model if exists
      if (formData.model) {
        formPayload.append('model', formData.model);
      }

      const response = await fetch('/api/product/addProduct', {
        method: 'POST',
        body: formPayload
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save product');
      }

      onSubmit(result.product);
      alert("submitted")
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-bold mb-4">
    {product ? "Edit Product" : "Add New Product"}
  </h2>

  {error && (
    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
      {error}
    </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-4">
    {/* Product Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Product Name *
      </label>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md"
        required
        disabled={isSubmitting}
      />
    </div>

    {/* Description */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Description
      </label>
      <textarea
        name="body_html"
        value={formData.body_html}
        onChange={handleChange}
        rows="3"
        className="w-full px-4 py-2 border rounded-md"
        disabled={isSubmitting}
      />
    </div>

    {/* Price */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Price *
      </label>
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        step="0.01"
        min="0"
        className="w-full px-4 py-2 border rounded-md"
        required
        disabled={isSubmitting}
      />
    </div>

    {/* Product Images */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Product Images *
      </label>
      <input
        type="file"
        name="images"
        onChange={handleFileChange}
        multiple
        accept="image/*"
        required={formData.images.length === 0}
        disabled={isSubmitting}
        className="w-full"
      />
      {formData.images.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          Selected: {formData.images.map(f => f.name).join(', ')}
        </div>
      )}
    </div>

    {/* 3D Model */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        3D Model File (GLB/GLTF)
      </label>
      <input
        type="file"
        name="model"
        onChange={handleFileChange}
        accept=".glb,.gltf"
        disabled={isSubmitting}
        className="w-full"
      />
      {formData.model && (
        <div className="mt-2 text-sm text-gray-500">{formData.model.name}</div>
      )}
    </div>

    {/* Buttons */}
    <div className="flex justify-end space-x-4 mt-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 border rounded-md hover:bg-gray-50"
        disabled={isSubmitting}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        disabled={isSubmitting}
      >
        {product ? "Update Product" : "Add Product"}
      </button>
    </div>
  </form>
</div>

  );
}