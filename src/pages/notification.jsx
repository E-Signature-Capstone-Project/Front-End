import React, { useState } from "react";
import { FaEnvelope, FaEnvelopeOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
  const navigate = useNavigate();

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
    <div className="flex flex-col lg:flex-row w-full p-4 gap-4">
      
      {/* LIST NOTIFICATION */}
      <div className="w-full lg:w-3/4 bg-white border rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>

        {list.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item.id)}
            className={`p-3 border-b flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${
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

      {/* DETAIL NOTIFICATION */}
      <div className="w-full lg:w-1/4 bg-gray-50 border rounded-lg p-4">
        {!selected ? (
          <p className="text-sm text-gray-500">Pilih notifikasi untuk melihat detail</p>
        ) : (
          (() => {
            const item = list.find((x) => x.id === selected);
            if (!item) return null;

            return (
              <div>
                <h4 className="text-sm font-semibold mb-2">{item.title}</h4>
                <div className="text-xs text-gray-500 mb-4">
                  From <strong>{item.sender}</strong> • {item.time}
                </div>

                <p className="text-sm text-gray-700 mb-4">{item.excerpt}</p>

                {/* BUTTON ACTION */}
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm"
                    onClick={() =>
                      navigate("/signature-request", {
                        state: {
                          id: item.id,
                          sender: item.sender,
                          email: item.email,
                          title: item.title,
                          excerpt: item.excerpt,
                          fileName: item.fileName,
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
  );
};

export default NotificationPage;
