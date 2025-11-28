import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

const UploadSignature = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const previousData = location.state || {};

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      const signatureBase64 = reader.result;

      navigate("/signaturesend", {
        state: {
          ...previousData,
          signatureImage: signatureBase64,
        },
      });
    };
  };

  return (
    <div className="flex w-full min-h-screen bg-[#EEF3FA]">

      {/* SIDEBAR — Hidden on Mobile */}
      <div className="hidden md:block">
        <Sidebar pathname={location.pathname} navigate={navigate} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 md:ml-64">

        {/* HEADER */}
        <Header notificationCount={2} />

        {/* PAGE CONTENT */}
        <div className="w-full p-6 flex justify-center">

          <div className="w-full max-w-4xl">

            {/* Breadcrumb */}
            <p className="text-sm text-gray-500 mb-6 mt-2">
              Notification List &gt;{" "}
              <span
                className="cursor-pointer text-[#007BFF] hover:underline"
                onClick={() =>
                  navigate("/signaturerequest", { state: previousData })
                }
              >
                Signature Request
              </span>{" "}
              &gt;{" "}
              <span className="font-semibold text-gray-800">
                Upload Signature
              </span>
            </p>

            {/* CARD */}
            <div className="w-full bg-white rounded-xl p-10 min-h-[500px] shadow-md border border-gray-200 flex items-center justify-center">

              {/* Upload area */}
              <div className="relative w-[500px] max-w-full h-[350px] border-2 border-dashed border-gray-300 rounded-xl bg-[#F5F7FA] flex flex-col items-center justify-center hover:bg-[#E6F0FF] hover:border-[#7CA9FF] transition-all">

                <p className="text-3xl font-semibold text-gray-300 text-center select-none">
                  Upload Your <br /> Signature Here
                </p>

                {/* Choose button */}
                <div className="absolute bottom-6">
                  <label className="px-8 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md border border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all">
                    Choose Signature
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFile}
                    />
                  </label>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UploadSignature;
