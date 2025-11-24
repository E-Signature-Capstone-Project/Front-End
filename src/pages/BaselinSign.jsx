import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPencilAlt, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';

// ✅ Configure SweetAlert2 dengan z-index tinggi
const Toast = Swal.mixin({
  customClass: {
    container: 'swal-container-high-z-index'
  },
  didOpen: () => {
    const swalContainer = document.querySelector('.swal2-container');
    if (swalContainer) {
      swalContainer.style.zIndex = '999999';
    }
  }
});

export default function BaselineSign() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showDrawBox, setShowDrawBox] = useState(false);
  const [currentSignature, setCurrentSignature] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const maxSignatures = 5;

  // ✅ API Base URL - sesuaikan dengan backend Anda
  const API_BASE_URL = 'http://localhost:3001';

  // Cek apakah user sudah login dan ambil existing signatures
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Fetch existing signatures dari backend
    fetchUserSignatures();
  }, [navigate]);

  // Fetch signatures yang sudah disimpan
  const fetchUserSignatures = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // ✅ FIX: Gunakan endpoint yang sesuai dengan routes backend
      const response = await fetch(`${API_BASE_URL}/signature_baseline/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Jika 404 atau error lain, anggap belum ada baseline
        if (response.status === 404) {
          console.log('ℹ️ Belum ada baseline');
          setSignatures([]);
          setCurrentStep(1);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Fetched signatures:', data);

      // ✅ Response backend: { count, baselines: [...] }
      if (data.baselines && Array.isArray(data.baselines)) {
        const formattedSignatures = data.baselines.map((sig, index) => ({
          step: index + 1,
          // ✅ Backend menyimpan path relatif, tambahkan base URL
          image: `${API_BASE_URL}/${sig.sign_image}`,
          baseline_id: sig.baseline_id
        }));

        setSignatures(formattedSignatures);
        setCurrentStep(formattedSignatures.length + 1);
        
        console.log(`✅ ${formattedSignatures.length} signatures loaded`);
      } else {
        setSignatures([]);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('❌ Error fetching signatures:', error);
      // Jangan tampilkan error jika memang belum ada data
      setSignatures([]);
      setCurrentStep(1);
    }
  };

  // Setup canvas
  useEffect(() => {
    if (showDrawBox && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  }, [showDrawBox]);

  // Mouse events for drawing
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch events for mobile
  const startDrawingTouch = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const touch = e.touches[0];
    
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    setIsDrawing(true);
  };

  const drawTouch = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const touch = e.touches[0];
    
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    setCurrentSignature(imageData);
    setShowDrawBox(false);
  };

  const handleUploadSignature = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ✅ Validasi tipe file
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar (PNG, JPG, dll)');
        Toast.fire({
          icon: 'error',
          title: 'Tipe File Tidak Valid',
          text: 'Harap upload file gambar (PNG, JPG, dll)',
          confirmButtonColor: '#003E9C'
        });
        return;
      }

      // ✅ Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        Toast.fire({
          icon: 'error',
          title: 'File Terlalu Besar',
          text: 'Ukuran file maksimal 5MB',
          confirmButtonColor: '#003E9C'
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentSignature(reader.result);
        setError('');
      };
      reader.onerror = () => {
        setError('Gagal membaca file');
        Toast.fire({
          icon: 'error',
          title: 'Gagal Membaca File',
          text: 'Gagal membaca file. Silakan coba lagi.',
          confirmButtonColor: '#003E9C'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert base64 to file
  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Simpan signature ke backend
  const handleSave = async () => {
    if (!currentSignature) {
      setError('Tidak ada signature untuk disimpan');
      Toast.fire({
        icon: 'warning',
        title: 'Tidak Ada Signature',
        text: 'Silakan gambar atau upload signature terlebih dahulu',
        confirmButtonColor: '#003E9C'
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }
      
      // Convert base64 to file
      const file = base64ToFile(
        currentSignature, 
        `signature_${currentStep}_${Date.now()}.png`
      );
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', file); // ✅ field name harus 'image' sesuai backend

      console.log('📤 Uploading signature step:', currentStep);
      console.log('📤 File size:', file.size, 'bytes');

      // ✅ FIX: Gunakan endpoint yang benar sesuai routes
      const response = await fetch(`${API_BASE_URL}/signature_baseline/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // ❗ JANGAN set Content-Type untuk FormData
        },
        body: formData
      });

      // ✅ Parse response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Response tidak valid dari server');
      }

      // ✅ Cek response status
      if (!response.ok) {
        throw new Error(data.error || data.detail || `Server error: ${response.status}`);
      }

      console.log('✅ Signature saved:', data);

      // ✅ Update state dengan signature baru
      const newSignature = {
        step: currentStep,
        image: currentSignature,
        baseline_id: data.baseline.baseline_id
      };

      const updatedSignatures = [...signatures, newSignature];
      setSignatures(updatedSignatures);

      // Reset untuk signature berikutnya
      setCurrentSignature(null);
      setCurrentStep(currentStep + 1);

      // ✅ Tampilkan pesan sukses dengan SweetAlert
      if (currentStep === 1) {
        Toast.fire({
          icon: 'success',
          title: 'Baseline Tersimpan!',
          text: 'Baseline pertama berhasil disimpan! Silakan tambahkan 4 signature lagi.',
          confirmButtonColor: '#003E9C',
          timer: 2500,
          timerProgressBar: true
        });
      } else if (currentStep >= maxSignatures) {
        Toast.fire({
          icon: 'success',
          title: 'Selesai!',
          text: '5 Baseline signature berhasil disimpan! Mengarahkan ke Dashboard...',
          confirmButtonColor: '#003E9C',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          navigate('/dashboard');
        });
      } else {
        Toast.fire({
          icon: 'success',
          title: `Signature ${currentStep} Tersimpan!`,
          text: `${maxSignatures - currentStep} signature lagi`,
          confirmButtonColor: '#003E9C',
          timer: 2000,
          timerProgressBar: true
        });
      }

    } catch (error) {
      console.error('❌ Save error:', error);
      
      // ✅ Error handling yang lebih spesifik dengan SweetAlert
      const errorMessage = error.message || 'Gagal menyimpan signature';
      
      if (errorMessage.includes('tidak cocok') || errorMessage.includes('match')) {
        setError('❌ Tanda tangan tidak cocok dengan baseline yang ada. Silakan coba lagi dengan tanda tangan yang sama.');
        Toast.fire({
          icon: 'error',
          title: 'Tanda Tangan Tidak Cocok',
          text: 'Tanda tangan Anda tidak cocok dengan baseline yang ada. Silakan coba lagi dengan tanda tangan yang sama.',
          confirmButtonColor: '#003E9C'
        });
      } else if (errorMessage.includes('Maksimal') || errorMessage.includes('maksimal')) {
        setError('❌ Anda sudah mencapai maksimal 5 baseline signature.');
        Toast.fire({
          icon: 'warning',
          title: 'Maksimal Tercapai',
          text: 'Anda sudah mencapai maksimal 5 baseline signature.',
          confirmButtonColor: '#003E9C'
        });
      } else if (errorMessage.includes('Token') || errorMessage.includes('Authorization')) {
        setError('❌ Sesi Anda telah berakhir. Silakan login kembali.');
        Toast.fire({
          icon: 'error',
          title: 'Sesi Berakhir',
          text: 'Sesi Anda telah berakhir. Silakan login kembali.',
          confirmButtonColor: '#003E9C'
        }).then(() => {
          navigate('/');
        });
      } else if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
        setError('❌ Koneksi ke server gagal. Pastikan backend sudah berjalan di port 3001.');
        Toast.fire({
          icon: 'error',
          title: 'Koneksi Gagal',
          text: 'Koneksi ke server gagal. Pastikan backend sudah berjalan di port 3001.',
          confirmButtonColor: '#003E9C'
        });
      } else {
        setError(`❌ ${errorMessage}`);
        Toast.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: errorMessage,
          confirmButtonColor: '#003E9C'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentSignature(null);
    setError('');
  };

  const handleBack = () => {
    if (signatures.length > 0) {
      Toast.fire({
        icon: 'warning',
        title: 'Anda yakin?',
        text: 'Anda sudah menyimpan beberapa signature. Yakin ingin keluar?',
        showCancelButton: true,
        confirmButtonColor: '#003E9C',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, keluar',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/dashboard');
        }
      });
    } else {
      navigate('/dashboard');
    }
  };

  const handleDrawClick = () => {
    setShowDrawBox(true);
    setError('');
  };

  const handleCancelDraw = () => {
    setShowDrawBox(false);
    clearCanvas();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Global Style untuk SweetAlert2 z-index */}
      <style>{`
        .swal2-container {
          z-index: 999999 !important;
        }
        .swal-container-high-z-index {
          z-index: 999999 !important;
        }
      `}</style>

      {/* Sidebar */}
      <aside className="w-1/5 bg-[#003E9C] flex flex-col items-start py-8 px-8 text-white">
        <h1 className="text-3xl font-bold mb-4">E-Signature</h1>
        <p className="font-semibold text-lg mb-1">E-Signature System</p>
        <p className="text-sm opacity-90">Fast • Secure • Paperless</p>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            
            {/* Info Box */}
            {currentStep === 1 && signatures.length === 0 && (
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
                <p className="font-semibold">ℹ️ Panduan:</p>
                <p className="text-sm mt-1">
                  1. Tanda tangan pertama akan langsung diterima sebagai baseline<br/>
                  2. Tanda tangan ke-2 hingga ke-5 harus cocok dengan baseline pertama<br/>
                  3. Pastikan tanda tangan Anda konsisten untuk semua 5 signature
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
                <button 
                  onClick={() => setError('')}
                  className="absolute top-2 right-2 text-red-700 hover:text-red-900"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Progress</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div
                    key={num}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                      signatures.length >= num
                        ? 'bg-green-500 text-white'
                        : currentStep === num
                        ? 'bg-[#003E9C] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {signatures.length >= num ? '✓' : num}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Signature {Math.min(currentStep, maxSignatures)} of {maxSignatures}
              </p>
            </div>

            {/* Signature Preview or Drawing Area */}
            {!showDrawBox ? (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex items-center justify-center bg-gray-50"
                  style={{
                    backgroundImage: currentSignature
                      ? `url(${currentSignature})`
                      : 'none',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                >
                  {!currentSignature && (
                    <p className="text-gray-400 text-center">
                      Gambar atau upload tanda tangan kamu<br/>
                      {currentStep > 1 && <span className="text-xs">(Harus sama dengan signature sebelumnya)</span>}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-700">
                    Gambar Signature #{currentStep}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Gambar di area putih {currentStep > 1 && '(Harus sama dengan signature pertama)'}
                  </p>
                </div>

                {/* Canvas */}
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={250}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawingTouch}
                  onTouchMove={drawTouch}
                  onTouchEnd={stopDrawing}
                  className="border-2 border-gray-300 rounded-xl w-full cursor-crosshair bg-white mb-3"
                />

                {/* Canvas Control Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={clearCanvas}
                    className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCancelDraw}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveDrawing}
                    className="flex-1 bg-[#003E9C] text-white font-medium py-2 rounded-lg hover:bg-[#002d73] transition-colors text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!currentSignature ? (
              <div className="space-y-2">
                <button
                  onClick={handleDrawClick}
                  disabled={currentStep > maxSignatures || showDrawBox || loading}
                  className="w-full bg-[#003E9C] text-white py-2.5 rounded-lg font-medium shadow hover:bg-[#002d73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <FaPencilAlt />
                  Draw Signature
                </button>

                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadSignature}
                    disabled={currentStep > maxSignatures || showDrawBox || loading}
                    className="hidden"
                  />
                  <div className="w-full bg-[#003E9C] text-white py-2.5 rounded-lg font-medium shadow hover:bg-[#002d73] transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm">
                    <FaUpload />
                    Upload From Gallery
                  </div>
                </label>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-[#003E9C] text-white py-2.5 rounded-lg font-medium shadow hover:bg-[#002d73] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving & Validating...' : 'Save Signature'}
                </button>

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 bg-blue-100 text-[#003E9C] py-2.5 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm disabled:opacity-50"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Completed Signatures Preview */}
            {signatures.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Signature Tersimpan ({signatures.length}/5):
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {signatures.map((sig, index) => (
                    <div
                      key={index}
                      className="border-2 border-green-500 rounded-lg p-2 bg-white"
                    >
                      <img
                        src={sig.image}
                        alt={`Signature ${sig.step}`}
                        className="w-full h-16 object-contain"
                        onError={(e) => {
                          console.error('Failed to load image:', sig.image);
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <p className="text-xs text-center text-gray-600 mt-1">
                        #{sig.step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}