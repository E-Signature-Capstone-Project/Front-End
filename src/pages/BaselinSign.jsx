import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

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
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);
  
  const maxSignatures = 5;
  const API_BASE_URL = 'http://localhost:3001';

  // ✅ Cek login dan fetch existing signatures
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserSignatures();
  }, [navigate]);

  // ✅ Fetch signatures yang sudah disimpan
  const fetchUserSignatures = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/signature_baseline/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
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

      if (data.baselines && Array.isArray(data.baselines)) {
        const formattedSignatures = data.baselines.map((sig, index) => ({
          step: index + 1,
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
      setSignatures([]);
      setCurrentStep(1);
    }
  };

  // ✅ Handle upload file
  const handleUploadSignature = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset error dan form
    setError('');
    setErrorDetails(null);

    console.log('📁 File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validasi file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (PNG, JPG, JPEG)');
      Toast.fire({
        icon: 'error',
        title: 'Tipe File Tidak Valid',
        text: 'Harap upload file gambar (PNG, JPG, JPEG)',
        confirmButtonColor: '#003E9C'
      });
      return;
    }

    // Validasi file size (max 5MB)
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

    // ✅ Simpan File object (BUKAN base64!)
    setUploadedFile(file);

    // ✅ Buat preview untuk UI saja
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      console.log('✅ Preview image created');
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
  };

  // ✅ Simpan signature ke backend
  const handleSave = async () => {
    // Validasi file object
    if (!uploadedFile || !(uploadedFile instanceof File)) {
      console.error('❌ uploadedFile is not a File object!', uploadedFile);
      setError('File tidak valid');
      Toast.fire({
        icon: 'error',
        title: 'File Tidak Valid',
        text: 'Silakan upload file terlebih dahulu',
        confirmButtonColor: '#003E9C'
      });
      return;
    }

    setLoading(true);
    setError('');
    setErrorDetails(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }
      
      // ✅ Kirim File object langsung via FormData
      const formData = new FormData();
      formData.append('image', uploadedFile);

      // ✅ DEBUG LOG
      console.log('\n📤 Uploading to backend:');
      console.log('   Step:', currentStep);
      console.log('   File name:', uploadedFile.name);
      console.log('   File type:', uploadedFile.type);
      console.log('   File size:', uploadedFile.size, 'bytes');
      console.log('   FormData has image:', formData.has('image'));

      const response = await fetch(`${API_BASE_URL}/signature_baseline/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // ❌ JANGAN set Content-Type - biar browser yang handle multipart/form-data
        },
        body: formData
      });

      console.log('📥 Response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('📥 Response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response');
        throw new Error('Response tidak valid dari server');
      }

      if (!response.ok) {
        // ✅ Handle error dengan detail dari backend
        if (data.details) {
          console.log('📊 Error details:', data.details);
          setErrorDetails(data.details);
        }
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      }

      console.log('✅ Signature saved successfully');

      // ✅ Update state dengan data dari backend
      const newSignature = {
        step: currentStep,
        image: `${API_BASE_URL}/${data.baseline.sign_image}`,
        baseline_id: data.baseline.baseline_id
      };

      const updatedSignatures = [...signatures, newSignature];
      setSignatures(updatedSignatures);

      // ✅ Reset form
      setUploadedFile(null);
      setPreviewImage(null);
      setCurrentStep(currentStep + 1);

      // ✅ Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      // ✅ Show success message
      if (currentStep === 1) {
        Toast.fire({
          icon: 'success',
          title: 'Baseline Pertama Tersimpan! ✓',
          html: `
            <p class="mb-2">Baseline pertama berhasil disimpan!</p>
            <p class="text-sm text-gray-600">Silakan upload <strong>4 signature lagi</strong></p>
            <p class="text-xs text-red-500 mt-2">⚠️ Harus sama dengan yang pertama!</p>
          `,
          confirmButtonColor: '#003E9C',
          timer: 3500,
          timerProgressBar: true
        });
      } else if (currentStep >= maxSignatures) {
        Toast.fire({
          icon: 'success',
          title: '🎉 Selesai!',
          html: `
            <p class="text-lg font-bold mb-2">5 Baseline Signature Tersimpan!</p>
            <p class="text-sm text-gray-600">Mengarahkan ke Dashboard...</p>
          `,
          confirmButtonColor: '#003E9C',
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          navigate('/dashboard');
        });
      } else {
        const remaining = maxSignatures - currentStep;
        Toast.fire({
          icon: 'success',
          title: `Signature ${currentStep} Tersimpan! ✓`,
          html: `
            <p class="mb-1"><strong>${remaining} signature lagi</strong></p>
            <p class="text-sm text-gray-600">Progress: ${currentStep}/${maxSignatures}</p>
            ${data.validation ? `<p class="text-xs text-green-600 mt-2">Match Rate: ${data.validation.matchRate}</p>` : ''}
          `,
          confirmButtonColor: '#003E9C',
          timer: 2500,
          timerProgressBar: true
        });
      }

    } catch (error) {
      console.error('❌ Save error:', error);
      
      const errorMessage = error.message || 'Gagal menyimpan signature';
      
      // ✅ Handle berbagai jenis error dari backend
      if (errorMessage.includes('tidak cocok') || errorMessage.includes('tidak konsisten') || errorMessage.includes('match')) {
        setError('❌ Tanda tangan tidak cocok dengan baseline yang ada');
        setUploadedFile(null);
        setPreviewImage(null);
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        Toast.fire({
          icon: 'error',
          title: 'Tanda Tangan Tidak Cocok',
          html: `
            <p class="mb-2">Tanda tangan Anda <strong>tidak cocok</strong> dengan baseline pertama.</p>
            ${errorDetails && errorDetails.matchRate ? 
              `<p class="text-sm text-red-600 mb-2">Match Rate: ${errorDetails.matchRate}</p>` 
              : ''}
            <p class="text-sm text-gray-700 mt-3 border-t pt-2">
              💡 Pastikan tanda tangan Anda <strong>konsisten</strong> dengan yang pertama kali diupload.
            </p>
          `,
          confirmButtonColor: '#003E9C',
          confirmButtonText: 'Coba Lagi',
          width: '500px'
        });
      } else if (errorMessage.includes('Maksimal') || errorMessage.includes('maksimal')) {
        setError('❌ Anda sudah mencapai maksimal 5 baseline signature.');
        Toast.fire({
          icon: 'warning',
          title: 'Maksimal Tercapai',
          text: 'Anda sudah mencapai maksimal 5 baseline signature.',
          confirmButtonColor: '#003E9C',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/dashboard');
        });
      } else if (errorMessage.includes('Token') || errorMessage.includes('Authorization') || errorMessage.includes('Unauthorized')) {
        setError('❌ Sesi Anda telah berakhir.');
        Toast.fire({
          icon: 'error',
          title: 'Sesi Berakhir',
          text: 'Sesi Anda telah berakhir. Silakan login kembali.',
          confirmButtonColor: '#003E9C'
        }).then(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        });
      } else if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
        setError('❌ Koneksi ke server gagal.');
        Toast.fire({
          icon: 'error',
          title: 'Koneksi Gagal',
          html: `
            <p>Tidak dapat terhubung ke server.</p>
            <p class="text-sm text-gray-600 mt-2">Pastikan backend berjalan di port 3001</p>
          `,
          confirmButtonColor: '#003E9C'
        });
      } else if (errorMessage.includes('ML Service') || errorMessage.includes('Flask')) {
        setError('❌ AI Service tidak tersedia.');
        Toast.fire({
          icon: 'error',
          title: 'AI Service Error',
          html: `
            <p>ML API tidak tersedia.</p>
            <p class="text-sm text-gray-600 mt-2">Pastikan Flask server berjalan di port 5000</p>
          `,
          confirmButtonColor: '#003E9C'
        });
      } else {
        setError(`❌ ${errorMessage}`);
        setUploadedFile(null);
        setPreviewImage(null);
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
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

  // ✅ Reset/hapus uploaded file
  const handleReset = () => {
    setUploadedFile(null);
    setPreviewImage(null);
    setError('');
    setErrorDetails(null);
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
    
    console.log('🔄 Form reset');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            
            {/* Info Box */}
            {currentStep === 1 && signatures.length === 0 && (
              <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 px-4 py-4 rounded-lg shadow-sm">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-xl">ℹ️</span>
                  Panduan Upload Baseline Signature
                </p>
                <ol className="text-sm space-y-1.5 ml-6 list-decimal">
                  <li>Upload <strong>5 gambar tanda tangan yang sama/konsisten</strong></li>
                  <li>Signature <strong>pertama</strong> akan diterima langsung sebagai baseline</li>
                  <li>Signature <strong>ke-2 sampai ke-5</strong> akan divalidasi oleh AI</li>
                  <li><strong>Background akan dihapus otomatis</strong> oleh sistem AI</li>
                  <li>Pastikan tanda tangan Anda <strong>jelas dan konsisten</strong></li>
                </ol>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-shake">
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 text-base">{error}</p>
                    
                    {errorDetails && (
                      <div className="mt-3 text-sm text-red-700 bg-red-100 p-3 rounded-lg border border-red-200">
                        <p className="font-semibold mb-2 flex items-center gap-1">
                          <span>📊</span> Detail Validasi AI:
                        </p>
                        <ul className="space-y-1 ml-4">
                          {errorDetails.matchRate && (
                            <li>• Match Rate: <strong>{errorDetails.matchRate}</strong> {errorDetails.matchPercentage && `(${errorDetails.matchPercentage})`}</li>
                          )}
                          {errorDetails.averageDistance && (
                            <li>• Rata-rata Distance: <strong>{errorDetails.averageDistance}</strong></li>
                          )}
                          {errorDetails.averageSimilarity && (
                            <li>• Rata-rata Similarity: <strong>{errorDetails.averageSimilarity}</strong></li>
                          )}
                          {errorDetails.threshold && (
                            <li>• Threshold: <strong>{errorDetails.threshold}</strong></li>
                          )}
                        </ul>
                        {errorDetails.suggestion && (
                          <p className="mt-3 italic text-red-600 border-t border-red-300 pt-2 flex items-start gap-2">
                            <span className="text-base">💡</span>
                            <span>{errorDetails.suggestion}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setError('');
                      setErrorDetails(null);
                    }}
                    className="text-red-700 hover:text-red-900 ml-3 font-bold text-xl leading-none hover:bg-red-100 rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 mb-3 font-medium">Progress Upload Baseline</p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div
                    key={num}
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-md transition-all duration-300 ${
                      signatures.length >= num
                        ? 'bg-green-500 text-white scale-105'
                        : currentStep === num
                        ? 'bg-[#003E9C] text-white ring-4 ring-blue-200 scale-110'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {signatures.length >= num ? '✓' : num}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3 font-medium">
                <strong className="text-[#003E9C]">Step {Math.min(currentStep, maxSignatures)}</strong> dari {maxSignatures}
                {currentStep <= maxSignatures && (
                  <span className="text-gray-500"> • {maxSignatures - currentStep + 1} tersisa</span>
                )}
              </p>
            </div>

            {/* Signature Preview */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-700">
                  {currentStep === 1 ? '📝 Upload Baseline Pertama' : `📝 Upload Signature #${currentStep}`}
                </h3>
                {currentStep > 1 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                    ⚠️ Harus sama dengan #1
                  </span>
                )}
              </div>
              
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl h-72 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 transition-all hover:border-blue-400 relative overflow-hidden"
                style={{
                  backgroundImage: previewImage ? `url(${previewImage})` : 'none',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              >
                {!previewImage && (
                  <div className="text-center text-gray-400 p-6">
                    <FaUpload className="text-5xl mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-600 text-lg mb-1">Upload Tanda Tangan Anda</p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                    <p className="text-sm text-blue-600 mt-3 bg-blue-50 inline-block px-4 py-2 rounded-lg">
                      ✨ Background akan dihapus otomatis oleh AI
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!uploadedFile ? (
              <label className="block">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleUploadSignature}
                  disabled={currentStep > maxSignatures || loading}
                  className="hidden"
                />
                <div className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 text-base ${
                  currentStep > maxSignatures || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#003E9C] text-white hover:bg-[#002d73] hover:shadow-xl transform hover:-translate-y-1'
                }`}>
                  <FaUpload className="text-xl" />
                  <span className="text-lg">Upload Tanda Tangan</span>
                </div>
              </label>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-[#003E9C] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#002d73] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transform hover:-translate-y-1 text-base flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Validating AI...</span>
                    </>
                  ) : (
                    <>
                      <span>💾 Simpan Signature #{currentStep}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-all duration-200 shadow-lg disabled:opacity-50 hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaTrash />
                  <span>Hapus</span>
                </button>
              </div>
            )}

            {/* Completed Signatures Preview */}
            {signatures.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold">
                      ✓ {signatures.length}/5 Tersimpan
                    </span>
                  </p>
                  {signatures.length === 5 && (
                    <span className="text-sm text-green-600 font-semibold">🎉 Lengkap!</span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {signatures.map((sig, index) => (
                    <div
                      key={index}
                      className="border-2 border-green-500 rounded-xl p-3 bg-green-50 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <img
                        src={sig.image}
                        alt={`Signature ${sig.step}`}
                        className="w-full h-20 object-contain bg-white rounded-lg p-2 shadow-sm"
                        onError={(e) => {
                          console.error('Failed to load image:', sig.image);
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <p className="text-xs text-center text-green-700 mt-2 font-bold">
                        #{ sig.step}
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
