import { Navigate, Route, Routes } from "react-router-dom";

import { Home, Orders, Shipments } from "@/pages";

const Router = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/shipments" element={<Shipments />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default Router;
