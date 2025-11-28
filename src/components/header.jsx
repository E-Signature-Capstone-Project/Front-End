import React from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Terima userName dari parent (Dashboard) dan optional notificationCount
export default function Header({ userName = "User", notificationCount = 0 }) {
  const navigate = useNavigate();

  const today = new Date();
  const tanggal = today.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleNotificationClick = () => {
    navigate("/notification");
  };

  const handleProfileClick = () => {
    navigate("/profil");
  };

  return (
    <header className="flex justify-between items-center px-10 py-6 bg-white shadow rounded-t-xl">
      {/* Kiri: salam + tanggal */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800">
          Hi, {userName}!
        </h1>
        <div className="text-sm text-gray-500">{tanggal}</div>
      </div>

      {/* Kanan: ikon notifikasi & profil */}
      <div className="flex gap-4 items-center">
        {/* Notifikasi dengan badge dinamis */}
        <button
          onClick={handleNotificationClick}
          className="relative cursor-pointer hover:opacity-70 transition"
          title="Lihat Notifikasi"
        >
          <FaBell className="text-2xl text-[#003e9c]" />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-1 bg-red-500 px-2 py-0.5 rounded-full text-xs text-white font-semibold min-w-[20px] text-center">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        {/* Profile icon */}
        <button
          onClick={handleProfileClick}
          className="cursor-pointer hover:opacity-70 transition"
          title="Lihat Profile"
        >
          <FaUserCircle className="text-3xl text-[#003e9c]" />
        </button>
      </div>
    </header>
  );
}
