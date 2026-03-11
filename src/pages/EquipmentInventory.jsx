import { useState, useEffect } from "react";
import logo from "../assets/caaplogo.svg";
import { Download, Plus, History, Pencil, Trash2, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {  MaintenanceHistoryDialog } from "./MaintenanceHistory";

// Status Badge
function StatusBadge({ status }) {
  const styles =
    status === "Operational"
      ? "bg-emerald-100 text-emerald-700"   // green
      : status === "Defective"
      ? "bg-red-100 text-red-700"          // red
      : status === "Spare"
      ? "bg-yellow-100 text-yellow-700"        // pink
      : status === "Used"
      ? "bg-blue-100 text-blue-700"        // blue
      : status === "Unverified"
      ? "bg-gray-100 text-gray-700"        // gray
      : "bg-slate-100 text-slate-700";     // fallback for unknown

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles}`}>
      {status || "Unknown"}
    </span>
  );
}

// Category Badge
function CategoryBadge({ category }) {
  const styles =
    category === "Communication"
      ? "bg-blue-100 text-blue-700"
      : category === "Meteorological"
      ? "bg-cyan-100 text-cyan-700"
      : category === "Navigation"
      ? "bg-green-100 text-green-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles}`}>
      {category || "Uncategorized"}
    </span>
  );
}

