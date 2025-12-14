// src/pages/AdminProfile.jsx
import React, { useState, useEffect } from "react";
import { FaUserCircle, FaEnvelope, FaLock, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:3001";

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function AdminProfile() {
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    role: "admin",
    is_approved: false,
    createdAt: ""
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminData(data.data);
        setEditForm({
          name: data.data.name,
          email: data.data.email
        });
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Gagal memuat profil'
        });
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      Toast.fire({
        icon: 'error',
        title: 'Tidak dapat terhubung ke server'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (!editForm.name || !editForm.email) {
      Toast.fire({
        icon: 'warning',
        title: 'Nama dan email wajib diisi'
      });
      return;
    }

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        Toast.fire({
          icon: 'success',
          title: 'Profil berhasil diperbarui'
        });
        setIsEditingProfile(false);
        fetchAdminProfile();
      } else {
        const data = await response.json();
        Toast.fire({
          icon: 'error',
          title: 'Gagal memperbarui profil',
          text: data.message
        });
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      Toast.fire({
        icon: 'error',
        title: 'Tidak dapat terhubung ke server'
      });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Toast.fire({
        icon: 'warning',
        title: 'Semua field password wajib diisi'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Toast.fire({
        icon: 'warning',
        title: 'Password baru minimal 6 karakter'
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Toast.fire({
        icon: 'warning',
        title: 'Password baru tidak cocok'
      });
      return;
    }

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        Toast.fire({
          icon: 'success',
          title: 'Password berhasil diubah'
        });
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        const data = await response.json();
        Toast.fire({
          icon: 'error',
          title: 'Gagal mengubah password',
          text: data.message
        });
      }
    } catch (error) {
      console.error("❌ Error changing password:", error);
      Toast.fire({
        icon: 'error',
        title: 'Tidak dapat terhubung ke server'
      });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="flex min-h-screen bg-[#E6E6E6]">
      <AdminSidebar />

      <div className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profil Admin</h1>
            <p className="text-gray-600 mt-1">Kelola informasi profil Anda</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003E9C]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Informasi Profil</h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 text-[#003E9C] hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaEdit />
                      <span className="text-sm font-medium">Edit Profil</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUserCircle className="text-5xl text-[#003E9C]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{adminData.name}</h3>
                    <p className="text-sm text-gray-500">{adminData.email}</p>
                    <span className="inline-block mt-1 bg-blue-50 text-[#003E9C] text-xs px-3 py-1 rounded-full font-semibold">
                      {adminData.role.toUpperCase()}
                    </span>
                  </div>
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E9C]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E9C]"
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditForm({
                            name: adminData.name,
                            email: adminData.email
                          });
                        }}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FaTimes />
                        <span className="text-sm font-medium">Batal</span>
                      </button>
                      <button
                        onClick={handleEditProfile}
                        className="flex items-center gap-2 bg-[#003E9C] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        <FaSave />
                        <span className="text-sm font-medium">Simpan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center gap-3">
                      <FaUserCircle className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Nama Lengkap</p>
                        <p className="text-sm font-medium text-gray-900">{adminData.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{adminData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaLock className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-sm font-medium text-gray-900">
                          {adminData.is_approved ? "Disetujui" : "Menunggu Persetujuan"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaUserCircle className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Bergabung Sejak</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(adminData.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Change Password Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Ubah Password</h2>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="flex items-center gap-2 text-[#003E9C] hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaLock />
                      <span className="text-sm font-medium">Ubah Password</span>
                    </button>
                  )}
                </div>

                {isChangingPassword ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Lama</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E9C]"
                        placeholder="Masukkan password lama"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E9C]"
                        placeholder="Minimal 6 karakter"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E9C]"
                        placeholder="Ulangi password baru"
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: ""
                          });
                        }}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FaTimes />
                        <span className="text-sm font-medium">Batal</span>
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="flex items-center gap-2 bg-[#003E9C] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        <FaSave />
                        <span className="text-sm font-medium">Ubah Password</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Klik tombol "Ubah Password" untuk mengubah password Anda
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
