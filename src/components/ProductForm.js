// pages/dashboard/components/ProductForm.js
import { useState, useEffect } from "react";
import { FiUpload, FiX } from "react-icons/fi";

export default function ProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    modelUrl: "",
    thumbnail: ""
  });

  // Set initial form data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        modelUrl: product.modelUrl || "",
        thumbnail: product.thumbnail || ""
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price)
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {product ? "Edit Product" : "Add New Product"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <FiX />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

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
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                3D Model File *
              </label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 px-4 py-2 border rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <FiUpload className="inline mr-2" />
                  {formData.modelUrl ? "Change File" : "Upload GLB/GLTF"}
                  <input
                    type="file"
                    accept=".glb,.gltf"
                    onChange={(e) => handleFileUpload(e, "modelUrl")}
                    className="hidden"
                    required={!formData.modelUrl}
                  />
                </label>
                {formData.modelUrl && (
                  <span className="text-sm text-green-600">✓ Uploaded</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail Image
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 px-4 py-2 border rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <FiUpload className="inline mr-2" />
                  {formData.thumbnail ? "Change Image" : "Upload Thumbnail"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "thumbnail")}
                    className="hidden"
                  />
                </label>
                {formData.thumbnail && (
                  <img
                    src={formData.thumbnail}
                    alt="Thumbnail preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
              </div>
            </div>

            {formData.modelUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center">
                <p className="text-gray-500">3D Model Preview Placeholder</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {product ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}