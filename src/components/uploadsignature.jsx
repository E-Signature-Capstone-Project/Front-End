import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const UploadSignature = ({ onClose, onSave }) => {
  const [file, setFile] = useState(null);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-lg shadow-lg p-6 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>

        {/* Title */}
        <h2 className="text-center text-lg font-semibold mb-4">
          Upload Signature
        </h2>

        {/* Signature Box */}
        <div className="w-full border border-gray-300 rounded-lg h-40 flex items-center justify-center bg-gray-50">
          {file ? (
            <p className="text-sm text-gray-700">{file.name}</p>
          ) : (
            <span className="text-gray-400 text-sm">No file chosen</span>
          )}
        </div>

        {/* Upload Button */}
        <div className="mt-4 flex justify-center">
          <label className="px-4 py-2 bg-gray-200 rounded-md cursor-pointer text-sm">
            Choose Signature
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        </div>

        {/* Save Button */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => onSave(file)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm"
          >
            SAVE
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadSignature;

