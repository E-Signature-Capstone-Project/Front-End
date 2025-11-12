import React, { useState, useRef } from "react";
import {
  FaTachometerAlt,
  FaCheckCircle,
  FaHistory,
  FaBell,
  FaFileAlt,
  FaExternalLinkAlt,
  FaFolderOpen,
  FaRegFileAlt,
  FaUserCircle,
  FaFilePdf,
  FaEdit,
  FaSignature,
  FaTimes,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // 📤 Upload Dokumen
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newDoc = {
      id: documents.length + 1,
      name: file.name,
      date: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      fileUrl: URL.createObjectURL(file),
    };

    setSelectedFile(file);
    setDocuments((prev) => [newDoc, ...prev]);
    setShowPopup(true); // tampilkan popup setelah upload
  };

  return (
    <div className="min-h-screen flex bg-[#F5FAFF] text-gray-800 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between py-8 fixed left-0 top-0 h-full">
        <div>
          <div className="px-6 mb-8">
            <h1 className="text-center text-2xl font-extrabold text-[#00000]">
              E-Signature
            </h1>
          </div>

          <nav className="px-4 space-y-2">
            {/* Dashboard */}
            <button
              onClick={() => navigate("/dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                location.pathname === "/dashboard"
                  ? "bg-[#E0ECFF] text-[#003E9C]"
                  : "hover:bg-blue-50 text-[#003E9C]"
              }`}
            >
              <FaTachometerAlt />
              <span>Dashboard</span>
            </button>

            {/* Verif Log */}
            <button
              onClick={() => navigate("/verif-log")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                location.pathname === "/verif-log"
                  ? "bg-[#E0ECFF] text-[#003E9C]"
                  : "hover:bg-blue-50 text-[#003E9C]"
              }`}
            >
              <FaCheckCircle />
              <span>Verif Log</span>
            </button>

            {/* Request */}
            <button
              onClick={() => alert("Halaman Request belum dibuat")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition text-[#003E9C]"
            >
              <FaHistory />
              <span>Request</span>
            </button>

            {/* Notification */}
            <button
              onClick={() => alert("Halaman Notification belum dibuat")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition text-[#003E9C]"
            >
              <FaBell />
              <span>Notification</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 flex flex-col items-center justify-start py-10 px-6">
        {/* Header */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Hi, Ardian!</h2>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Icon profil */}
          <button
            onClick={() => navigate("/profil")}
            className="flex items-center justify-center bg-white shadow-md p-3 rounded-full hover:bg-gray-100 transition"
          >
            <FaUserCircle className="text-2xl text-[#003E9C]" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="h-48 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
              {selectedFile ? (
                <div className="text-center">
                  <FaFileAlt className="text-4xl mx-auto mb-2 text-[#003E9C]" />
                  <p className="font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Siap untuk ditandatangani
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <FaRegFileAlt className="text-3xl mx-auto mb-2 text-gray-300" />
                  <div>Belum ada dokumen terpilih</div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mt-6 w-full bg-[#003E9C] hover:bg-[#002A6B] transition text-white font-semibold py-3 rounded-full flex items-center justify-center gap-3"
            >
              <FaFolderOpen />
              <span>Pilih Dokumen</span>
            </button>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            <p className="text-sm text-gray-400 mt-3 text-center">
              Pilih dokumen (.pdf, .docx, .jpg, .png) untuk ditandatangani
            </p>
          </div>

          {/* Riwayat Dokumen */}
          {documents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Riwayat Dokumen Terakhir
              </h3>

              <ul className="space-y-3">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-blue-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-[#E0ECFF] flex items-center justify-center text-[#003E9C]">
                        <FaFileAlt />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          Terakhir diperbarui: {doc.date}
                        </p>
                      </div>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003E9C] hover:text-[#002A6B] rounded-md p-2"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      {/* 📄 Popup Modal */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-2xl w-80 p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaFilePdf className="text-blue-600 text-xl" />
                <span className="font-semibold text-gray-800">
                  {selectedFile?.name || "Dokumen.pdf"}
                </span>
              </div>
              <button onClick={() => setShowPopup(false)}>
                <FaTimes className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            {/* Tombol Aksi */}
            <button
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2 rounded-lg mb-3 hover:bg-blue-700 transition"
              onClick={() => {
                if (selectedFile) {
                  const fileUrl = URL.createObjectURL(selectedFile);
                  localStorage.setItem("uploadedFileUrl", fileUrl);
                  localStorage.setItem("uploadedFileName", selectedFile.name);
                }

                setShowPopup(false);
                navigate("/ttd");
              }}
            >
              <FaEdit />
              Tandatangani Dokumen
            </button>

            <button
              className="w-full flex items-center justify-center gap-2 border border-blue-600 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-50 transition"
              onClick={() => {
                alert("Request TTD");
                setShowPopup(false);
              }}
            >
              <FaSignature />
              Request TTD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
