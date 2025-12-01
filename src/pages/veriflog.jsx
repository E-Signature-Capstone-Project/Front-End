// src/pages/VerifLog.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileDownload } from "react-icons/fa";

const API_BASE = "http://localhost:3001";

export default function VerifLog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { docId } = location.state || {};

  const [doc, setDoc] = useState(null);
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil dokumen + log verifikasi
  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("🔍 VerifLog untuk docId:", docId);

        // Ambil dokumen
        const resDoc = await fetch(`${API_BASE}/documents/${docId}`);
        if (!resDoc.ok) {
          console.error("❌ Gagal fetch dokumen, status:", resDoc.status);
          throw new Error("Gagal mengambil dokumen");
        }
        const dataDoc = await resDoc.json();
        console.log("📄 Response /documents/:id:", dataDoc);

        // Sesuaikan dengan struktur JSON backend:
        // coba beberapa kemungkinan umum: document, data, langsung object
        const docData =
          dataDoc.document ||
          dataDoc.data ||
          dataDoc.doc ||
          dataDoc; // fallback terakhir

        setDoc(docData || null);

        // Ambil log verifikasi (boleh tidak ada)
        const resLog = await fetch(`${API_BASE}/logs/${docId}`);
        if (resLog.ok) {
          const dataLog = await resLog.json();
          console.log("📜 Response /logs/:id:", dataLog);
          const logData = dataLog.log || dataLog.data || dataLog;
          setLog(logData || null);
        } else {
          console.log("ℹ️ Belum ada log verifikasi, status:", resLog.status);
          setLog(null);
        }
      } catch (err) {
        console.error("❌ Error VerifLog:", err);
        setDoc(null);
        setLog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [docId]);

  // Kalau tidak ada docId yang dikirim via navigate
  if (!docId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF3FA]">
        <div className="bg-white px-6 py-4 rounded-lg shadow">
          <p className="text-center text-gray-700">
            Tidak ada dokumen yang dipilih untuk diverifikasi.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-[#003E9C] text-white rounded hover:bg-[#002A6B]"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <p className="p-10 text-center">Memuat data...</p>;
  if (!doc) return <p className="p-10 text-center">Dokumen tidak ditemukan.</p>;

  const filePath = doc.file_path || doc.filePath || "";
  const isPdf = filePath.toLowerCase().endsWith(".pdf");

  return (
    <div className="min-h-screen bg-[#EEF3FA] p-8">
      {/* HEADER */}
      <div className="bg-white rounded-lg p-4 shadow flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 hover:text-blue-700 text-lg"
        >
          <FaArrowLeft />
        </button>

        <h1 className="text-xl font-semibold">Verifikasi Dokumen</h1>
      </div>

      {/* CONTENT */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Detail Dokumen</h2>

        {/* Info Dokumen */}
        <div className="mb-4">
          <p>
            <b>Nama Dokumen:</b> {doc.title || doc.name || "-"}
          </p>
          <p className="mt-1">
            <b>Status:</b>{" "}
            <span
              className={`px-3 py-1 rounded text-white text-sm ${
                doc.status === "verified"
                  ? "bg-green-600"
                  : doc.status === "waiting-verification"
                  ? "bg-yellow-600"
                  : "bg-gray-500"
              }`}
            >
              {doc.status || "unknown"}
            </span>
          </p>
        </div>

        {/* Preview Dokumen */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Preview Dokumen</h3>

          {filePath ? (
            isPdf ? (
              <iframe
                src={`${API_BASE}/${filePath}`}
                className="w-full h-[400px] border rounded-lg"
                title="PDF Preview"
              ></iframe>
            ) : (
              <img
                src={`${API_BASE}/${filePath}`}
                alt="Dokumen"
                className="w-full max-h-[400px] object-contain border rounded-lg bg-white"
              />
            )
          ) : (
            <p className="text-gray-500 text-sm">
              File dokumen tidak tersedia (file_path kosong).
            </p>
          )}
        </div>

        {/* HASIL VERIFIKASI */}
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Hasil Verifikasi</h3>

          {log ? (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p>
                <b>Hasil:</b> {log.verification_result || log.result || "-"}
              </p>
              <p>
                <b>Similarity Score:</b>{" "}
                {log.similarity_score ?? log.score ?? "-"}
              </p>
              <p>
                <b>Waktu:</b>{" "}
                {log.timestamp
                  ? new Date(log.timestamp).toLocaleString()
                  : "-"}
              </p>

              {log.signature_image && (
                <img
                  src={`${API_BASE}/${log.signature_image}`}
                  alt="TTD"
                  className="w-48 mt-3 border rounded-lg bg-white p-2"
                />
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Belum ada log verifikasi.</p>
          )}
        </div>

        {/* UNDUH DOKUMEN */}
        {doc.status === "verified" ? (
          <a
            href={`${API_BASE}/documents/${docId}/download`}
            className="mt-8 inline-flex items-center gap-2 bg-green-700 text-white px-5 py-3 rounded-lg hover:bg-green-800 transition"
          >
            <FaFileDownload /> Unduh Dokumen
          </a>
        ) : (
          <p className="mt-8 text-red-600 italic">
            *Dokumen masih menunggu verifikasi admin.
          </p>
        )}
      </div>
    </div>
  );
}
