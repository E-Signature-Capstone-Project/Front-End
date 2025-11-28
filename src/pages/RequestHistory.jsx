import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/header";
import Swal from 'sweetalert2';
import { FaEye, FaFileAlt } from "react-icons/fa";

const API_BASE_URL = "http://localhost:3001";

export default function RequestHistory() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }
    fetchRequests();
  }, [navigate]);

  async function fetchRequests() {
    const token = localStorage.getItem("token");
    console.log('🔍 Fetching outgoing requests...');
    
    try {
      const res = await fetch(`${API_BASE_URL}/requests/outgoing`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('📡 Response status:', res.status);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('📥 Outgoing requests data:', data);

      if (data.success) {
        setRequests(data.data || []);
      } else if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Tampilkan detail lengkap (pesan + email penerima)
  const handleViewDetail = (request) => {
    const recipientName = request.signer?.name || 'Penerima';
    const recipientEmail = request.recipient_email;
    const note = request.note || '<em class="text-gray-400">Tidak ada catatan</em>';
    const status = getStatusText(request.status);
    const statusColor = request.status === 'approved' ? 'text-green-600' : 
                       request.status === 'pending' ? 'text-yellow-600' : 
                       'text-red-600';

    Swal.fire({
      title: '<strong>Detail Permintaan</strong>',
      html: `
        <div class="text-left space-y-3">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Dokumen</p>
            <p class="font-semibold text-gray-800">${request.Document?.title || '-'}</p>
          </div>

          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p class="text-xs text-blue-600 mb-1">Pengirim</p>
            <p class="font-semibold text-blue-900">${recipientName}</p>
            <p class="text-sm text-blue-700 mt-1">📧 ${recipientEmail}</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-xs text-gray-500 mb-2">Pesan/Catatan</p>
            <div class="bg-white p-3 rounded border">
              <p class="text-gray-800 text-sm">${note}</p>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Status</p>
            <p class="font-semibold ${statusColor}">${status}</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Waktu Dikirim</p>
            <p class="text-sm text-gray-700">${new Date(request.created_at).toLocaleString('id-ID')}</p>
          </div>
        </div>
      `,
      width: 500,
      confirmButtonColor: '#003E9C',
      confirmButtonText: 'Tutup',
      showCloseButton: true
    });
  };

  function getStatusColor(status) {
    if (!status) return "bg-gray-300 text-gray-800";
    const val = status.toLowerCase();
    if (val === "approved" || val === "selesai") return "bg-green-500 text-white";
    if (val === "pending" || val === "please review") return "bg-yellow-400 text-gray-800";
    if (val === "rejected") return "bg-red-400 text-white";
    return "bg-gray-300 text-gray-800";
  }

  function getStatusText(status) {
    if (!status) return "-";
    const val = status.toLowerCase();
    if (val === "approved") return "Disetujui";
    if (val === "pending") return "Menunggu";
    if (val === "rejected") return "Ditolak";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  return (
    <div className="min-h-screen flex bg-[#f5faff]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen ml-64">
        <Header />
        <div className="px-6 py-2 flex justify-center">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-10 flex flex-col items-center">
            <h2 className="text-center text-2xl font-extrabold mb-12 mt-2">
              Riwayat Permintaan
            </h2>
            
            {loading ? (
              <p className="text-gray-500 py-8">Memuat data...</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table
                  className="w-full border rounded-lg text-base"
                  style={{ borderCollapse: "collapse", minWidth: 750 }}
                >
                  <thead>
                    <tr className="bg-gray-100 text-center">
                      <th className="border px-5 py-4 font-semibold">Pengirim</th>
                      <th className="border px-5 py-4 font-semibold">Dokumen</th>
                      <th className="border px-5 py-4 font-semibold">Status</th>
                      <th className="border px-5 py-4 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-gray-400 text-center text-lg">
                          Tidak ada data request
                        </td>
                      </tr>
                    ) : (
                      requests.map((r, idx) => (
                        <tr key={r.request_id || idx} className="text-center hover:bg-gray-50">
                          {/* PENgirim */}
                          <td className="border px-5 py-3">
                            <div className="text-sm">
                              <p className="font-semibold text-gray-800">
                                {r.signer?.name || r.recipient_email}
                              </p>
                              {r.signer?.name && (
                                <p className="text-xs text-gray-500">{r.recipient_email}</p>
                              )}
                            </div>
                          </td>

                          {/* DOKUMEN - KLIK UNTUK LIHAT */}
                          <td className="border px-5 py-3">
                            {r.Document?.file_path ? (
                              <a
                                href={`${API_BASE_URL}/${r.Document.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:underline font-medium inline-flex items-center gap-2"
                                title="Klik untuk lihat dokumen"
                              >
                                <FaFileAlt />
                                {r.Document?.title || "Dokumen"}
                              </a>
                            ) : (
                              <span className="text-gray-500">{r.Document?.title || "-"}</span>
                            )}
                          </td>

                          {/* STATUS */}
                          <td className="border px-5 py-3">
                            <span className={`px-3 py-1 rounded-full font-semibold text-xs ${getStatusColor(r.status)}`}>
                              {getStatusText(r.status)}
                            </span>
                          </td>

                          {/* AKSI - HANYA LIHAT DETAIL */}
                          <td className="border px-5 py-3">
                            <button
                              onClick={() => handleViewDetail(r)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-2 hover:underline"
                            >
                              <FaEye />
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
