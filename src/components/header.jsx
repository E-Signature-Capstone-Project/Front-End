import React from 'react';
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Header({ userName = 'User', notificationCount = 0 }) {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-8 py-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hi, {userName}!</h2>
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
            onClick={() => navigate("/notification")}
            className="relative flex items-center justify-center bg-blue-50 shadow-md p-3 rounded-full hover:bg-blue-100 transition"
            title="Notifikasi"
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
  )
}
