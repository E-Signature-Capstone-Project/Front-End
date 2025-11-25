import React from "react";
import {
  FaTachometerAlt,
  FaCheckCircle,
  FaHistory,
  FaBell,
} from "react-icons/fa";

export default function Sidebar({ navigate, pathname }) {
  return (
    <aside className="w-64 bg-white shadow-md flex flex-col justify-between py-8 fixed left-0 top-0 h-full">
      <div>
        <div className="px-6 mb-8">
          <h1 className="text-center text-2xl font-extrabold text-[#003E9C]">
            E-Signature
          </h1>
        </div>

        <nav className="px-4 space-y-2">

          <button
            onClick={() => navigate("/dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              pathname === "/dashboard"
                ? "bg-[#E0ECFF] text-[#003E9C]"
                : "hover:bg-blue-50 text-[#003E9C]"
            }`}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/verif-log")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              pathname === "/verif-log"
                ? "bg-[#E0ECFF] text-[#003E9C]"
                : "hover:bg-blue-50 text-[#003E9C]"
            }`}
          >
            <FaCheckCircle />
            <span>Verif Log</span>
          </button>

          <button
            onClick={() => alert("Halaman Request belum dibuat")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition text-[#003E9C]"
          >
            <FaHistory />
            <span>Request</span>
          </button>

          <button
            onClick={() => alert("Halaman Notification belum dibuat")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition text-[#003E9C]"
          >
            <FaBell />
            <span>Notification</span>
          </button>

        </nav>
      </div>
    </aside>
  );
}
