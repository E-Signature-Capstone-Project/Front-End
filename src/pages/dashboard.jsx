import React, { useState, useRef, useEffect } from "react";
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
  FaFilePdf,
  FaEdit,
  FaSignature,
  FaTimes,
  FaPaperPlane,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';

// ✅ Configure SweetAlert2
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    container: 'swal-container-high-z-index'
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
    const swalContainer = document.querySelector('.swal2-container');
    if (swalContainer) {
      swalContainer.style.zIndex = '999999';
    }
  }
});

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [userData, setUserData] = useState({ name: 'User', email: '' });
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // ✅ API Base URL
  const API_BASE_URL = 'http://localhost:3001';

  // ✅ Cek login dan ambil data user
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesi Berakhir',
        text: 'Silakan login terlebih dahulu',
        confirmButtonColor: '#003E9C',
        allowOutsideClick: false
      }).then(() => {
        navigate('/');
      });
      return;
    }

    const user = localStorage.getItem('user');
    console.log('📦 Raw user data from localStorage:', user);
    
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('✅ Parsed user data:', parsedUser);
        
        setUserData({
          name: parsedUser.name || parsedUser.username || parsedUser.email?.split('@')[0] || 'User',
          email: parsedUser.email || ''
        });
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        setUserData({
          name: user || 'User',
          email: ''
        });
      }
    } else {
      fetchUserProfile(token);
    }

    fetchDocuments();
    
    // Check jika ada dokumen yang baru di-TTD
    const lastSigned = localStorage.getItem('lastSignedDocument');
    if (lastSigned) {
      // Refresh documents untuk menampilkan yang baru
      fetchDocuments();
      // Hapus flag
      localStorage.removeItem('lastSignedDocument');
    }
  }, [navigate]);

  // ✅ Fetch user profile dari backend
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ User profile from backend:', data);
        
        const userInfo = data.user || data;
        
        setUserData({
          name: userInfo.name || userInfo.username || userInfo.email?.split('@')[0] || 'User',
          email: userInfo.email || ''
        });
        
        localStorage.setItem('user', JSON.stringify(userInfo));
      } else {
        console.error('❌ Failed to fetch profile:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
    }
  };

  // ✅ Fetch dokumen yang sudah diupload
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/documents/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Documents fetched:', data);
        
        if (data.documents && Array.isArray(data.documents)) {
          const formattedDocs = data.documents.map(doc => ({
            id: doc.document_id,
            name: doc.file_name,
            date: new Date(doc.upload_date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            fileUrl: `${API_BASE_URL}/${doc.file_path}`
          }));
          
          setDocuments(formattedDocs);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
    }
  };

  // ✅ Fungsi untuk handle session expired
  const handleSessionExpired = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    Swal.fire({
      icon: 'warning',
      title: 'Sesi Telah Berakhir',
      text: 'Sesi Anda telah habis. Silakan login kembali.',
      confirmButtonText: 'Login Kembali',
      confirmButtonColor: '#003E9C',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      navigate('/');
    });
  };

  // 📤 Upload Dokumen ke Backend
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      Swal.fire({
        icon: 'error',
        title: 'File Tidak Valid',
        text: 'Hanya file PDF yang diperbolehkan',
        confirmButtonColor: '#003E9C'
      });
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: 'Ukuran file maksimal 10MB',
        confirmButtonColor: '#003E9C'
      });
      e.target.value = '';
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        handleSessionExpired();
        return;
      }

      console.log('🔑 Using token:', token.substring(0, 20) + '...');

      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Uploading document:', file.name);

      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('📥 Server response:', data);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleSessionExpired();
          return;
        }
        
        throw new Error(data.error || data.message || 'Upload gagal');
      }

      console.log('✅ Document uploaded:', data);

      setSelectedFile(file);
      fetchDocuments();

      Toast.fire({
        icon: 'success',
        title: 'Upload Berhasil!',
        text: `File ${file.name} berhasil diupload`
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Upload Gagal',
        text: error.message || 'Gagal mengupload dokumen',
        confirmButtonColor: '#003E9C'
      });
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // ✅ FUNGSI HAPUS FILE
  const handleDeleteFile = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Hapus File?',
      text: 'Apakah Anda yakin ingin menghapus file ini?',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        Toast.fire({
          icon: 'success',
          title: 'File berhasil dihapus'
        });
      }
    });
  };

  // ✅ FUNGSI POPUP TANDA TANGAN
  const handleShowSignaturePopup = () => {
    Swal.fire({
      title: '<strong style="color: #1f2937; font-size: 24px;">Tanda Tangan</strong>',
      html: `
        <div id="signature-container" style="text-align: center; padding: 10px;">
          <canvas 
            id="signature-canvas" 
            width="600" 
            height="300" 
            style="
              border: 2px solid #e5e7eb; 
              border-radius: 12px; 
              cursor: crosshair; 
              background: #ffffff;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            "
          ></canvas>
        </div>
      `,
      width: '700px',
      showCancelButton: false,
      showConfirmButton: false,
      showCloseButton: true,
      padding: '30px',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)',
      customClass: {
        popup: 'signature-popup',
        closeButton: 'signature-close-btn'
      },
      didOpen: () => {
        const canvas = document.getElementById('signature-canvas');
        const ctx = canvas.getContext('2d');
        let drawing = false;

        // Setup canvas
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
          drawing = true;
          const rect = canvas.getBoundingClientRect();
          ctx.beginPath();
          ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        });

        canvas.addEventListener('mousemove', (e) => {
          if (!drawing) return;
          const rect = canvas.getBoundingClientRect();
          ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
          ctx.stroke();
        });

        canvas.addEventListener('mouseup', () => {
          drawing = false;
        });

        canvas.addEventListener('mouseleave', () => {
          drawing = false;
        });

        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
          e.preventDefault();
          drawing = true;
          const rect = canvas.getBoundingClientRect();
          const touch = e.touches[0];
          ctx.beginPath();
          ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
        });

        canvas.addEventListener('touchmove', (e) => {
          e.preventDefault();
          if (!drawing) return;
          const rect = canvas.getBoundingClientRect();
          const touch = e.touches[0];
          ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
          ctx.stroke();
        });

        canvas.addEventListener('touchend', () => {
          drawing = false;
        });

        // Button Container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 12px; justify-content: center; margin-top: 20px;';
        
        // Reset Button dengan Icon
        const resetBtn = document.createElement('button');
        resetBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
          Reset
        `;
        resetBtn.style.cssText = `
          background-color: #003E9C; 
          color: white;
          border: none;
          padding: 12px 24px; 
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex; 
          align-items: center; 
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,62,156,0.3);
        `;
        resetBtn.onmouseover = () => {
          resetBtn.style.backgroundColor = '#002A6B';
          resetBtn.style.transform = 'translateY(-1px)';
          resetBtn.style.boxShadow = '0 4px 8px rgba(0,62,156,0.4)';
        };
        resetBtn.onmouseout = () => {
          resetBtn.style.backgroundColor = '#003E9C';
          resetBtn.style.transform = 'translateY(0)';
          resetBtn.style.boxShadow = '0 2px 4px rgba(0,62,156,0.3)';
        };
        resetBtn.onclick = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        // Upload Button dengan Icon
        const uploadBtn = document.createElement('button');
        uploadBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload
        `;
        uploadBtn.style.cssText = `
          background-color: #003E9C; 
          color: white;
          border: none;
          padding: 12px 24px; 
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex; 
          align-items: center; 
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,62,156,0.3);
        `;
        uploadBtn.onmouseover = () => {
          uploadBtn.style.backgroundColor = '#002A6B';
          uploadBtn.style.transform = 'translateY(-1px)';
          uploadBtn.style.boxShadow = '0 4px 8px rgba(0,62,156,0.4)';
        };
        uploadBtn.onmouseout = () => {
          uploadBtn.style.backgroundColor = '#003E9C';
          uploadBtn.style.transform = 'translateY(0)';
          uploadBtn.style.boxShadow = '0 2px 4px rgba(0,62,156,0.3)';
        };
        uploadBtn.onclick = () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  
                  // Hitung proporsi untuk fit canvas
                  const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                  const x = (canvas.width - img.width * scale) / 2;
                  const y = (canvas.height - img.height * scale) / 2;
                  
                  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                };
                img.src = event.target.result;
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        };

        buttonContainer.appendChild(resetBtn);
        buttonContainer.appendChild(uploadBtn);

        // Lanjut Pilih Posisi Button
        const confirmBtn = document.createElement('button');
        confirmBtn.innerHTML = 'Lanjut Pilih Posisi';
        confirmBtn.style.cssText = `
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 14px 30px; 
          border-radius: 10px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          width: 100%; 
          margin-top: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        `;
        confirmBtn.onmouseover = () => {
          confirmBtn.style.transform = 'translateY(-2px)';
          confirmBtn.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
        };
        confirmBtn.onmouseout = () => {
          confirmBtn.style.transform = 'translateY(0)';
          confirmBtn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        };
        confirmBtn.onclick = () => {
          // Cek apakah canvas kosong
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          let isEmpty = true;
          
          for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] !== 0) {
              isEmpty = false;
              break;
            }
          }
          
          if (isEmpty) {
            Toast.fire({
              icon: 'warning',
              title: 'Tanda tangan kosong',
              text: 'Silakan gambar atau upload tanda tangan terlebih dahulu'
            });
            return;
          }
          
          const signatureData = canvas.toDataURL();
          
          // Simpan signature ke localStorage
          if (selectedFile) {
            const fileUrl = URL.createObjectURL(selectedFile);
            localStorage.setItem("uploadedFileUrl", fileUrl);
            localStorage.setItem("uploadedFileName", selectedFile.name);
            localStorage.setItem("signatureData", signatureData);
          }
          
          Swal.close();
          navigate("/posisi-ttd");
        };

        document.getElementById('signature-container').appendChild(buttonContainer);
        document.getElementById('signature-container').appendChild(confirmBtn);
      }
    });
  };

  // Logout handler
  const handleLogout = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Logout',
      text: 'Apakah Anda yakin ingin keluar?',
      showCancelButton: true,
      confirmButtonColor: '#003E9C',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 font-sans">
      <style>{`
        .swal2-container {
          z-index: 999999 !important;
        }
        .swal-container-high-z-index {
          z-index: 999999 !important;
        }
        #signature-canvas {
          touch-action: none;
        }
        .signature-popup {
          border-radius: 16px !important;
        }
        .signature-close-btn {
          color: #9ca3af !important;
          font-size: 28px !important;
        }
        .signature-close-btn:hover {
          color: #6b7280 !important;
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg border-r-4 border-blue-200 flex flex-col justify-between py-8 fixed left-0 top-0 h-full">
        <div>
          <div className="px-6 mb-8">
            <h1 className="text-center text-2xl font-extrabold text-[#003E9C]">
              E-Signature
            </h1>
            <p className="text-center text-xs text-gray-500 mt-1">
              Digital Signature System
            </p>
          </div>

          <nav className="px-4 space-y-2">
            <button
              onClick={() => navigate("/dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                location.pathname === "/dashboard"
                  ? "bg-[#003E9C] text-white shadow-md"
                  : "hover:bg-blue-50 text-[#003E9C]"
              }`}
            >
              <FaTachometerAlt />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => navigate("/verif-log")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                location.pathname === "/verif-log"
                  ? "bg-[#003E9C] text-white shadow-md"
                  : "hover:bg-blue-50 text-[#003E9C]"
              }`}
            >
              <FaCheckCircle />
              <span>Verif Log</span>
            </button>

            <button
              onClick={() => Toast.fire({
                icon: 'info',
                title: 'Coming Soon',
                text: 'Halaman Request sedang dalam pengembangan'
              })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition text-[#003E9C]"
            >
              <FaHistory />
              <span>Request</span>
            </button>
          </nav>
        </div>

        <div className="px-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 font-medium py-3 px-4 rounded-lg hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <div className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Hi, {userData.name}!</h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => Toast.fire({
                  icon: 'info',
                  title: 'Notifikasi',
                  text: 'Fitur notifikasi sedang dalam pengembangan'
                })}
                className="relative flex items-center justify-center bg-blue-50 shadow-md p-3 rounded-full hover:bg-blue-100 transition"
              >
                <FaBell className="text-2xl text-[#003E9C]" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/profil")}
                className="flex items-center justify-center bg-blue-50 shadow-md p-3 rounded-full hover:bg-blue-100 transition"
              >
                <FaUserCircle className="text-3xl text-[#003E9C]" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* ✅ UPLOAD SECTION BARU DENGAN 3 TOMBOL */}
          <div className="w-full bg-white">
            <div className="px-8 py-8">
              <div className="max-w-2xl mx-auto">
                <div className="min-h-44 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 flex items-center justify-center text-gray-400 p-6">
                  {selectedFile ? (
                    <div className="w-full">
                      {/* File Display dengan Tombol Hapus */}
                      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                            <FaFilePdf className="text-2xl" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-base">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Siap untuk ditandatangani • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteFile}
                          className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                          title="Hapus file"
                        >
                          <FaTimes className="text-xl" />
                        </button>
                      </div>

                      {/* 2 Tombol Aksi - Berjejer ke Kanan */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Tombol 1: Kirim Permintaan */}
                        <button
                          onClick={() => {
                            Toast.fire({
                              icon: 'info',
                              title: 'Coming Soon',
                              text: 'Fitur Kirim Permintaan sedang dalam pengembangan'
                            });
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-[#003E9C] hover:bg-[#002A6B] text-white font-semibold py-3 rounded-lg transition shadow-md"
                        >
                          <FaPaperPlane className="text-lg" />
                          <span>Kirim Permintaan</span>
                        </button>

                        {/* Tombol 2: Tandatangani */}
                        <button
                          onClick={handleShowSignaturePopup}
                          className="w-full flex items-center justify-center gap-2 bg-[#003E9C] hover:bg-[#002A6B] text-white font-semibold py-3 rounded-lg transition shadow-md"
                        >
                          <FaSignature className="text-lg" />
                          <span>Tandatangani</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FaRegFileAlt className="text-4xl mx-auto mb-2 text-gray-300" />
                      <div className="text-gray-500">Belum ada dokumen terpilih</div>
                      <div className="text-sm text-gray-400 mt-1">Upload file PDF untuk memulai</div>
                    </div>
                  )}
                </div>

                {/* Tombol Upload - Hanya tampil jika belum ada file */}
                {!selectedFile && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      disabled={loading}
                      className="mt-5 w-1/2 mx-auto bg-[#003E9C] hover:bg-[#002A6B] transition text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <FaFolderOpen className="text-xl" />
                      <span>{loading ? 'Mengupload...' : 'Pilih Dokumen PDF'}</span>
                    </button>

                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Hanya file PDF yang diperbolehkan (maksimal 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Riwayat Dokumen */}
          {documents.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-8 py-8">
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <FaHistory className="text-[#003E9C]" />
                  Riwayat Dokumen
                </h3>

                <ul className="space-y-3">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-blue-50 hover:border-blue-300 transition"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <FaFilePdf className="text-xl" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {doc.date}
                            </span>
                            {doc.isSigned && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                ✓ Ditandatangani
                              </span>
                            )}
                            {!doc.isSigned && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                                Belum ditandatangani
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#003E9C] hover:text-[#002A6B] rounded-md p-2 hover:bg-blue-100 transition"
                        title="Lihat dokumen"
                      >
                        <FaExternalLinkAlt className="text-lg" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Popup Modal - TETAP ADA (jika masih dipakai) */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-2xl w-96 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaFilePdf className="text-red-600 text-2xl" />
                <span className="font-bold text-gray-800">
                  {selectedFile?.name || "Dokumen.pdf"}
                </span>
              </div>
              <button 
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <button
              className="w-full flex items-center justify-center gap-3 bg-[#003E9C] text-white font-semibold py-3 rounded-lg mb-3 hover:bg-[#002A6B] transition shadow-md"
              onClick={() => {
                if (selectedFile) {
                  const fileUrl = URL.createObjectURL(selectedFile);
                  localStorage.setItem("uploadedFileUrl", fileUrl);
                  localStorage.setItem("uploadedFileName", selectedFile.name);
                }

                setShowPopup(false);
                navigate("/ttd");
              }}
            >
              <FaEdit />
              Tandatangani Dokumen
            </button>

            <button
              className="w-full flex items-center justify-center gap-3 border-2 border-[#003E9C] text-[#003E9C] font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
              onClick={() => {
                Toast.fire({
                  icon: 'info',
                  title: 'Request TTD',
                  text: 'Fitur Request TTD sedang dalam pengembangan'
                });
                setShowPopup(false);
              }}
            >
              <FaSignature />
              Request TTD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}