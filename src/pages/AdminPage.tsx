import { useState } from "react";
import AdminLogin from "../components/AdminLogin";
import AdminDashboard from "../components/AdminDashboard";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);

  return authed ? (
    <AdminDashboard />
  ) : (
    <AdminLogin onSuccess={() => setAuthed(true)} />
  );
}
