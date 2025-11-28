import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import { FaCheckCircle, FaTimesCircle, FaFileAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifLog() {
  const [logs, setLogs] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedLogs = JSON.parse(localStorage.getItem("verifLogs")) || [];
    setLogs(storedLogs);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#EEF3FA]">
      {/* SIDEBAR */}
      <Sidebar pathname={location.pathname} navigate={navigate} />

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <div className="p-10">
          <div className="bg-white shadow-md rounded-xl p-6 w-full">
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
                        <FaFileAlt className="text-blue-600" />
                        {log.name}
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
        </div>
      </div>
    </div>
  );
}
