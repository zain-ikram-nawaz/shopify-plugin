import { useState, useEffect, useRef } from "react";
import { FiUpload, FiX, FiImage, FiBox } from "react-icons/fi";
import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls } from '@react-three/drei';
import { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three';
import { useThree } from "@react-three/fiber";

export default function ProductForm({ product, setProducts, onCancel }) {
  const groupRef = useRef();
  const [formData, setFormData] = useState({
    title: "",
    body_html: "",
    vendor: "3D Products",
    product_type: "3D Model",
    price: "",
    images: [],
    model: null,
    modelPreview: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const modelInputRef = useRef(null);

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
        model: null,
        modelPreview: product.model_url || null
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === "images") {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, images: files });
    } else {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData({
            ...formData,
            model: file,
            modelPreview: event.target.result
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const removeModel = () => {
    setFormData({ ...formData, model: null, modelPreview: null });
    if (modelInputRef.current) {
      modelInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const response = await fetch(product ? `/api/product/updateProduct/${product.id}` : '/api/product/addProduct', {
        method: product ? 'PUT' : 'POST',
        body: formPayload
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save product');
      }

      if (setProducts) {
        // Refresh product list if callback provided
        const productsResponse = await fetch('/api/product/getProducts');
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }

      if (!product) {
        // Reset form after successful creation
        setFormData({
          title: "",
          body_html: "",
          vendor: "3D Products",
          product_type: "3D Model",
          price: "",
          images: [],
          model: null,
          modelPreview: null
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (modelInputRef.current) modelInputRef.current.value = '';
      }

      alert(product ? "Product updated successfully!" : "Product created successfully!");
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
const ModelViewer = ({ url }) => {
  const { scene } = useGLTF(url);
  const controlsRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (scene && controlsRef.current) {
      // Model center calculate karo
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());

      // Camera target set karo
      controlsRef.current.target.copy(center);
      controlsRef.current.update();

      // Optional: camera ko thoda piche le jao
      camera.position.set(center.x, center.y, center.z + 3);
    }
  }, [scene, camera]);

  return (
    <>
      <primitive object={scene} />
      <OrbitControls ref={controlsRef} enableZoom enablePan={false} />
    </>
  );
};


  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {product ? "Edit Product" : "Add New Product"}
        </h2>
        <button
          onClick={onCancel}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <FiX className="mr-2" />
          Back to Products
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview Section */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">3D Model Preview</h3>
            {formData.modelPreview ? (
              <div className="h-64 w-full bg-gray-100 rounded-lg overflow-hidden">
                <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                  <pointLight position={[-10, -10, -10]} />
                  <Center>

                    <Suspense fallback={null}>
                      <ModelViewer url={formData.modelPreview} />

                    </Suspense>
                  </Center>
                </Canvas>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-gray-100 rounded-lg text-gray-400">
                <FiBox className="text-4xl mb-2" />
                <p>No 3D model selected</p>
              </div>
            )}
            <div className="mt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={() => modelInputRef.current?.click()}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center"
              >
                <FiUpload className="mr-2" />
                {formData.model ? "Change Model" : "Upload Model"}
              </button>
              {formData.model && (
                <button
                  type="button"
                  onClick={removeModel}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center"
                >
                  <FiX className="mr-1" />
                  Remove
                </button>
              )}
              <input
                ref={modelInputRef}
                type="file"
                name="model"
                onChange={handleFileChange}
                accept=".glb,.gltf"
                disabled={isSubmitting}
                className="hidden"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">Image Previews</h3>
            {formData.images.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex flex-col items-center justify-center bg-gray-100 rounded-lg text-gray-400">
                <FiImage className="text-3xl mb-2" />
                <p>No images selected</p>
              </div>
            )}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center"
              >
                <FiUpload className="mr-2" />
                {formData.images.length > 0 ? "Add More Images" : "Upload Images"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                name="images"
                onChange={handleFileChange}
                multiple
                accept="image/*"
                required={formData.images.length === 0}
                disabled={isSubmitting}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
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
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor *
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type *
              </label>
              <input
                type="text"
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {product ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  product ? "Update Product" : "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}