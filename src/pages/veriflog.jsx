import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaFileDownload } from "react-icons/fa";

const API_BASE = "http://localhost:3001";

export default function VerifLog() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { docId: stateDocId } = location.state || {};
  const finalDocId = stateDocId || params.docId;

  const [doc, setDoc] = useState(null);
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!finalDocId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch dokumen
        const resDoc = await fetch(`${API_BASE}/documents/${finalDocId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (resDoc.ok) {
          const docData = await resDoc.json(); // BE kirim langsung object Document
          setDoc(docData || null);
        } else {
          console.warn("Gagal fetch dokumen:", resDoc.status);
          setDoc(null);
        }

        // Fetch semua log user, lalu filter untuk dokumen ini
        const resLog = await fetch(`${API_BASE}/logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (resLog.ok) {
          const logsData = await resLog.json(); // array LogVerification
          const filtered = Array.isArray(logsData)
            ? logsData.filter(
                (entry) => entry.document_id === Number(finalDocId)
              )
            : [];

          // ambil log terbaru untuk dokumen ini (kalau ada)
          setLog(filtered.length > 0 ? filtered[0] : null);
        } else {
          console.warn("Gagal fetch logs:", resLog.status);
          setLog(null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [finalDocId]);

  return (
    <div className="flex min-h-screen bg-[#EEF3FA]">
      <Sidebar navigate={navigate} pathname={location.pathname} />
      <div className="flex-1 md:ml-64">
        <Header />
        <div className="pt-24 px-4 md:px-8">
          {loading && (
            <p className="text-center text-lg mt-20">Memuat data...</p>
          )}

          {!loading && !finalDocId && (
            <p className="text-center text-red-600 text-lg">
              Tidak ada dokumen yang dipilih.
            </p>
          )}

          {!loading && finalDocId && !doc && (
            <p className="text-center text-red-600 text-lg">
              Dokumen tidak ditemukan.
            </p>
          )}

          {!loading && doc && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">Detail Dokumen</h2>
              <p>
                <b>Nama Dokumen:</b> {doc.title}
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
                  {doc.status}
                </span>
              </p>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Preview Dokumen</h3>
                <div className="w-full overflow-hidden rounded-lg border">
                  {doc.file_path?.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={`${API_BASE}/${doc.file_path}`}
                      className="w-full h-[350px] md:h-[450px]"
                      title="PDF Preview"
                    ></iframe>
                  ) : (
                    <img
                      src={`${API_BASE}/${doc.file_path}`}
                      alt="Dokumen"
                      className="w-full max-h-[450px] object-contain"
                    />
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold mb-2">Hasil Verifikasi</h3>
                {log ? (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p>
                      <b>Hasil:</b> {log.verification_result}
                    </p>
                    <p>
                      <b>Similarity Score:</b>{" "}
                      {log.similarity_score ?? "-"}
                    </p>
                    <p>
                      <b>Waktu:</b>{" "}
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Belum ada log verifikasi untuk dokumen ini.
                  </p>
                )}
              </div>

              {doc.status === "verified" ? (
                <a
                  href={`${API_BASE}/documents/${finalDocId}/download`}
                  className="mt-8 inline-flex items-center gap-2 bg-green-700 text-white px-5 py-3 rounded-lg hover:bg-green-800 transition"
                  download
                >
                  <FaFileDownload /> Unduh Dokumen
                </a>
              ) : (
                <p className="mt-8 text-red-600 italic">
                  *Dokumen masih menunggu verifikasi admin.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
