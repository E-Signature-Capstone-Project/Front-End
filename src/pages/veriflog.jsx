import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function VerifLog() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);

  // ambil data dari localStorage
  useEffect(() => {
    const storedLogs = JSON.parse(localStorage.getItem("verifLogs")) || [];
    setLogs(storedLogs);
  }, []);

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

        <h1 className="ml-6 text-xl font-semibold text-gray-800">Verifikasi Log</h1>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-col items-center justify-start w-full flex-1 p-10">
        <div className="w-[70%] bg-white border shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Riwayat Dokumen yang Telah Ditandatangani
          </h2>

          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              Belum ada dokumen yang diverifikasi 
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50 text-gray-700 text-sm">
                  <th className="border-b py-3 px-4 text-left">No</th>
                  <th className="border-b py-3 px-4 text-left">Nama Dokumen</th>
                  <th className="border-b py-3 px-4 text-left">Tanggal</th>
                  <th className="border-b py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={index}
                    className="text-sm hover:bg-gray-50 transition border-b last:border-none"
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <FaFileAlt className="text-blue-600" /> {log.name}
                    </td>
                    <td className="py-3 px-4">{log.date}</td>
                    <td className="py-3 px-4 text-center">
                      {log.status === "Valid" ? (
                        <span className="flex items-center justify-center gap-1 text-green-600 font-medium">
                          <FaCheckCircle /> Valid
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-red-600 font-medium">
                          <FaTimesCircle /> Invalid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
