import React, { useState, useEffect } from "react";
import { FaEnvelope, FaEnvelopeOpen, FaCheckCircle, FaTimesCircle, FaClock, FaEye } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/header";
import Swal from 'sweetalert2';

const NotificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:3001';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchIncomingRequests();
  }, [navigate]);

  const fetchIncomingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/requests/incoming`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Incoming requests:', data);
        
        const requests = data.success ? data.data : data;
        
        const formattedList = Array.isArray(requests) ? requests.map(req => ({
          id: req.request_id,
          title: req.Document?.title || 'Permintaan Tanda Tangan',
          sender: req.requester?.name || 'Unknown',
          email: req.requester?.email || req.recipient_email,
          excerpt: req.note || 'Mohon tanda tangan dokumen ini.',
          fileName: req.Document?.file_path?.split('/').pop() || 'document.pdf',
          filePath: req.Document?.file_path,
          unread: req.status === 'pending',
          time: formatTime(req.created_at),
          status: req.status,
          document_id: req.document_id,
          request_id: req.request_id
        })) : [];

        setList(formattedList);
      } else {
        console.error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleApprove = async (item) => {
    try {
      const result = await Swal.fire({
        icon: 'question',
        title: 'Setujui Permintaan?',
        html: `
          <p>Anda akan menandatangani dokumen <strong>${item.title}</strong></p>
          <p class="text-sm text-gray-600 mt-2">Setelah ini, Anda akan diarahkan untuk memilih posisi tanda tangan di dokumen.</p>
        `,
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Setuju & Tanda Tangan',
        cancelButtonText: 'Batal'
      });

      if (!result.isConfirmed) return;

      const token = localStorage.getItem('token');
      
      console.log('🔄 Step 1: Approving request...');
      const response = await fetch(`${API_BASE_URL}/requests/${item.request_id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyetujui permintaan');
      }
      console.log('✅ Request approved');

      console.log('🔄 Step 2: Fetching baseline signature...');
      const signatureResponse = await fetch(`${API_BASE_URL}/signature_baseline/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let signatureData = '';
      if (signatureResponse.ok) {
        const signatureResult = await signatureResponse.json();
        console.log('📦 Baseline response:', signatureResult);
        
        if (signatureResult.baselines && signatureResult.baselines.length > 0) {
          const signaturePath = signatureResult.baselines[0].sign_image;
          console.log('📂 Signature path from DB:', signaturePath);
          
          if (signaturePath) {
            console.log('🔄 Step 3: Fetching signature image file...');
            
            try {
              // Construct full URL
              const imageUrl = signaturePath.startsWith('http') 
                ? signaturePath 
                : `${API_BASE_URL}/${signaturePath}`;
              
              console.log('🌐 Fetching from URL:', imageUrl);
              
              // Fetch the actual image file
              const imageResponse = await fetch(imageUrl);
              
              if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${imageResponse.status}`);
              }
              
              const imageBlob = await imageResponse.blob();
              console.log('📦 Image blob size:', imageBlob.size, 'bytes');
              
              // Convert blob to base64 data URL
              signatureData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
              });
              
              console.log('✅ Signature converted to base64 data URL');
              console.log('📝 Format:', signatureData.substring(0, 50));
              console.log('📏 Total length:', signatureData.length);
              
            } catch (fetchError) {
              console.error('❌ Failed to fetch signature image:', fetchError);
              throw new Error('Gagal mengambil gambar tanda tangan dari server');
            }
          }
        }
      }

      if (!signatureData) {
        throw new Error('Anda belum memiliki tanda tangan baseline. Silakan buat baseline terlebih dahulu di menu Tanda Tangan.');
      }

      console.log('🔄 Step 4: Saving to localStorage...');
      localStorage.setItem('signatureData', signatureData);
      localStorage.setItem('uploadedFileUrl', `${API_BASE_URL}/${item.filePath}`);
      localStorage.setItem('uploadedFileName', item.title);
      localStorage.setItem('uploadedDocumentId', item.document_id);
      localStorage.setItem('isRequestedDocument', 'true');
      localStorage.setItem('requestId', item.request_id);
      localStorage.setItem('requesterName', item.sender);

      console.log('✅ All data saved to localStorage');
      console.log('  📄 Document ID:', item.document_id);
      console.log('  📄 File URL:', `${API_BASE_URL}/${item.filePath}`);
      console.log('  ✍️ Signature preview:', signatureData.substring(0, 100));

      console.log('🔄 Step 5: Navigating to position page...');
      navigate('/posisi-ttd');

    } catch (error) {
      console.error('❌ Approve error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.message,
        confirmButtonColor: '#003E9C'
      });
    }
  };

  const handleReject = async (requestId) => {
    try {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Tolak Permintaan?',
        text: 'Anda akan menolak permintaan tanda tangan ini',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Tolak',
        cancelButtonText: 'Batal'
      });

      if (!result.isConfirmed) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Ditolak',
          text: 'Permintaan tanda tangan telah ditolak',
          confirmButtonColor: '#003E9C'
        });
        fetchIncomingRequests();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menolak permintaan');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.message,
        confirmButtonColor: '#003E9C'
      });
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <FaClock className="text-yellow-500" title="Menunggu" />;
      case 'approved':
        return <FaCheckCircle className="text-green-500" title="Disetujui" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" title="Ditolak" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#EEF3FA]">
      <div className="hidden md:block">
        <Sidebar pathname={location.pathname} navigate={navigate} />
      </div>

      <div className="flex flex-col flex-1 md:ml-64">
        <Header notificationCount={list.filter((x) => x.unread).length} />

        <div className="p-4 md:p-6">
          <div className="w-full bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>

            {loading ? (
              <p className="text-sm text-gray-500 text-center py-4">Memuat notifikasi...</p>
            ) : list.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada permintaan tanda tangan</p>
            ) : (
              list.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                  className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-b last:border-none ${
                    selected === item.id ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.unread ? (
                      <FaEnvelope className="text-blue-600" />
                    ) : (
                      <FaEnvelopeOpen className="text-gray-400" />
                    )}
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.excerpt}</p>
                  </div>

                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))
            )}
          </div>

          <div className="w-full bg-white rounded-lg p-4 shadow">
            {!selected ? (
              <p className="text-sm text-gray-500">Pilih notifikasi untuk melihat detail</p>
            ) : (
              (() => {
                const item = list.find((x) => x.id === selected);
                if (!item) return null;

                return (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{item.title}</h4>

                    <div className="text-xs text-gray-500 mb-3">
                      From <strong>{item.sender}</strong> ({item.email}) • {item.time}
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Catatan:</strong> {item.excerpt}
                    </p>
                    
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>File:</strong> {item.fileName}
                    </p>

                    <p className="text-sm mb-4">
                      <strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        item.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status === 'pending' ? 'Menunggu' : 
                         item.status === 'approved' ? 'Disetujui & Sudah Ditandatangani' : 'Ditolak'}
                      </span>
                    </p>

                    <div className="flex gap-2">
                      {item.filePath && (
                        <button
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition inline-flex items-center gap-2"
                          onClick={() => window.open(`${API_BASE_URL}/${item.filePath}`, '_blank')}
                        >
                          <FaEye />
                          Lihat Dokumen
                        </button>
                      )}

                      {item.status === 'pending' && (
                        <>
                          <button
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition"
                            onClick={() => handleApprove(item)}
                          >
                            <FaCheckCircle className="inline mr-1" />
                            Setuju & Tanda Tangan
                          </button>

                          <button
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition"
                            onClick={() => handleReject(item.request_id)}
                          >
                            <FaTimesCircle className="inline mr-1" />
                            Tolak
                          </button>
                        </>
                      )}

                      {item.status === 'approved' && (
                        <p className="text-sm text-green-600 font-medium">
                          ✓ Dokumen sudah Anda tandatangani
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
