import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Completed from "../components/completed";

import { FaExclamationTriangle, FaFilePdf, FaUserCircle } from "react-icons/fa";

export default function SignatureSend() {
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (location.state) setData(location.state);

    // Ambil signature BASE64 dari localStorage
    const savedSignature = localStorage.getItem("savedSignature");

    if (savedSignature) {
      setSignatureImage(savedSignature); // tampilkan tanda tangan
    }
  }, [location.state]);

  if (!data) return <p className="p-4">Data tidak ditemukan.</p>;

  const handleSend = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate("/dashboard");
  };

  return (
    <div className="flex w-full min-h-screen bg-[#F5FAFF] overflow-hidden">
      {/* SIDEBAR */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:pl-64">
        <Header />

        <div className="flex-1 px-4 sm:px-6 md:px-10 py-8 md:py-12 flex justify-center overflow-y-auto">

          <div className="w-full max-w-4xl bg-white rounded-xl p-6 sm:p-8 md:p-10 shadow-md border border-gray-200">

            {/* TITLE */}
            <div className="flex items-start gap-3 mb-6">
              <FaExclamationTriangle className="text-[#003E9C] text-lg sm:text-xl mt-1" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                Dokumen telah ditandatangani
              </h2>
            </div>

            {/* SENDER INFO */}
            <div className="flex gap-3 sm:gap-4 mb-6">
              <FaUserCircle className="text-3xl sm:text-4xl text-[#003E9C]" />
              <div>
                <p className="text-gray-900 text-base sm:text-lg leading-tight">
                  <span className="font-bold">{data.senderName}</span>{" "}
                  <span className="text-gray-600 text-sm">
                    &lt;{data.senderEmail}&gt;
                  </span>
                </p>
                <p className="text-gray-500 text-sm font-medium mt-1">
                  To: {data.recipientRole}
                </p>
              </div>
            </div>

            {/* NOTE */}
            <div className="mb-6 pl-0 md:pl-14">
              <p className="font-bold text-gray-900 mb-1">Note :</p>
              <p className="text-gray-700 text-sm sm:text-base">{data.note}</p>
            </div>

            {/* DOCUMENT PREVIEW */}
            <div className="pl-0 md:pl-14 flex flex-col items-start">

              <div className="relative bg-[#E6E6E6] w-40 sm:w-48 h-28 sm:h-32 
                   border border-gray-300 rounded-lg shadow flex items-center justify-center mb-3 overflow-hidden">

                {/* Text Preview */}
                <span className="text-gray-500 text-xs">Preview</span>

                {/* Signature BASE64 */}
                {signatureImage && (
                  <img
                    src={signatureImage}
                    alt="Signature"
                    className="absolute bottom-2 right-2 w-16 sm:w-20 opacity-90"
                  />
                )}
              </div>

              <div className="flex items-center gap-2 text-[#003E9C]">
                <FaFilePdf className="text-base sm:text-lg" />
                <span className="font-bold text-xs sm:text-sm">
                  {data.fileName || "Surat Tugas.pdf"}
                </span>
              </div>
            </div>

            {/* SEND BUTTON */}
            <div className="flex justify-end mt-10">
              <button
                onClick={handleSend}
                className="px-6 py-2 bg-[#003E9C] text-white font-bold rounded-lg 
                hover:bg-[#002A6B] transition shadow text-sm sm:text-base"
              >
                Send
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* POPUP */}
      {showPopup && <Completed onClose={handlePopupClose} />}
    </div>
  );
}
