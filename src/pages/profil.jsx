import React from "react";
import { FaArrowLeft, FaPlus, FaExchangeAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  // contoh data signature user
  const [signatures, setSignatures] = React.useState([
    { id: 1, src: "https://via.placeholder.com/150x100?text=Signature+1" },
    { id: 2, src: "https://via.placeholder.com/150x100?text=Signature+2" },
    { id: 3, src: "https://via.placeholder.com/150x100?text=Signature+3" },
  ]);

  // 🔙 Tombol kembali ke Dashboard
  const handleBack = () => {
    navigate("/"); // kembali ke dashboard
  };

  // 🚪 Tombol Logout
  const handleLogout = () => {
    if (window.confirm("Yakin ingin logout?")) {
      // di sini bisa tambahkan logika hapus token, session, dll
      navigate("/"); // balik ke dashboard (atau halaman login nanti)
    }
  };

  // 🔄 Tombol ganti signature
  const handleReplaceSignature = (id) => {
    const newUrl = prompt("Masukkan URL signature baru:");
    if (newUrl) {
      setSignatures((prev) =>
        prev.map((sig) =>
          sig.id === id ? { ...sig, src: newUrl } : sig
        )
      );
    }
  };

  // ➕ Tambah signature baru
  const handleAddSignature = () => {
    if (signatures.length >= 5) {
      alert("Kamu sudah mencapai batas maksimal 5 signature!");
      return;
    }
    const newUrl = prompt("Masukkan URL signature baru:");
    if (newUrl) {
      setSignatures((prev) => [
        ...prev,
        { id: prev.length + 1, src: newUrl },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center font-sans text-gray-800">
      {/* HEADER */}
      <div className="w-full bg-white shadow-sm py-4 px-6 flex items-center justify-between fixed top-0">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition"
        >
          <FaArrowLeft className="mr-2" />
          <span className="font-medium">Profile</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="mt-20 w-full max-w-md bg-transparent flex flex-col items-center px-6">
        {/* Profile Picture */}
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.67 0 8 1.34 8 4v4H4v-4c0-2.66 5.33-4 8-4z" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold">Ardian</h2>
        <p className="text-gray-500 text-sm mb-6">ardian@gmail.com</p>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-[#AD1F10] hover:bg-[#8b160f] transition text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 mb-8"
        >
          <FaExchangeAlt />
          <span>Log out</span>
        </button>

        {/* Signature Section */}
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-3">Signature Baseline</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {signatures.map((sig) => (
              <div
                key={sig.id}
                className="relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                <img
                  src={sig.src}
                  alt={`Signature ${sig.id}`}
                  className="w-full h-32 object-contain p-2"
                />
                <button
                  onClick={() => handleReplaceSignature(sig.id)}
                  className="absolute top-2 right-2 bg-white border border-gray-200 rounded-full p-2 shadow-sm hover:bg-gray-100 transition"
                  aria-label="replace-signature"
                >
                  <FaExchangeAlt className="text-gray-600 text-sm" />
                </button>
              </div>
            ))}

            {/* Add Signature */}
            <button
              onClick={handleAddSignature}
              className="bg-white border border-dashed border-gray-300 rounded-xl shadow-sm flex flex-col items-center justify-center h-32 hover:bg-gray-50 transition"
            >
              <FaPlus className="text-[#AD1F10] text-xl mb-1" />
              <span className="text-sm font-medium text-gray-600">
                Tambah Signature
              </span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mb-10">
            Maksimal 5 signature. Kamu bisa menambah dan mengganti.
          </p>
        </div>
      </div>
    </div>
  );
}
