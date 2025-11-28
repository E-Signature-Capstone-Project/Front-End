import React, { useState } from "react";

export default function RequestSignatureForm({ onSend }) {
  const [to, setTo] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="w-full max-w-xs">
      <h3 className="text-lg font-bold mb-6 mt-3 text-center border-b pb-2">
        Kirim Permintaan
      </h3>
      <label className="font-semibold mb-1 block" htmlFor="to">To :</label>
      <input
        id="to"
        value={to}
        onChange={e => setTo(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-100 border mb-4"
        placeholder="Recipient email"
      />
      <label className="font-semibold mb-1 block" htmlFor="notes">Notes</label>
      <textarea
        id="notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={3}
        className="w-full px-4 py-2 rounded bg-gray-100 border mb-6"
        placeholder="Optional notes"
      />
      <div className="flex justify-center mt-2">
        <button
          type="button"
          className="bg-[#003e9c] text-white rounded px-7 py-2 font-semibold hover:bg-blue-800 transition"
          onClick={() => onSend(to, notes)}
        >
          Send
        </button>
      </div>
    </div>
  );
}
