import { useState, useEffect } from "react";
import logo from "../assets/caaplogo.svg";
import { Download, Plus, History, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function StatusBadge({ status }) {
  const styles =
    status === "Operational"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Defective"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles}`}>
      {status || "Unknown"}
    </span>
  );
}
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
export default function EquipmentInventory() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Create state to hold your backend data
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  // 👇 Add these three lines
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // 2. Fetch data when the component loads AND every 5 seconds
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
        setLoading(false); // Stop the initial loading state
      }
    };

    // Fetch immediately when the page loads or modal closes
    fetchEquipment();

    // BACKGROUND POLLING: Fetch fresh data every 5 seconds
    const intervalId = setInterval(() => {
      fetchEquipment();
    }, 5000);

    // CLEANUP: Stop polling if the user leaves this page
    return () => clearInterval(intervalId);
  }, [location.key]);

  // 👇 Add this filtering logic before the return statement
  const filteredEquipment = equipmentList.filter((item) => {
    // 1. Check if it matches the search query
    // (We use ?. just in case an item has a blank serial number or model)
    const matchesSearch =
      searchQuery === "" ||
      item.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serial_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model_no?.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Check if it matches the category dropdown
    const matchesCategory =
      categoryFilter === "All Categories" || item.category === categoryFilter;

    // 3. Check if it matches the status dropdown
    const matchesStatus =
      statusFilter === "All Statuses" || item.status === statusFilter;

    // The item must pass all three tests to show up in the table
    return matchesSearch && matchesCategory && matchesStatus;
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
  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden m-0 p-0">
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

      <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
        <div className="flex-none">
          <h2 className="text-xl font-semibold text-slate-900">
            Equipment Inventory
          </h2>
          <p className="text-sm text-slate-500">
            Air Navigation Services Equipment Database
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm flex-none">
          <div className="p-4 space-y-3">
            <div className="flex-col flex-col md:flex-row md:justify-between gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Item Name, Serial No., Model No..."
                className="w-full md:w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <div className="flex flex-wrap items-center justify-between gap-4 py-2">
                <div className="flex flex-wrap gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-50 border border-slate-200 rounded-lg px-3 py-2 text-sm hover:border-blue-400 transition-colors duration-200"
                  >
                    <option>All Categories </option>
                    <option>Communication </option>
                    <option>Meteorological </option>
                    <option>Navigation </option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-50 border border-slate-200 rounded-lg px-3 py-2 text-sm hover:border-blue-400 transition-colors duration-200"
                  >
                    <option>All Statuses</option>
                    <option>Operational</option>
                    <option>Defective</option>
                    <option>Spare</option>
                    <option>Unverified</option>
                    <option>Used</option>
                  </select>
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

                  <button className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-100 hover:shadow-md hover:scale-[1.02]">
                    <Download size={16} /> Export to Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                  <th className="px-4 py-3 ">Date Last Verified</th>
                  <th className="px-4 py-3">Verified By</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {" "}
                {/* 3. Show a loading state, empty state, or map the real data */}
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
                      className="border-t hover:bg-blue-50"
                    >
                      {/* Make sure these match the keys you saved in AddEquipment formData */}
                      <td className="px-4 py-3">{row.date_received}</td>
                      <td className="px-4 py-3">
                        <CategoryBadge category={row.category} />
                      </td>
                      <td className="px-4 py-3 truncate max-w-[100px]">
                        {row.system}
                      </td>
                      <td className="px-4 py-3 truncate">{row.qty}</td>
                      <td className="px-4 py-3 truncate max-w-[100px]">
                        {row.unit}
                      </td>
                      <td className="px-4 py-3 font-medium truncate max-w-[100px]">
                        {row.item_name}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[100px]">
                        {row.description}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[100px]">
                        {row.brand}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[100px]">
                        {row.serial_no}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[100px]">
                        {row.model_no}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 truncate max-w-[100px]">
                        {row.remarks}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[100px]">
                        {row.location}
                      </td>
                      <td className="px-4 py-3">{row.date_last_verified}</td>
                      <td className="px-4 py-3 truncate max-w-[100px]">
                        {row.verified_by}
                      </td>
                      <td className="px-4 py-3 gap-2 flex items-center">
                        <button className="hover:#4A5565">
                          <History size={16} color="#4A5565" />
                        </button>
                        <button
                          onClick={() =>
                            navigate("/add-equipment", {
                              state: {
                                backgroundLocation: location,
                                equipmentData: row, // 👈 Pass the specific row's data to the form!
                              },
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Pencil size={16} color="#155DFC" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
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
    </div>
  );
}
