import React from "react";
import { useRouter } from "next/router";

export default function Instructions() {
  const router = useRouter();

  const goToDashboard = () => {
    router.push("/dashboard"); // yahan apne dashboard ka route dalen
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6 my-10">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        📖 Shopify 3D Model Setup
      </h1>

      <p className="mb-4">
        To show your 3D model in Shopify, please add the following code
        where you want the model to appear in your theme:
      </p>

      <pre className="bg-gray-900 text-green-200 p-4 rounded-lg mb-6 overflow-x-auto">
{`{% render 'model-viewer' %}`}
      </pre>

      <div className="mt-6 flex justify-center">
        <button
          onClick={goToDashboard}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
