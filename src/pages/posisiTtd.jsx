import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function PosisiTtd() {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [signatureData, setSignatureData] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const savedFileUrl = localStorage.getItem("uploadedFileUrl");
    const savedFileName = localStorage.getItem("uploadedFileName");
    const savedSignature = localStorage.getItem("signatureData");
    
    if (savedFileUrl) setFileUrl(savedFileUrl);
    if (savedFileName) setFileName(savedFileName);
    if (savedSignature) setSignatureData(savedSignature);
  }, []);

  // Handle klik pada PDF untuk memilih area
  const handleClickArea = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Set area yang dipilih dengan ukuran default TTD
    setSelectedArea({
      x: x - 75, // Center the signature
      y: y - 37.5,
      width: 150,
      height: 75
    });
  };

  // Handle tempel tanda tangan
  const handleTempelTandaTangan = async () => {
    if (!selectedArea) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Area Terlebih Dahulu',
        text: 'Silakan klik pada dokumen untuk memilih area tanda tangan',
        confirmButtonColor: '#003E9C'
      });
      return;
    }

    // Loading
    Swal.fire({
      title: 'Memproses...',
      text: 'Sedang menandatangani dokumen',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const token = localStorage.getItem('token');
      
      // Simulasi proses tanda tangan (bisa diganti dengan API call ke backend)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simpan data posisi TTD
      const ttdData = {
        fileName: fileName,
        fileUrl: fileUrl,
        signatureData: signatureData,
        position: selectedArea,
        timestamp: new Date().toISOString(),
        isSigned: true
      };

      // PENTING: Kirim ke backend untuk update status dokumen
      // Contoh API call (sesuaikan dengan backend Anda):
      /*
      const response = await fetch(`${API_BASE_URL}/documents/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: fileName,
          signaturePosition: selectedArea,
          signatureData: signatureData
        })
      });
      */

      // Set flag untuk refresh dashboard
      localStorage.setItem('lastSignedDocument', JSON.stringify(ttdData));

      // Bersihkan data temporary
      localStorage.removeItem('uploadedFileUrl');
      localStorage.removeItem('uploadedFileName');
      localStorage.removeItem('signatureData');

      // Success message
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Dokumen berhasil ditandatangani',
        confirmButtonColor: '#003E9C',
        timer: 2000,
        showConfirmButton: false
      });

      // Kembali ke dashboard
      navigate('/dashboard');

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat menandatangani dokumen',
        confirmButtonColor: '#003E9C'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3FA] flex flex-col">
      {/* HEADER */}
      <header className="w-full bg-white border-b shadow-sm py-4 px-10 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-blue-700 flex items-center gap-2"
        >
          <FaArrowLeft size={18} />
        </button>

        <h1 className="ml-6 text-xl font-semibold text-gray-800">
          Pilih Posisi TTD
        </h1>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center p-6 relative">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
          <div 
            ref={containerRef}
            onClick={handleClickArea}
            className="relative w-full h-[80vh] overflow-auto flex items-start justify-center bg-gray-100 cursor-crosshair"
            style={{ position: 'relative' }}
          >
            {fileUrl ? (
              <div className="relative w-full min-h-full">
                {fileName.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={fileUrl}
                    title="Preview PDF"
                    className="w-full h-full min-h-[80vh] border-none pointer-events-none"
                  ></iframe>
                ) : (
                  <img
                    src={fileUrl}
                    alt="Preview Dokumen"
                    className="w-full h-auto object-contain pointer-events-none"
                  />
                )}

                {/* Area yang dipilih */}
                {selectedArea && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${selectedArea.x}px`,
                      top: `${selectedArea.y}px`,
                      width: `${selectedArea.width}px`,
                      height: `${selectedArea.height}px`,
                      zIndex: 10,
                      pointerEvents: 'none'
                    }}
                    className="border-3 border-blue-500 rounded-lg shadow-xl bg-white"
                  >
                    {/* Preview tanda tangan di area yang dipilih */}
                    {signatureData && (
                      <img 
                        src={signatureData} 
                        alt="Signature Preview" 
                        className="w-full h-full object-contain p-1"
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">
                  Belum ada dokumen yang diunggah.
                </p>
              </div>
            )}
          </div>

          {/* Info Text */}
          <div className="bg-blue-50 border-t-2 border-blue-200 px-6 py-3">
            <p className="text-sm text-blue-700 text-center">
              {!selectedArea 
                ? "👆 Klik pada dokumen untuk memilih posisi tanda tangan"
                : "✅ Area telah dipilih, klik tombol di bawah untuk menandatangani"}
            </p>
          </div>
        </div>

        {/* Floating Button - Muncul setelah pilih area */}
        {selectedArea && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <button
              onClick={handleTempelTandaTangan}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              style={{
                boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5)'
              }}
            >
              <FaCheck className="text-xl" />
              <span>Tempel Tanda Tangan</span>
            </button>
          </div>
        )}
      </main>

      {/* CSS untuk animasi */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}