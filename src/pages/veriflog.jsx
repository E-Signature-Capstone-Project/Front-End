import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Pastikan path benar
import Header from "../components/Header";   // Pastikan path benar
import { FaFileDownload, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";

const API_BASE = "http://localhost:4000"; // Sesuaikan port backend kamu

export default function VerifLog() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // 1. Ambil ID dari URL (Scan QR) ATAU dari State (Klik Riwayat)
  const { docId: stateDocId } = location.state || {};
  const finalDocId = stateDocId || params.docId;

  const [doc, setDoc] = useState(null);
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPublicView, setIsPublicView] = useState(false);

  useEffect(() => {
    if (!finalDocId) {
      setErrorMsg("Tidak ada dokumen yang dipilih.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        let docUrl;
        let headers = { "Content-Type": "application/json" };

        // === LOGIKA PENENTU JALUR ===
        if (token) {
          // A. JIKA LOGIN: Pakai jalur Private
          setIsPublicView(false);
          docUrl = `${API_BASE}/documents/${finalDocId}`;
          headers.Authorization = `Bearer ${token}`;
        } else {
          // B. JIKA TIDAK LOGIN (Scan QR): Pakai jalur Public
          setIsPublicView(true);
          docUrl = `${API_BASE}/documents/public/verify/${finalDocId}`;
          // Tidak perlu header Authorization
        }

        // 1. Fetch Data Dokumen
        const resDoc = await fetch(docUrl, { headers });

        if (!resDoc.ok) {
          if (resDoc.status === 404) throw new Error("Dokumen tidak ditemukan.");
          if (resDoc.status === 401) throw new Error("Akses ditolak. Silakan login.");
          throw new Error("Gagal mengambil data dokumen.");
        }

        const docData = await resDoc.json();
        setDoc(docData);

        // 2. Fetch Logs (HANYA JIKA LOGIN)
        // Kalau public, kita skip fetch logs karena endpoint logs biasanya diproteksi
        if (token) {
          const resLog = await fetch(`${API_BASE}/logs`, { headers });
          if (resLog.ok) {
            const logsData = await resLog.json();
            // Filter log milik dokumen ini
            const filtered = Array.isArray(logsData)
              ? logsData.filter((entry) => entry.document_id === Number(finalDocId))
              : [];
            setLog(filtered.length > 0 ? filtered[0] : null);
          }
        }

      } catch (err) {
        console.error("Error Fetching:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [finalDocId]);

  // --- Helper untuk Warna Status ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><FaCheckCircle /> Terverifikasi Valid</span>;
      case "fake":
      case "rejected":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><FaTimesCircle /> Terindikasi Palsu</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit"><FaExclamationCircle /> Menunggu Verifikasi</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#EEF3FA]">
      {/* Sidebar hanya muncul jika bukan mode public/tamu (opsional) */}
      {!isPublicView && <Sidebar navigate={navigate} pathname={location.pathname} />}
      
      <div className={`flex-1 ${!isPublicView ? "md:ml-64" : ""} transition-all`}>
        <Header />
        
        <div className="pt-24 px-4 md:px-8 pb-10">
          
          {/* --- Loading State --- */}
          {loading && (
            <div className="flex flex-col items-center justify-center mt-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">Memverifikasi keaslian dokumen...</p>
            </div>
          )}

          {/* --- Error State --- */}
          {!loading && errorMsg && (
            <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center shadow-sm mt-10">
              <FaExclamationCircle className="text-4xl mx-auto mb-3 opacity-50"/>
              <h3 className="text-lg font-bold">Terjadi Kesalahan</h3>
              <p>{errorMsg}</p>
              <button onClick={() => navigate(-1)} className="mt-4 text-sm underline hover:text-red-900">
                Kembali
              </button>
            </div>
          )}

          {/* --- Success State (Data Ada) --- */}
          {!loading && doc && !errorMsg && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              
              {/* Header Card */}
              <div className="bg-blue-900 p-6 text-white">
                <h2 className="text-xl md:text-2xl font-bold">Hasil Verifikasi Dokumen</h2>
                <p className="text-blue-200 text-sm mt-1">ID Dokumen: #{doc.id}</p>
              </div>

              <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                
                {/* Kolom Kiri: Detail Teks */}
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Judul Dokumen</label>
                    <p className="text-xl font-semibold text-gray-800 mt-1">{doc.title || doc.name}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Validitas</label>
                    <div className="mt-2">
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>

                  {/* Tampilkan Detail Log jika ada (Hanya Mode Login) */}
                  {log && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-bold text-gray-700 mb-2 border-b pb-2">Detail Analisis AI</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Hasil:</span>
                          <span className="font-medium">{log.verification_result}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Skor Kemiripan:</span>
                          <span className="font-medium text-blue-600">{log.similarity_score}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Waktu Verifikasi:</span>
                          <span className="font-medium">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString("id-ID") : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tombol Download */}
                  {doc.status === "verified" && (
                    <a
                      href={`${API_BASE}/documents/${finalDocId}/download`} // Pastikan backend punya route ini
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg mt-6"
                      download // Atribut download
                    >
                      <FaFileDownload className="inline mb-1 mr-2"/> Unduh Asli
                    </a>
                  )}
                </div>

                {/* Kolom Kanan: Preview File */}
                <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center min-h-[300px]">
                  {doc.file_path ? (
                    doc.file_path.toLowerCase().endsWith(".pdf") ? (
                      <iframe
                        src={`${API_BASE}/${doc.file_path}`}
                        className="w-full h-[400px]"
                        title="Preview"
                      />
                    ) : (
                      <img
                        src={`${API_BASE}/${doc.file_path}`}
                        alt="Preview Dokumen"
                        className="w-full h-auto object-contain max-h-[400px]"
                      />
                    )
                  ) : (
                    <p className="text-gray-400 italic">Preview tidak tersedia</p>
                  )}
                </div>

              </div>
              
              {/* Footer Card */}
              <div className="bg-gray-50 px-6 py-4 border-t text-center text-xs text-gray-500">
                Sistem Verifikasi Dokumen Digital &copy; 2025
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}