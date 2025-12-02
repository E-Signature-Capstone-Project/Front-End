import React, { useState, useEffect } from "react";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";

export default function RequestTTD({ onSend, documentTitle, apiBaseUrl }) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // panggil BE setiap query berubah (min 2 huruf)
  useEffect(() => {
    const fetchSuggestions = async () => {
      const q = to.trim();
      if (q.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoadingSuggest(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${apiBaseUrl}/users/search?q=${encodeURIComponent(q)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          setSuggestions([]);
          return;
        }

        const data = await res.json(); // berupa array [{user_id, name, email}]
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error search users:", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggest(false);
      }
    };

    fetchSuggestions();
  }, [to, apiBaseUrl]);

  const handleSelectUser = (user) => {
    setTo(user.email);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full max-w-2xl px-10 py-8">
      <h3 className="text-2xl font-bold mb-2 text-center text-gray-800">
        Kirim Permintaan
      </h3>
      {documentTitle && (
        <p className="text-xs text-gray-500 text-center mb-6">
          Dokumen:
          <span className="font-semibold text-gray-700 ml-1">
            {documentTitle}
          </span>
        </p>
      )}

      <label
        className="font-semibold mb-1 block text-sm text-gray-700"
        htmlFor="to"
      >
        To
      </label>

      <div className="relative mb-6">
        <div className="flex items-center bg-gray-50 border border-gray-300 rounded-md px-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <FaEnvelope className="text-gray-400 mr-3 text-base" />
          <input
            id="to"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => to && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full px-1 py-3 bg-transparent focus:outline-none text-base"
            placeholder="Type recipient name or email..."
            autoComplete="off"
          />
        </div>

        {showSuggestions && (suggestions.length > 0 || loadingSuggest) && (
          <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {loadingSuggest && (
              <div className="px-3 py-2 text-xs text-gray-400">
                Searching...
              </div>
            )}
            {suggestions.map((user) => (
              <button
                type="button"
                key={user.user_id || user.email}
                className="w-full text-left px-3 py-2.5 hover:bg-blue-50 flex flex-col"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectUser(user)}
              >
                <span className="text-sm font-medium text-gray-800">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </button>
            ))}
            {!loadingSuggest && suggestions.length === 0 && to.length >= 2 && (
              <div className="px-3 py-2 text-xs text-gray-400">
                No user found
              </div>
            )}
          </div>
        )}
      </div>

      <label
        className="font-semibold mb-1 block text-sm text-gray-700"
        htmlFor="message"
      >
        Message
      </label>
      <textarea
        id="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base mb-8"
        placeholder="Additional message for the recipient (optional)"
      />

      <div className="flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-[#003e9c] hover:bg-[#002a6b] text-white rounded-md px-7 py-3 font-semibold text-base shadow-md transition"
          onClick={() => onSend(to, message)}
        >
          <FaPaperPlane className="text-base" />
          <span>Send Request</span>
        </button>
      </div>
    </div>
  );
}
