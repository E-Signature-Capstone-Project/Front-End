import React, { useState } from "react";
import { FaUpload, FaCheckCircle, FaTimes } from "react-icons/fa";

export default function SignatureForm({ onConfirm, onChange }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validasi file type
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan (PNG/JPG)');
      return;
    }

    // Validasi file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    console.log('📎 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setUploadedFile(file);

    // Convert ke base64 untuk preview
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result;
      
      console.log('✅ File converted to base64:', {
        length: base64String.length,
        preview: base64String.substring(0, 50) + '...'
      });
      
      setPreviewImage(base64String);
      
      if (onChange) {
        onChange(base64String);
      }
    };

    reader.onerror = (error) => {
      console.error('❌ FileReader error:', error);
      alert('Gagal membaca file. Silakan coba lagi.');
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviewImage(null);
    if (onChange) {
      onChange(null);
    }
  };

  const handleConfirm = () => {
    if (!uploadedFile || !previewImage) {
      alert('Silakan upload tanda tangan terlebih dahulu');
      return;
    }

    // Validasi base64 sebelum kirim
    if (!previewImage.startsWith('data:image/')) {
      alert('Format gambar tidak valid');
      return;
    }

    if (previewImage.length < 100) {
      alert('Data gambar terlalu kecil. Silakan upload ulang.');
      return;
    }

    console.log('✅ Confirming signature:', {
      hasFile: !!uploadedFile,
      hasPreview: !!previewImage,
      previewLength: previewImage.length
    });

    // Kirim base64 string langsung
    if (onConfirm) {
      onConfirm(previewImage);
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area dengan Preview di Dalam */}
      <div className="mb-6">
        {!uploadedFile ? (
          // Upload Button
          <label
            htmlFor="signature-upload"
            className="block w-full border-2 border-dashed border-blue-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition bg-gray-50"
          >
            <FaUpload className="text-5xl text-blue-400 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-lg mb-2">
              Klik untuk upload tanda tangan
            </p>
            <p className="text-sm text-gray-500">
              Format: PNG, JPG (Max 2MB)
            </p>
          </label>
        ) : (
          // Preview Area (di dalam kotak yang sama)
          <div className="border-2 border-blue-400 rounded-lg p-6 bg-white relative">
            {/* Close Button */}
            <button
              onClick={handleRemoveFile}
              className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition shadow-md"
              title="Hapus dan upload ulang"
            >
              <FaTimes className="text-sm" />
            </button>

            {/* File Name */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <FaUpload className="text-xl" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            {/* Preview Image */}
            <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
              <img
                src={previewImage}
                alt="Preview Signature"
                className="max-h-48 max-w-full object-contain"
              />
            </div>

            <p className="text-center text-xs text-gray-500 mt-3">
              Preview tanda tangan Anda
            </p>
          </div>
        )}

        <input
          id="signature-upload"
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={!previewImage}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition shadow-lg text-lg"
      >
        <FaCheckCircle className="text-xl" />
        <span>Konfirmasi Tanda Tangan</span>
      </button>
    </div>
  );
}
