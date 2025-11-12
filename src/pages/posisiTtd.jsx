import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function PosisiTtd() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const savedFileUrl = localStorage.getItem("uploadedFileUrl");
    const savedFileName = localStorage.getItem("uploadedFileName");
    if (savedFileUrl) setFileUrl(savedFileUrl);
    if (savedFileName) setFileName(savedFileName);
  }, []);

  const handleTempel = () => {
    alert("Tanda tangan berhasil ditempel ✅");
  };

  return (
    <div className="min-h-screen bg-[#EEF3FA] flex flex-col items-center">
      {/* HEADER */}
      <header className="w-full bg-white border-b shadow-sm py-4 px-10 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-blue-700 flex items-center gap-2"
        >
          <FaArrowLeft size={18} />
          <span className="font-medium text-sm"></span>
        </button>

        <h1 className="ml-6 text-xl font-semibold text-gray-800">
          Posisi Tanda Tangan
        </h1>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-col items-center justify-center w-full flex-1 p-10">
        <div className="w-[65%] bg-white border shadow-md rounded-xl flex flex-col items-center p-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Preview Dokumen {fileName && `(${fileName})`}
          </p>

          <div className="w-full h-[80vh] border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
            {fileUrl ? (
              <>
                {fileName.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={fileUrl}
                    title="Preview PDF"
                    className="w-full h-full border-none"
                  ></iframe>
                ) : (
                  <img
                    src={fileUrl}
                    alt="Preview Dokumen"
                    className="w-full h-full object-contain"
                  />
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm">
                Belum ada dokumen yang diunggah.
              </p>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Tempatkan tanda tangan pada posisi yang sesuai
          </p>

          <button
            onClick={handleTempel}
            className="bg-blue-700 text-white mt-6 px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Tempel Tanda Tangan
          </button>
        </div>
      </main>
    </div>
  );
}
