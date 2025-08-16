// pages/dashboard/components/ProductList.js
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import SearchBar from "./SearchBar";
import { useState } from "react";


export default function ProductList({ products, onSelect, onDelete, onEdit }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your 3D Products</h2>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No products found. Add your first 3D product to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <img
                  src={product.thumbnail || "https://via.placeholder.com/80"}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">${product.price}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {product.description}
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
                  onClick={() => onEdit(product)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded"
                  title="Edit"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => onDelete(product.id)}
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
    </div>
  );
}