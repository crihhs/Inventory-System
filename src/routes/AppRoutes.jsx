import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import EquipmentInventory from "../pages/EquipmentInventory";
import AddEquipment from "../pages/AddEquipment";

function ModalRoutes() {
  const location = useLocation();
  const state = location.state;

  return (
    <>
      {/* Background / normal pages */}
      <Routes location={state?.backgroundLocation || location}>
        <Route path="/" element={<Navigate to="/equipment-inventory" replace />} />
        <Route path="/equipment-inventory" element={<EquipmentInventory />} />
        {/* If user directly visits /add-equipment, show it as a normal page too */}
        <Route path="/add-equipment" element={<AddEquipment />} />
      </Routes>

      {/* Modal on top ONLY when we have a backgroundLocation */}
      {state?.backgroundLocation && (
        <Routes>
          <Route path="/add-equipment" element={<AddEquipment />} />
        </Routes>
      )}
    </>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ModalRoutes />
    </BrowserRouter>
  );
}