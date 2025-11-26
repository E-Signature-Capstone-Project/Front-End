import React, { useState } from "react";
import { FaEnvelope, FaEnvelopeOpen } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

const NotificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [list, setList] = useState([
    {
      id: 1,
      title: "Signature Request",
      sender: "Admin Kecamatan",
      email: "admin@mail.com",
      excerpt: "Mohon tanda tangan dokumen penting.",
      fileName: "surat_permohonan.pdf",
      unread: true,
      time: "2h ago",
    },
    {
      id: 2,
      title: "Approval Needed",
      sender: "Sekretaris Desa",
      email: "sekdesa@mail.com",
      excerpt: "Dokumen membutuhkan persetujuan Anda.",
      fileName: "approval_desa.pdf",
      unread: false,
      time: "1d ago",
    },
  ]);

  const [selected, setSelected] = useState(null);

  return (
    <div className="flex w-full min-h-screen bg-[#EEF3FA]">

      {/* SIDEBAR - HIDE ON MOBILE */}
      <div className="hidden md:block">
        <Sidebar pathname={location.pathname} navigate={navigate} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 md:ml-64">

        {/* HEADER */}
        <Header notificationCount={list.filter((x) => x.unread).length} />

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-6">

          {/* LIST CARD */}
          <div className="w-full bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>

            {list.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-b last:border-none ${
                  selected === item.id ? "bg-gray-100" : ""
                }`}
              >
                {item.unread ? (
                  <FaEnvelope className="text-blue-600" />
                ) : (
                  <FaEnvelopeOpen className="text-gray-400" />
                )}

                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.excerpt}</p>
                </div>

                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>

          {/* DETAILS CARD */}
          <div className="w-full bg-white rounded-lg p-4 shadow">
            {!selected ? (
              <p className="text-sm text-gray-500">Pilih notifikasi untuk melihat detail</p>
            ) : (
              (() => {
                const item = list.find((x) => x.id === selected);
                if (!item) return null;

                return (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{item.title}</h4>

                    <div className="text-xs text-gray-500 mb-3">
                      From <strong>{item.sender}</strong> • {item.time}
                    </div>

                    <p className="text-sm text-gray-700 mb-4">{item.excerpt}</p>

                    <div className="flex gap-2">
                      <button
                        className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm"
                        onClick={() =>
                          navigate("/signaturerequest", {
                            state: {
                              id: item.id,
                              senderName: item.sender,
                              senderEmail: item.email,
                              title: item.title,
                              note: item.excerpt,
                              fileName: item.fileName,
                              recipientRole: "Camat",
                            },
                          })
                        }
                      >
                        Open
                      </button>

                      <button
                        className="px-3 py-2 border rounded-md text-sm"
                        onClick={() =>
                          setList((prev) =>
                            prev.map((p) =>
                              p.id === item.id ? { ...p, unread: true } : p
                            )
                          )
                        }
                      >
                        Mark unread
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
