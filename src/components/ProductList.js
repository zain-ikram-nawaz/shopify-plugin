// pages/dashboard/components/ProductList.js
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import SearchBar from "./SearchBar";
import { useState } from "react";
import EditProductModal from "./EditProductModal";


export default function ProductList({ products, onSelect}) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete =async (updatedProduct) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`/api/product/deleteProduct/${updatedProduct}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Delete failed");

    alert("Product deleted successfully!");
  } catch (err) {
    alert(err.message);
  }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your 3D Products</h2>
        <SearchBar
        />
      </div>

      {products?.products?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No products found. Add your first 3D product to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.products?.map(product => (
            <div key={product?.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <img
                  src={product?.image?.src || "https://via.placeholder.com/80"}
                  alt={product?.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{product?.title}</h3>
                  <p className="text-sm text-gray-600">${product?.price}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {product?.vendor}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => onSelect(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Preview"
                >
                  <FiEye />
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(product)
                    setIsModalOpen(true)
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded"
                  title="Edit"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(product?.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {isModalOpen ? <EditProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> : ""}
    </div>
  );
}