import React, { useState, useEffect } from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


export default function Header() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [notificationCount, setNotificationCount] = useState(0);


  const API_BASE_URL = "http://localhost:3001";


  useEffect(() => {
    fetchUserData();
    fetchNotificationCount();
    
    // Auto refresh notifikasi setiap 30 detik
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);


  const fetchUserData = async () => {
    try {
      // 1. Coba ambil dari localStorage dulu
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserName(userData.name || "User");
        console.log("✅ User from localStorage:", userData.name);
        return;
      }


      // 2. Kalau tidak ada di localStorage, fetch dari API
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ No token found");
        return;
      }


      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });


      if (response.ok) {
        const userData = await response.json();
        setUserName(userData.name || "User");
        // Simpan ke localStorage untuk next time
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ User from API:", userData.name);
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("❌ Error fetching user:", error);
    }
  };


  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;


      const response = await fetch(`${API_BASE_URL}/requests/incoming`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });


      if (response.ok) {
        const data = await response.json();
        const requests = data.success ? data.data : data;
        
        // Hitung yang statusnya pending (belum disetujui)
        const pendingCount = Array.isArray(requests) 
          ? requests.filter(req => req.status === 'pending').length 
          : 0;
        
        setNotificationCount(pendingCount);
        console.log("🔔 Pending notifications:", pendingCount);
      }
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    }
  };


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
