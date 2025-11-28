import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaExclamationTriangle, FaFilePdf } from "react-icons/fa";

const SignatureRequest = () => {
  const location = useLocation();

  // simpan state dari location ke state lokal
  const [data, setData] = useState(null);

  useEffect(() => {
    if (location.state) {
      setData(location.state);
    }
  }, [location.state]);

  if (!data) return <p>Data tidak ditemukan.</p>;

  return (
    <div className="w-full max-w-2xl bg-white border rounded-lg shadow p-6 mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <FaExclamationTriangle className="text-yellow-500 text-xl" />
        <h2 className="text-lg font-semibold">
          Permintaan penandatanganan dokumen untuk {data.title}
        </h2>
      </div>

      <div className="ml-8 mb-3">
        <p className="font-medium">{data.sender}</p>
        <p className="text-gray-500 text-sm">{data.email}</p>
      </div>

      <div className="ml-8 mb-4">
        <p className="font-semibold mb-1">Note:</p>
        <p className="text-gray-700">{data.excerpt}</p>
      </div>

      <div className="ml-8 p-4 border rounded-lg bg-gray-50 flex items-center gap-3">
        <FaFilePdf className="text-red-500 text-2xl" />
        <span className="font-medium">{data.fileName || "document.pdf"}</span>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button className="px-4 py-2 bg-gray-300 rounded-md">Reject</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Sign the Document
        </button>
      </div>
    </div>
  );
};

export default SignatureRequest;
