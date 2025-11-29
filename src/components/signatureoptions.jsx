import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaFilePdf } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

export default function SignatureOptions() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!data) return <p className="p-8">Data tidak ditemukan.</p>;


  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/signature-request/${data.id}`
        );
        const detail = await res.json();

        setFileUrl(detail.fileUrl); // URL PDF dari backend
      } catch (err) {
        console.error("Error fetching file:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [data.id]);

  const goToDraw = () => navigate("/drawsignature", { state: { ...data, fileUrl } });
  const goToUpload = () => navigate("/uploadsignature", { state: { ...data, fileUrl } });

  return (
    <div className="flex w-full min-h-screen bg-[#EEF3FA]">
      {/* SIDEBAR */}
      <div className="hidden md:block">
        <Sidebar pathname={location.pathname} navigate={navigate} />
      </div>

      {/* MAIN */}
      <div className="flex flex-col flex-1 md:ml-64">
        <Header notificationCount={2} />

        <div className="w-full p-6 flex justify-center">
          <div className="w-full max-w-4xl">
            {/* Breadcrumb */}
            <p className="text-sm text-gray-500 mb-6 mt-2">
              Notification List &gt;{" "}
              <span
                className="cursor-pointer text-[#007BFF] hover:underline"
                onClick={() => navigate("/signaturerequest", { state: data })}
              >
                Signature Request
              </span>{" "}
              &gt;{" "}
              <span className="font-semibold text-gray-800">Signature Options</span>
            </p>

            {/* CARD */}
            <div className="w-full bg-white rounded-xl p-10 min-h-[500px] flex flex-col items-center shadow-lg border border-gray-200">

              {/* PDF PREVIEW */}
              <div className="w-full max-w-lg h-64 bg-[#F5F7FA] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center mb-10 hover:bg-[#E6F0FF] hover:border-[#7CA9FF] transition-all">
                
                {loading ? (
                  <p className="text-gray-500 text-sm">Loading file...</p>
                ) : fileUrl ? (
                  <>
                    <FaFilePdf className="text-red-600 text-6xl mb-3" />
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003E9C] font-semibold hover:underline"
                    >
                      {data.fileName || "Document.pdf"}
                    </a>
                  </>
                ) : (
                  <>
                    <FaFilePdf className="text-gray-400 text-6xl mb-3" />
                    <span className="text-gray-500 text-sm">File tidak ditemukan</span>
                  </>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                <button
                  onClick={goToDraw}
                  className="w-44 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 transition active:scale-95"
                >
                  Draw Signature
                </button>

                <button
                  onClick={goToUpload}
                  className="w-44 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 transition active:scale-95"
                >
                  Upload Signature
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
