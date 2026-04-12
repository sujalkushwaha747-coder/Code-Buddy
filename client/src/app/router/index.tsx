 import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import Dashboard from "../../features/dashboard/pages/Dashboard";
import Repositories from "../../features/repositories/pages/Repositories";
import ReviewHistoryPage from "../../features/reviews/pages/ReviewHistoryPage";
import CodeEditorPage from "../../features/editor/pages/CodeEditorPage";
import InsightsPage from "../../features/insights/pages/InsightsPage";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* 🔐 Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/reviews" element={<ReviewHistoryPage />} />
          <Route path="/editor" element={<CodeEditorPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Route>

        {/* 🔁 Redirect root to dashboard (better UX) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ❌ Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
