import logo from "../assets/caaplogo.svg";

const rows = [
  {
    date: "2023-05-15",
    category: "Navigation Equipment",
    system: "DVOR/DME",
    qty: 2,
    unit: "Units",
    item: "VOR Transmitter",
    desc: "VHF Omnidirectional Range Transmitter System",
    brand: "Thales",
    serial: "VOR-2023-001",
    model: "VOR-4352A",
    property: "CAAP-X-NAV-B01",
    status: "Operational",
  },
];

function StatusBadge({ status }) {
  const styles =
    status === "Operational"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Defective"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

export default function EquipmentInventory() {
  return (
    <div className="min-h-screen w-full bg-slate-50 m-0 p-0">
      <header className="w-full bg-[#0A2463] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          {/* LEFT SIDE (logo + title together) */}
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
            <h1 className="text-2xl font-semibold">
              CAAP Area X – ANS Equipment Inventory System
            </h1>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-6 space-y-6">
        {/* Page Title */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Equipment Inventory
          </h2>
          <p className="text-sm text-slate-500">
            Air Navigation Services Equipment Database
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b space-y-3">
            {/* Search + Buttons */}
            <div className="flex flex-col md:flex-row md:justify-between gap-3">
              <input
                type="text"
                placeholder="Search by Item Name, Serial No., Model No..."
                className="w-full md:w-96 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <div className="flex gap-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  + Add Equipment
                </button>

                <button className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                  Export to Excel
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option>All Categories</option>
              </select>

              <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option>All Systems</option>
              </select>

              <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option>All Statuses</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm text-left">
              <thead className="bg-slate-100 text-xs text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">System</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Serial</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Property No</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-t hover:bg-blue-50">
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3">{row.category}</td>
                    <td className="px-4 py-3">{row.system}</td>
                    <td className="px-4 py-3 text-center">{row.qty}</td>
                    <td className="px-4 py-3">{row.unit}</td>
                    <td className="px-4 py-3 font-medium">{row.item}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{row.desc}</td>
                    <td className="px-4 py-3">{row.brand}</td>
                    <td className="px-4 py-3">{row.serial}</td>
                    <td className="px-4 py-3">{row.model}</td>
                    <td className="px-4 py-3">{row.property}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 text-sm text-slate-600 border-t">
            <div>Showing 1 to 1 of 1 entries</div>
            <div className="flex gap-1">
              <button className="border px-3 py-1 rounded hover:bg-slate-100">
                Prev
              </button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded">
                1
              </button>
              <button className="border px-3 py-1 rounded hover:bg-slate-100">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
