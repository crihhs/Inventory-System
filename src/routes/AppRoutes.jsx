import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EquipmentInventory from "../pages/EquipmentInventory";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/equipment-inventory" replace />} />
        <Route path="/equipment-inventory" element={<EquipmentInventory />} />
      </Routes>
    </BrowserRouter>
  );
}