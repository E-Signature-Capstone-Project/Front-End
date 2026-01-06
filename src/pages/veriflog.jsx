import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; 
import Header from "../components/Header";    
import { 
  FaCheckCircle, FaTimesCircle, FaExclamationCircle, 
  FaUserTie, FaCalendarAlt, FaFileContract, FaEye, FaArrowLeft, FaSearch, FaShieldAlt, FaCopy, FaRegClipboard
} from "react-icons/fa";

export default function VerifLog() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // --- KONFIGURASI ---
  const API_BASE = `http://${window.location.hostname}:3001`; 
  const viewId = params.docId || params.id; 
  const isDetailMode = !!viewId;

  // --- STATE ---
  const [logList, setLogList] = useState([]); 
  const [docDetail, setDocDetail] = useState(null); 
  const [signatures, setSignatures] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copyStatus, setCopyStatus] = useState("Copy Text");

  // --- EFFECT ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (isDetailMode) {
      fetchDetailDocument(viewId);
    } else {
      if (token) {
        fetchLogList(token);
      } else {
        navigate("/login");
      }
    }
  }, [viewId, navigate]);

  // --- FETCHING ---
  const fetchLogList = async (token) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/documents`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        const signedDocs = data.filter(doc => doc.status === 'signed' || doc.status === 'completed');
        setLogList(signedDocs); 
      }
    } catch (err) {
      console.error("List Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailDocument = async (id) => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await fetch(`${API_BASE}/requests/public/${id}`);
      if (!response.ok) throw new Error("Dokumen tidak ditemukan atau URL tidak valid.");
      const result = await response.json();
      if (result.success) {
        setDocDetail(result.document);
        setSignatures(result.signatures || []);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER ---
  const filteredList = logList.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTanggal = (isoString) => {
    if(!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  };

  const handleCopy = () => {
    if (!docDetail) return;
    
    // Format teks clipboard
    const signerName = signatures.length > 0 ? signatures[0].signer?.name : docDetail.owner?.name;
    const date = signatures.length > 0 ? formatTanggal(signatures[0].updated_at) : "-";
    
    const textToCopy = `Reference ID: ${docDetail.id}\nTanggal: ${date}\nPenandatangan: ${signerName}\nDokumen: ${docDetail.title}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopyStatus("Tersalin!");
    setTimeout(() => setCopyStatus("Copy Text"), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {isLoggedIn && <Sidebar navigate={navigate} pathname={location.pathname} />}
      
      <div className={`flex-1 flex flex-col ${isLoggedIn ? "md:ml-64" : "w-full"} transition-all duration-300`}>
        
        {isLoggedIn ? <Header /> : (
            <div className="bg-white shadow-sm py-4 px-6 flex items-center justify-center border-b border-gray-100">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xl">
                    <FaShieldAlt /> <span>Verification Result</span>
                </div>
            </div>
        )}

        <div className={`flex-1 px-6 md:px-12 pb-10 ${isLoggedIn ? "pt-6" : "pt-10"}`}>

          {/* === MODE HISTORY (LIST TABLE) === */}
          {!isDetailMode && isLoggedIn && (
            <div className="max-w-6xl mx-auto animate-fade-in">
               <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Arsip Digital</h1>
                  <p className="text-gray-500 text-sm mt-1">Daftar dokumen yang telah ditandatangani.</p>
                </div>
                <div className="relative w-full md:w-72">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Cari dokumen..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                      <tr>
                        <th className="p-4 border-b">Dokumen</th>
                        <th className="p-4 border-b">Tanggal</th>
                        <th className="p-4 border-b text-center">Status</th>
                        <th className="p-4 border-b text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredList.length > 0 ? filteredList.map((doc) => (
                        <tr key={doc.document_id} className="hover:bg-gray-50 transition duration-150">
                          <td className="p-4 font-medium text-gray-800">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><FaFileContract size={16}/></div>
                              <span className="truncate max-w-xs block text-sm">{doc.title}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString("id-ID")}
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                              Signed
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => navigate(`/verif-log/${doc.document_id}`)}
                              className="text-gray-400 hover:text-blue-600 transition"
                              title="Lihat Detail"
                            >
                              <FaEye size={18} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-400 text-sm">Tidak ada data.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* === MODE DETAIL (WEB LAYOUT - WIDE) === */}
          {isDetailMode && (
            <div className="max-w-4xl mx-auto relative pt-4">
              
              {/* Tombol Back */}
              {isLoggedIn ? (
                  <button onClick={() => navigate('/verif-log')} className="mb-6 w-10 h-10 flex items-center justify-center bg-white text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full shadow-sm border border-gray-200 transition-all duration-200"><FaArrowLeft size={16}/></button>
              ) : (
                  <button onClick={() => navigate('/login')} className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition"><FaArrowLeft size={12}/> Login</button>
              )}

              {loading && <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>}

              {!loading && errorMsg && (
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center border-t-4 border-red-500 animate-fade-in-up">
                    <FaTimesCircle className="text-4xl text-red-500 mx-auto mb-3"/>
                    <h2 className="text-lg font-bold text-gray-800">Verifikasi Gagal</h2>
                    <p className="text-sm text-gray-500 mt-1">{errorMsg}</p>
                </div>
              )}

              {/* === CARD UTAMA (WIDE WEB STYLE) === */}
              {!loading && !errorMsg && docDetail && (
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up min-h-[500px]">
                  
                  {/* Bagian Atas: Icon & Judul (Centered) */}
                  <div className="pt-10 pb-6 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                      <div className="bg-slate-700 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-serif shadow-lg mb-4">
                          {signatures.length > 0 ? "E" : "!"}
                      </div>
                      <h2 className="text-3xl font-normal text-slate-700 tracking-wide">Result</h2>
                      <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-semibold">QR Code Details</p>
                  </div>

                  <hr className="border-gray-100 mx-8 mb-8"/>

                  {/* Bagian Tengah: Grid 2 Kolom (Web Layout) */}
                  <div className="px-10 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 text-gray-700 font-medium text-[15px] leading-relaxed">
                          
                          {/* KIRI */}
                          <div className="space-y-6">
                              <div>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Reference ID</p>
                                <p className="font-mono text-sm bg-gray-50 inline-block px-2 py-1 rounded border border-gray-200 text-gray-600">{docDetail.id}</p>
                              </div>

                              <div>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Penandatangan</p>
                                <div className="flex items-center gap-2">
                                    <FaUserTie className="text-gray-300"/>
                                    <p>{signatures.length > 0 ? signatures[0].signer?.name : docDetail.owner?.name}</p>
                                </div>
                              </div>

                              <div>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Keterangan</p>
                                <p className="flex items-center gap-2 text-green-700 bg-green-50 w-fit px-3 py-1 rounded-full text-xs font-bold">
                                    <FaCheckCircle/> Digital Document Verification
                                </p>
                              </div>
                          </div>

                          {/* KANAN */}
                          <div className="space-y-6">
                              <div>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Tanggal</p>
                                <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-gray-300"/>
                                    <p>{signatures.length > 0 ? formatTanggal(signatures[0].updated_at) : "Belum ditandatangani"}</p>
                                </div>
                              </div>

                              <div>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Dokumen</p>
                                <div className="flex items-start gap-2">
                                    <FaFileContract className="text-blue-500 mt-1 flex-shrink-0"/>
                                    <p className="text-blue-600 break-all leading-tight underline decoration-blue-200 underline-offset-4">
                                        {docDetail.title}
                                    </p>
                                </div>
                              </div>

                              <div>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status Sistem</p>
                                <p className="text-gray-500 text-sm">System Verified (Valid)</p>
                              </div>
                          </div>

                      </div>
                  </div>

                  {/* Bagian Bawah: Tombol Copy (Full Width tapi Padding lega) */}
                  <div className="p-10 mt-2">
                    <button 
                        onClick={handleCopy}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition duration-200 flex items-center justify-center gap-3 shadow-sm border border-slate-200"
                    >
                        {copyStatus === "Tersalin!" ? <FaCheckCircle className="text-green-600 text-lg"/> : <FaRegClipboard className="text-lg"/>}
                        {copyStatus}
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
