import { useEffect, useState, Suspense, useRef } from "react";
import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls, useGLTF } from '@react-three/drei';
import { FiX, FiImage, FiBox, FiRotateCw } from "react-icons/fi";
import * as THREE from 'three';
import Image from "next/image";
import { useThree } from "@react-three/fiber";


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
export default function ProductPreview({ product, onClose }) {
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('model'); // 'model' or 'image'
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  // console.log(product.images,"product")
  useEffect(() => {
    async function fetchMetafields() {
      try {
        setLoading(true);
        const res = await fetch(`/api/product/${product.id}`);
        const data = await res.json();
        if (data?.metafields?.[0]?.value) {
          setModelUrl(data.metafields[0].value);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (product?.id) {
      fetchMetafields();
    }
  }, [product?.id]);

  const handleModelLoad = () => {
    setIsModelLoaded(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">3D Preview: {product.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-gray-500 text-xl" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('model')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${viewMode === 'model' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                disabled={!modelUrl || loading}
              >
                <FiBox />
                <span>3D Model</span>
              </button>
              <button
                onClick={() => setViewMode('image')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${viewMode === 'image' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                <FiImage />
                <span>Images</span>
              </button>
            </div>
            {viewMode === 'model' && modelUrl && (
              <div className="flex items-center text-sm text-gray-500">
                <FiRotateCw className="mr-2" />
                <span>Drag to rotate | Scroll to zoom</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="border-2 border-gray-200 rounded-xl h-[500px] bg-gray-50 overflow-hidden relative">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : viewMode === 'model' ? (
                  modelUrl ? (
                    <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                      <ambientLight intensity={0.5} />
                      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                      <pointLight position={[-10, -10, -10]} />
                      <Center>

                        <Suspense fallback={null}>
                          <ModelViewer url={modelUrl} onLoad={handleModelLoad} />

                        </Suspense>
                      </Center>
                    </Canvas>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <FiBox className="text-4xl mb-2" />
                      <p>No 3D model available</p>
                    </div>
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {product.image ? (
                      <Image
                        width={500}
                        height={500}
                        src={product.image.src}
                        alt={product.title}
                        className="max-w-full max-h-full object-contain p-4"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FiImage className="text-4xl mb-2" />
                        <p>No image available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">Product Details</h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="text-gray-800">{product.title}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600">Price:</span>
                    <span className="text-gray-800">${product.price}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600">3D Model:</span>
                    <span className={`${modelUrl ? 'text-green-600' : 'text-gray-500'}`}>
                      {modelUrl ? "Available" : "Not available"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">Description</h3>
                <p className="text-gray-700">
                  {product.description || "No description provided"}
                </p>
              </div>

              {product.images?.length > 0 && (
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Gallery</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.map((img, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                        onClick={() => {
                          setViewMode('image');
                        }}
                      >
                        <Image
                          src={img.src}
                          alt={`${product.title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                          width={200}
                          height={200}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}