import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import ProjectPage from "./pages/ProjectPage";
import NotFoundPage from "./pages/NotFoundPage";
import LegacyProjectRedirect from "./pages/LegacyProjectRedirect";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/share/:shareToken" element={<ProjectPage />} />
        {/* Legacy: kept for 30 days post share-token migration. Remove after 2026-06-17. */}
        <Route path="/project/:projectId" element={<LegacyProjectRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
