import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AddEquipment() {
  const [openModal, setOpenModal] = useState(true); // 👈 open immediately
  const navigate = useNavigate();
  const location = useLocation();

  const editingData = location.state?.equipmentData;

  const close = () => {
    setOpenModal(false);
    navigate(-1); // 👈 go back to previous page (inventory)
  };

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState( editingData || {
    date_received: "",
    category: "",
    system: "",
    qty: 0,
    unit: "",
    item_name: "",
    description: "",
    brand: "",
    serial_no: "",
    model_no: "",
    status: "",
    location: "",
    remarks: "",
    date_last_verified: "",
    verified_by: "",
  });

  const setField = (key) => (e) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
const isEditing = !!editingData;
      // Note: Make sure your backend uses the ID like this for updates!
      const url = isEditing ? `/api/equipment/${editingData.id}` : "/api/equipment";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save");
      }

      // optional: get new id
      // const data = await res.json();

      close(); // closes modal + goes back
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {openModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-[900px] max-w-[95vw] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Add Equipment</h2>

            <form
              id="add-equipment-form"
              onSubmit={handleSave}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {" "}
              <div>
                <label className="text-sm font-medium">
                  Date Received/Installed
                </label>
                <input
                  value={formData.date_received}
                  required
                  onChange={setField("date_received")}
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category </label>
                <select
                  value={formData.category}
                  onChange={setField("category")}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                >
                  <option value="" disabled>Select a category</option>
                  <option>Communication </option>
                  <option>Meteorological </option>
                  <option>Navigation </option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">System</label>
                <input
                  type="text"
                  value={formData.system}
                  required
                  onChange={setField("system")}
                  placeholder="Ex: LLZ, DME 310, etc..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity </label>
                <input
                  type="number"
                  value={formData.qty}
                  required
                  onChange={setField("qty")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={setField("unit")}
                  placeholder="Ex: set, meters, etc..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Item Name </label>
                <input
                  type="text"
                  value={formData.item_name}
                  required
                  onChange={setField("item_name")}
                  placeholder="Ex: VHF Radio, Headset, etc..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={setField("description")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Brand </label>
                <input
                  type="text"
                  value={formData.brand}
                  required
                  onChange={setField("brand")}
                  placeholder="Ex: Rohde and Schwarz, Vascom, etc..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Serial Number</label>
                <input
                  type="text"
                  value={formData.serial_no}
                  onChange={setField("serial_no")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Model Number/Part Number
                </label>
                <input
                  value={formData.model_no}
                  required
                  onChange={setField("model_no")}
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status </label>
                <select
                  value={formData.status}
                  onChange={setField("status")}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                >
                                    <option value="" disabled>Select a status</option>

                  <option>Operational</option>
                  <option>Defective</option>
                  <option>Spare</option>
                  <option>Unverified</option>
                  <option>Used</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={setField("location")}
                  placeholder="Ex: LLZ SHELTER, CABROOM, etc..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Remarks</label>
                <input
                  value={formData.remarks}
                  onChange={setField("remarks")}
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Date Last Verified
                </label>
                <input
                  value={formData.date_last_verified}
                  required
                  onChange={setField("date_last_verified")}
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Verified By</label>
                <input
                  type="text"
                  placeholder="Ex: RC/KM/GP"
                  value={formData.verified_by}
                  onChange={setField("verified_by")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </form>
            <div className="flex justify-end gap-2 py-4">
              <button
                onClick={close}
                className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-100 hover:shadow-md hover:scale-[1.02]"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="add-equipment-form"
                disabled={saving}
                className="flex items-center gap-2 border border-slate-300 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:scale-[1.02] text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
1;
