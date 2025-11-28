import React from "react";
import { FaTimes } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";

export default function CompletedPopup({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      {/* Card */}
      <div className="bg-white w-[380px] rounded-xl shadow-lg p-6 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <FaTimes size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <FaCheckCircle className="text-green-600" size={50} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center mb-1">Completed</h2>

        {/* Subtitle */}
        <p className="text-gray-600 text-center text-sm">
          The Request Has Been Completed and Sent
        </p>
      </div>
    </div>
  );
}
