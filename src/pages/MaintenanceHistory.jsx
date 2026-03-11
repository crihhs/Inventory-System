import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function MaintenanceHistoryDialog({ isOpen, onClose, item }) {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch the history whenever the modal opens for a specific item
  useEffect(() => {
    if (!isOpen || !item) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/api/equipment/${item.id}/history`);
        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();
        setHistoryRecords(data);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, item]);

  // Helper function to turn the paragraph into a clean bulleted list
  const formatDescription = (description) => {
    if (!description) return <p className="text-sm text-slate-600">Changes were made to this equipment.</p>;

    // Split the text at every period followed by a space
    const changes = description.split(". ").filter((c) => c.trim() !== "");

    // If there is only one change (or it's the "Equipment Added" message), just show it as text
    if (changes.length <= 1) {
      return <p className="text-sm text-slate-600">{description}</p>;
    }

    // If there are multiple changes, render them as a clean list
    return (
      <ul className="mt-2 space-y-1.5">
        {changes.map((change, idx) => {
          // Remove any stray periods at the very end of the sentence
          const cleanChange = change.endsWith(".") ? change.slice(0, -1) : change;
          
          return (
            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-slate-400 mt-[2px]">•</span>
              <span>{cleanChange}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-[700px] max-w-[95vw] flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Equipment History
            </h2>
            <p className="text-sm text-slate-500">
              {item?.item_name} (SN: {item?.serial_no || "N/A"})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Loading history records...
            </div>
          ) : historyRecords.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm bg-white rounded-lg border border-slate-200">
              No history records found for this equipment.
            </div>
          ) : (
            <div className="space-y-4">
              {historyRecords.map((record, index) => (
                <div
                  key={index}
                  className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                    <span className="text-sm font-semibold text-slate-800">
                      {record.action_type || "Record Updated"}
                    </span>
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                      {record.date || "Unknown Date"}
                    </span>
                  </div>

                  {/* 👇 We call our new formatter function here */}
                  <div className="mb-4 break-words whitespace-pre-wrap text-sm leading-relaxed max-h-32 overflow-y-auto">
                    {formatDescription(record.description)}
                  </div>

                  <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                    Updated by:{" "}
                    <span className="text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                      {record.updated_by || "System"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-white rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}