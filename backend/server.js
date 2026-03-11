const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(express.json());

// Create / open DB file
const db = new Database("inventory.db");

// 👇 ADD THIS LINE to enable cascading deletes
db.pragma('foreign_keys = ON');

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_received TEXT,
    category TEXT,
    system TEXT,
    qty INTEGER,
    unit TEXT,
    item_name TEXT,
    description TEXT,
    brand TEXT,
    serial_no TEXT,
    model_no TEXT,
    property_no TEXT,
    status TEXT,
    remarks TEXT,
    location TEXT,
    date_last_verified TEXT,
    verified_by TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS equipment_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER,
    action_type TEXT,
    description TEXT,
    updated_by TEXT,
    date TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
  );
`);


// --- API ROUTES ---

// Get all equipment
app.get("/api/equipment", (req, res) => {
  const rows = db.prepare("SELECT * FROM equipment ORDER BY id DESC").all();
  res.json(rows);
});

// 👇 ADD THIS WHOLE BLOCK: Get history for a specific equipment item
app.get("/api/equipment/:id/history", (req, res) => {
  const id = Number(req.params.id);
  
  // Fetch all history for this item, sorting by newest first
  const rows = db.prepare("SELECT * FROM equipment_history WHERE equipment_id = ? ORDER BY id DESC").all(id);
  
  res.json(rows);
});

// Add new equipment
app.post("/api/equipment", (req, res) => {
  const e = req.body;

  const stmt = db.prepare(`
    INSERT INTO equipment
    (date_received, category, system, qty, unit, item_name, description, brand, serial_no, model_no, property_no, status, remarks, location, date_last_verified, verified_by)
    VALUES
    (@date_received, @category, @system, @qty, @unit, @item_name, @description, @brand, @serial_no, @model_no, @property_no, @status, @remarks, @location, @date_last_verified, @verified_by)
  `);

  const info = stmt.run({
    date_received: e.date_received ?? null,
    category: e.category ?? null,
    system: e.system ?? null,
    qty: e.qty ?? 0,
    unit: e.unit ?? null,
    item_name: e.item_name ?? null,
    description: e.description ?? null,
    brand: e.brand ?? null,
    serial_no: e.serial_no ?? null,
    model_no: e.model_no ?? null,
    property_no: e.property_no ?? null,
    status: e.status ?? null,
    remarks: e.remarks ?? null,
    location: e.location ?? null,
    date_last_verified: e.date_last_verified ?? null,
    verified_by: e.verified_by ?? null,
  });

  res.status(201).json({ id: info.lastInsertRowid });
});

// Update equipment (with detailed history tracking)
app.put("/api/equipment/:id", (req, res) => {
  const id = Number(req.params.id);
  const e = req.body;

  // 1. Fetch the OLD data before we change anything
  const oldItem = db.prepare("SELECT * FROM equipment WHERE id = ?").get(id);

  if (!oldItem) {
    return res.status(404).json({ error: "Equipment not found" });
  }

  // 2. Compare the old data to the new data to see exactly what changed
  const changesMade = [];
  const fieldsToWatch = [
    "date_received", "category", "system", "qty", "unit", 
    "item_name", "description", "brand", "serial_no", 
    "model_no", "status", "remarks", "location", 
    "date_last_verified", "verified_by"
  ];

  fieldsToWatch.forEach((field) => {
    // We convert everything to strings to easily compare them
    // (e.g., so the number 0 doesn't get confused with an empty string "")
    const oldValue = oldItem[field] == null ? "" : String(oldItem[field]);
    const newValue = e[field] == null ? "" : String(e[field]);

    if (oldValue !== newValue) {
      // Format the field name nicely (e.g., "date_last_verified" -> "date last verified")
      const cleanFieldName = field.replace(/_/g, " ");
      changesMade.push(`Changed ${cleanFieldName} from "${oldValue}" to "${newValue}"`);
    }
  });

  // 3. Perform the actual update in the database
  const stmt = db.prepare(`
    UPDATE equipment SET
      date_received=@date_received,
      category=@category,
      system=@system,
      qty=@qty,
      unit=@unit,
      item_name=@item_name,
      description=@description,
      brand=@brand,
      serial_no=@serial_no,
      model_no=@model_no,
      property_no=@property_no,
      status=@status,
      remarks=@remarks,
      location=@location,
      date_last_verified=@date_last_verified,
      verified_by=@verified_by
    WHERE id=@id
  `);

  const info = stmt.run({ ...e, id });

  // 4. If the update worked AND we actually changed something, log the details!
  if (info.changes > 0 && changesMade.length > 0) {
    // Combine all changes into one readable sentence. 
    // Example: 'Changed qty from "2" to "5". Changed status from "Operational" to "Defective".'
    const detailedDescription = changesMade.join(". ") + ".";

    const historyStmt = db.prepare(`
      INSERT INTO equipment_history (equipment_id, action_type, description, updated_by)
      VALUES (?, ?, ?, ?)
    `);
    
    historyStmt.run(
      id, 
      "Equipment Updated", 
      detailedDescription, // 👈 Saves our exact audit log!
      e.verified_by || "System User"
    );
  }

  res.json({ updated: info.changes });
});

// Delete equipment
app.delete("/api/equipment/:id", (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("DELETE FROM equipment WHERE id=?").run(id);
  res.json({ deleted: info.changes });
});

const path = require("path");

// Serve the frontend static files from the React build folder
// NOTE: Change '../frontend/dist' to the actual path of your React build folder!
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Anything that doesn't match an API route should serve the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));