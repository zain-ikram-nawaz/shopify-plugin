// pages/dashboard/components/SearchBar.js
import { FiSearch } from "react-icons/fi";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-md">
      <FiSearch className="absolute left-3 top-3 text-gray-400" />
      <input
        type="text"
        placeholder="Search products..."
        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        value={value}
        // onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}