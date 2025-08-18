// pages/dashboard/index.js
import { useEffect, useState } from "react";
import ProductList from "../components/ProductList"
import ProductForm from "../components/ProductForm";
import ProductPreview from "../components/ProductPreview";
import StatsCard from "../components/StatsCard";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState("list"); // 'list', 'add', 'edit', 'preview'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);

  // Handle product selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setViewMode("preview");
  };


  // Handle new product creati
useEffect(()=>{
const data = async()=>{
  const response = await fetch("/api/product/getAll");
const data = await response.json();
 if (data.success) {
  // console.log(data)
          setProducts(data); // ✅ ye turant state update karega
        }
}
data()
},[])
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Shopify 3D Product Manager</h1>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setViewMode("add");
            }}
            className="px-4 py-2 bg-white text-green-700 rounded-md hover:bg-green-50"
          >
            Add New Product
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Total Products"
            value={products?.length}
            icon="📦"
          />
          <StatsCard
            title="Views This Month"
            value="1,243"
            icon="👀"
          />
          <StatsCard
            title="Conversion Rate"
            value="3.2%"
            icon="📈"
          />
        </div>

        {/* Conditional Rendering based on view mode */}
        {viewMode === "list" && (
          <ProductList
            products={products}
            onSelect={handleSelectProduct}
            onEdit={(product) => {
              setSelectedProduct(product);
              setViewMode("edit");
            }}
          />
        )}

        {(viewMode === "add" || viewMode === "edit") && (
          <ProductForm
            product={viewMode === "edit" ? selectedProduct : null}
            onCancel={() => setViewMode("list")}
          />
        )}

        {viewMode === "preview" && selectedProduct && (
          <ProductPreview
            product={selectedProduct}
            onClose={() => setViewMode("list")}
          />
        )}
      </main>
    </div>
  );
}