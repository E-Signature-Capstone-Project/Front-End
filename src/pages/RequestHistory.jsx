import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import IncomingRequestsTab from "../components/request/IncomingRequestTab";
import OutgoingRequestsTab from "../components/request/OutgoingRequestTab";

export default function RequestHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("outgoing"); // Default: permintaan keluar

  return (
    <div className="min-h-screen flex bg-[#f5faff]">
      <Sidebar pathname={location.pathname} navigate={navigate} />
      
      <div className="flex-1 flex flex-col min-h-screen ml-64">
        <Header />
        
        <div className="px-6 py-2 flex justify-center">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <h2 className="text-center text-2xl font-extrabold pt-10 pb-6">
              Riwayat Permintaan
            </h2>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("incoming")}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                  activeTab === "incoming"
                    ? "bg-[#003E9C] text-white border-b-4 border-[#002a6b]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📥 Permintaan Masuk
              </button>

              <button
                onClick={() => setActiveTab("outgoing")}
                className={`flex-1 py-4 px-4 text-center font-semibold transition-all ${
                  activeTab === "outgoing"
                    ? "bg-[#003E9C] text-white border-b-4 border-[#002a6b]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📤 Permintaan Keluar
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === "incoming" ? (
                <IncomingRequestsTab />
              ) : (
                <OutgoingRequestsTab />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
