const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(express.json());

// Create / open DB file
const db = new Database("inventory.db");

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

// --- API ROUTES ---

// Get all equipment
app.get("/api/equipment", (req, res) => {
  const rows = db.prepare("SELECT * FROM equipment ORDER BY id DESC").all();
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

// Update equipment
app.put("/api/equipment/:id", (req, res) => {
  const id = Number(req.params.id);
  const e = req.body;

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
  res.json({ updated: info.changes });
});

// Delete equipment
app.delete("/api/equipment/:id", (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("DELETE FROM equipment WHERE id=?").run(id);
  res.json({ deleted: info.changes });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));