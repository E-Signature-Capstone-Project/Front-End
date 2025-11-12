import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPencilAlt, FaUpload } from 'react-icons/fa';

export default function BaselineSign() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showDrawBox, setShowDrawBox] = useState(false);
  const [currentSignature, setCurrentSignature] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const maxSignatures = 5;

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (showDrawBox && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  }, [showDrawBox]);

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

  const stopDrawing = () => setIsDrawing(false);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentSignature(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!currentSignature) return;
    const newSignatures = [...signatures, { step: currentStep, image: currentSignature }];
    setSignatures(newSignatures);
    setCurrentSignature(null);
    setCurrentStep(currentStep + 1);
    if (currentStep >= maxSignatures) {
      const userEmail = localStorage.getItem('userEmail');
      localStorage.setItem(`signatures_${userEmail}`, JSON.stringify(newSignatures));
      navigate('/dashboard');
    }
  };

  const handleReset = () => setCurrentSignature(null);
  const handleBack = () => navigate('/');
  const handleDrawClick = () => setShowDrawBox(true);
  const handleCancelDraw = () => { setShowDrawBox(false); clearCanvas(); };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-1/5 bg-[#003E9C] flex flex-col items-start py-8 px-8 text-white">
        <h1 className="text-3xl font-bold mb-4">E-Signature</h1>
        <p className="font-semibold text-lg mb-1">E-Signature System</p>
        <p className="text-sm opacity-90">Fast • Secure • Paperless</p>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-xl font-bold flex-1">Add Baseline Sign</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Progress</p>
              <div className="flex justify-center gap-2">
                {[1,2,3,4,5].map((num) => (
                  <div key={num} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    signatures.length >= num
                      ? 'bg-green-500 text-white'
                      : currentStep === num
                      ? 'bg-[#003E9C] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {signatures.length >= num ? '✓' : num}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">Signature {Math.min(currentStep, maxSignatures)} of {maxSignatures}</p>
            </div>

            {!showDrawBox ? (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex items-center justify-center bg-gray-50"
                  style={{
                    backgroundImage: currentSignature ? `url(${currentSignature})` : 'none',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                >
                  {!currentSignature && (
                    <p className="text-gray-400 text-center">
                      Gambar atau upload tanda tangan kamu
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-700">Gambar Signature #{currentStep}</h3>
                  <p className="text-xs text-gray-500">Gambar di area putih</p>
                </div>
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
                <div className="flex gap-2">
                  <button onClick={clearCanvas} className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">Clear</button>
                  <button onClick={handleCancelDraw} className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                  <button onClick={saveDrawing} className="flex-1 bg-[#003E9C] text-white font-medium py-2 rounded-lg hover:bg-[#002F6C] transition-colors text-sm">Apply</button>
                </div>
              </div>
            )}

            {!currentSignature ? (
              <div className="space-y-2">
                <button onClick={handleDrawClick} disabled={currentStep > maxSignatures || showDrawBox} className="w-full bg-[#003E9C] text-white py-2.5 rounded-lg font-medium shadow hover:bg-[#002F6C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                  <FaPencilAlt /> Draw Signature
                </button>

                <label className="block">
                  <input type="file" accept="image/*" onChange={handleUploadSignature} disabled={currentStep > maxSignatures || showDrawBox} className="hidden" />
                  <div className="w-full bg-[#003E9C] text-white py-2.5 rounded-lg font-medium shadow hover:bg-[#002F6C] transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm">
                    <FaUpload /> Upload From Gallery
                  </div>
                </label>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 bg-[#003E9C] text-white py-2.5 rounded-lg font-medium shadow hover:bg-[#002F6C] transition-colors text-sm">Save Signature</button>
                <button onClick={handleReset} className="flex-1 bg-blue-100 text-[#003E9C] py-2.5 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm">Reset</button>
              </div>
            )}

            {signatures.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-700 mb-3">Signature Tersimpan:</p>
                <div className="grid grid-cols-5 gap-2">
                  {signatures.map((sig, index) => (
                    <div key={index} className="border-2 border-green-500 rounded-lg p-2 bg-white">
                      <img src={sig.image} alt={`Signature ${sig.step}`} className="w-full h-16 object-contain" />
                      <p className="text-xs text-center text-gray-600 mt-1">#{sig.step}</p>
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
