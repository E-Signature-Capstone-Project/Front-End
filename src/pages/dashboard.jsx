import React from "react";
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
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const documents = [
    { id: 1, name: "Dokumen 1", date: "29 Okt 2025" },
    { id: 2, name: "Dokumen 2", date: "29 Okt 2025" },
    { id: 3, name: "Dokumen 3", date: "29 Okt 2025" },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFB] text-gray-800 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between py-8 fixed left-0 top-0 h-full">
        <div>
          <div className="px-6 mb-8">
            <h1 className="text-center text-2xl font-extrabold text-[#AD1F10]">
              Dashboard
            </h1>
          </div>

          <nav className="px-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#FFF1F1] text-[#AD1F10] font-medium">
              <FaTachometerAlt />
              <span>Dashboard</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition">
              <FaCheckCircle />
              <span>Verif Log</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition">
              <FaHistory />
              <span>Request</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition">
              <FaBell />
              <span>Notification</span>
            </button>
          </nav>
        </div>

        <div className="px-6 text-sm text-gray-400">
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 flex flex-col items-center justify-start py-10 px-6">
        {/* Header */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Hi, Ardian!</h2>
            <p className="text-sm text-gray-500">Rabu, 29 Oktober 2025</p>
          </div>

          <button
          onClick={() => navigate("/profil")}
          className="flex items-center justify-center bg-white shadow-md p-3 rounded-full hover:bg-gray-100 transition"
          >
            <FaUserCircle className="text-2xl text-gray-600" />
            </button>
        </div>

        {/* Dokumen Section */}
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="h-48 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FaRegFileAlt className="text-3xl mx-auto mb-2 text-gray-300" />
                <div>Belum ada dokumen terpilih</div>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 w-full bg-[#AD1F10] hover:bg-[#8b160f] transition text-white font-semibold py-3 rounded-full flex items-center justify-center gap-3"
            >
              <FaFolderOpen />
              <span>Pilih Dokumen</span>
            </button>

            <p className="text-sm text-gray-400 mt-3 text-center">
              Pilih dokumen yang ingin ditandatangani
            </p>
          </div>

          {/* Riwayat Dokumen */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">
              Riwayat Dokumen Terakhir
            </h3>

            <ul className="space-y-3">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#FFF6F6] flex items-center justify-center text-[#AD1F10]">
                      <FaFileAlt />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        Terakhir diperbarui: {doc.date}
                      </p>
                    </div>
                  </div>

                  <button
                    className="text-[#AD1F10] hover:text-[#8b160f] rounded-md p-2"
                    aria-label={`open-${doc.id}`}
                  >
                    <FaExternalLinkAlt />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