// Equipment Inventory Component
export default function EquipmentInventory() {
  const location = useLocation();
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Modal states
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [viewEquipment, setViewEquipment] = useState(null);
  const openView = (equipment) => setViewEquipment(equipment);
  const closeView = () => setViewEquipment(null);

  const openHistory = (equipment) => {
    setSelectedEquipment(equipment);
    setIsHistoryOpen(true);
  };

  const closeHistory = () => {
    setSelectedEquipment(null);
    setIsHistoryOpen(false);
  };

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch("/api/equipment");
        if (!res.ok) throw new Error("Failed to fetch data");

        const data = await res.json();
        setEquipmentList(data);
      } catch (err) {
        console.error("Error fetching equipment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
    const intervalId = setInterval(fetchEquipment, 5000);
    return () => clearInterval(intervalId);
  }, [location.key]);

  // 👇 Add this filtering logic before the return statement
  const filteredEquipment = equipmentList.filter((item) => {
    // 1. Check if it matches the search query
    // (We use ?. just in case an item has a blank serial number or model)
const matchesSearch =
      searchQuery === "" ||
      Object.values(item).some((value) =>
        value !== null &&
        value !== undefined &&
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    // 2. Check if it matches the category dropdown
    const matchesCategory =
      categoryFilter === "All Categories" || item.category === categoryFilter;

    // 3. Check if it matches the status dropdown
    const matchesStatus =
      statusFilter === "All Statuses" || item.status === statusFilter;
const matchesDate = (() => {
      // 1. If the user hasn't picked any dates, let everything pass
      if (!startDate && !endDate) return true;
      
      // 2. If the item has no date at all, hide it
      if (!item.date_received) return false;

      // 3. Simple string comparison (works perfectly for "YYYY-MM-DD" format)
      if (startDate && item.date_received < startDate) return false;
      if (endDate && item.date_received > endDate) return false;

      return true;
    })();
    // The item must pass all three tests to show up in the table
    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  // Add this new function to handle deleting
  const handleDelete = async (id) => {
    // 1. Ask the user for confirmation so they don't delete by accident
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this equipment? This action cannot be undone.",
    );

    if (!isConfirmed) return; // Stop if they click "Cancel"

    try {
      // 2. Tell the backend to delete the item
      // Note: Make sure this URL matches your actual backend delete route!
      const res = await fetch(`/api/equipment/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete equipment");
      }

      // 3. Update the table instantly by filtering out the deleted item
      setEquipmentList((prevList) => prevList.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete the equipment. Please try again.");
    }
  };
  // 👇 Add this function to handle exporting the table
  const handleExport = () => {
    // 1. Don't export if the table is empty
    if (filteredEquipment.length === 0) {
      alert("No data to export!");
      return;
    }

    // 2. Define the exact column headers for the Excel file
    const headers = [
      "Date Received", "Category", "System", "Qty", "Unit",
      "Item Name", "Description", "Brand", "Serial No.", "Model No.",
      "Status", "Remarks", "Location", "Date Last Verified", "Verified By"
    ];

    // 3. Map the data to match the headers and format it for CSV
    const csvRows = [
      headers.join(","), // Add the header row first
      ...filteredEquipment.map((item) => {
        return [
          item.date_received,
          item.category,
          item.system,
          item.qty,
          item.unit,
          item.item_name,
          item.description,
          item.brand,
          item.serial_no,
          item.model_no,
          item.status,
          item.remarks,
          item.location,
          item.date_last_verified,
          item.verified_by
        ].map(value => {
          // Wrap everything in quotes and escape existing quotes 
          // (This ensures paragraphs with commas don't break the Excel columns)
          const stringValue = value === null || value === undefined ? "" : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(",");
      })
    ];

    // 4. Combine rows with line breaks to create the file content
    const csvString = csvRows.join("\n");
    
    // 5. Create a Blob (a file-like object) and trigger the download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    // Name the file dynamically with today's date!
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `CAAP_Inventory_${today}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden m-0 p-0">
      {/* Header */}
      <header className="w-full bg-[#0A2463] text-white px-6 py-4 flex-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
            <h1 className="text-2xl font-semibold">
              CAAP Area X – ANS Equipment Inventory System
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
        {/* Title */}
        <div className="flex-none">
          <h2 className="text-xl font-semibold text-slate-900">
            Equipment Inventory
          </h2>
          <p className="text-sm text-slate-500">
            Air Navigation Services Equipment Database
          </p>
        </div>

{/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm flex-none">
          <div className="p-4 space-y-3">
            
            {/* 1. Search Bar (Now on its own line) */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Item Name, Serial No., Model No..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            {/* 2. Dropdowns & Buttons (Automatically sits below search) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-40 border border-slate-200 rounded-lg px-3 py-2 text-sm hover:border-blue-400 transition-colors duration-200"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Communication">Communication</option>
                  <option value="Meteorological">Meteorological</option>
                  <option value="Navigation">Navigation</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40 border border-slate-200 rounded-lg px-3 py-2 text-sm hover:border-blue-400 transition-colors duration-200"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Operational">Operational</option>
                  <option value="Defective">Defective</option>
                  <option value="Spare">Spare</option>
                  <option value="Unverified">Unverified</option>
                  <option value="Used">Used</option>
                </select>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                  <span className="text-xs text-slate-500 font-medium ml-1">Received:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-sm focus:outline-none focus:ring-0 text-slate-700 w-[115px]"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-sm focus:outline-none focus:ring-0 text-slate-700 w-[115px]"
                  />
                  {/* Clear Date Filter Button */}
                  {(startDate || endDate) && (
                    <button 
                      onClick={() => { setStartDate(""); setEndDate(""); }}
                      className="p-1 hover:bg-slate-200 rounded-full transition-colors ml-1 text-slate-400 hover:text-red-500"
                      title="Clear Dates"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate("/add-equipment", {
                      state: { backgroundLocation: location },
                    })
                  }
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                >
                  <Plus size={16} /> Add Equipment
                </button>

                <button 
                onClick={handleExport}
                className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-100 hover:shadow-md hover:scale-[1.02]">
                  <Download size={16} /> Export to Excel
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Equipment Table */}
        <div className="bg-white rounded-xl shadow-sm flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-100 text-xs text-slate-600 uppercase sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                <tr>
                  <th className="px-4 py-3">Date Received/Installed</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">System</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Serial No.</th>
                  <th className="px-4 py-3">Model No./Part No.</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Date Last Verified</th>
                  <th className="px-4 py-3">Verified By</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="16"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Loading equipment...
                    </td>
                  </tr>
                ) : equipmentList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="16"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No equipment found. Add some to get started!
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((row, index) => (
                    <tr
                      key={row.id || index}
                      onClick={() => openView(row)}
                      className=" hover:bg-blue-50"
                    >
                      <td className="px-4 py-3">{row.date_received}</td>
                      <td className="px-4 py-3 max-w-[50px]">
                        <CategoryBadge category={row.category} />
                      </td>
                      <td className="px-4 py-3 truncate max-w-[50px]">
                        {row.system}
                      </td>
                      <td className="px-4 py-3 truncate">{row.qty}</td>
                      <td className="px-4 py-3 truncate max-w-[50px]">
                        {row.unit}
                      </td>
                      <td className="px-4 py-3 font-medium truncate max-w-[50px]">
                        {row.item_name}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[50px]">
                        {row.description}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[50px]">
                        {row.brand}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[50px]">
                        {row.serial_no}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[50px]">
                        {row.model_no}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 truncate max-w-[50px]">
                        {row.remarks}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[50px]">
                        {row.location}
                      </td>
                      <td className="px-4 py-3">{row.date_last_verified}</td>
                      <td className="px-4 py-3 truncate max-w-[50px]">
                        {row.verified_by}
                      </td>
                      <td 
                      className="px-4 py-3 gap-2 flex items-center">
                       <button 
                          onClick={(e) => { e.stopPropagation(); openHistory(row); }}
                          className="p-1.5 rounded-md transition-colors duration-200 hover:bg-slate-200"
                        >
                          <History size={16} color="#4A5565" />
                        </button>
                       <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/add-equipment", {
                              state: { backgroundLocation: location, equipmentData: row },
                            });
                          }}
                          className="p-1.5 rounded-md transition-colors duration-200 hover:bg-blue-100"
                        >
                          <Pencil size={16} color="#155DFC" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
                          title="Delete Equipment"
                          className="p-1.5 rounded-md transition-colors duration-200 hover:bg-red-100"
                        >
                          <Trash2 size={16} color="#E7000B" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Maintenance History Modal */}
      <MaintenanceHistoryDialog
        isOpen={isHistoryOpen}
        onClose={closeHistory}
        item={selectedEquipment}
        onSave={(updatedItem) => {
          // Update the equipment list when a new maintenance record is added
          setEquipmentList((prevList) =>
            prevList.map((eq) => (eq.id === updatedItem.id ? updatedItem : eq))
          );
        }}
      />
      {/* 👇 ADD THIS VIEW DETAILS MODAL */}
      {viewEquipment && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
          onClick={closeView}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[600px] max-w-[95vw] p-6 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Equipment Details</h2>
              <button
                onClick={closeView}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto space-y-4 text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Item Name</span> {viewEquipment.item_name || "-"}</div>
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Brand</span> {viewEquipment.brand || "-"}</div>
                
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Category</span> <CategoryBadge category={viewEquipment.category} /></div>
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Status</span> <StatusBadge status={viewEquipment.status} /></div>
                
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Serial No.</span> {viewEquipment.serial_no || "-"}</div>
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Model No.</span> {viewEquipment.model_no || "-"}</div>
                
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">System</span> {viewEquipment.system || "-"}</div>
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Location</span> {viewEquipment.location || "-"}</div>
                
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Quantity</span> {viewEquipment.qty} {viewEquipment.unit}</div>
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Date Received</span> {viewEquipment.date_received || "-"}</div>
                
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Verified By</span> {viewEquipment.verified_by || "-"}</div>
                <div><span className="block text-xs font-semibold text-slate-400 uppercase">Date Last Verified</span> {viewEquipment.date_last_verified || "-"}</div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</span>
                <p className="bg-slate-50 p-3 rounded-md break-words whitespace-pre-wrap text-sm leading-relaxed max-h-32 overflow-y-auto">{viewEquipment.description || "No description provided."}</p>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Remarks</span>
                <p className="bg-slate-50 p-3 rounded-md break-words whitespace-pre-wrap text-sm leading-relaxed max-h-32 overflow-y-auto">{viewEquipment.remarks || "No remarks."}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeView}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}