import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import ProjectPage from "./pages/ProjectPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
