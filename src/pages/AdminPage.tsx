import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import AdminLogin from "../components/AdminLogin";
import AdminDashboard from "../components/AdminDashboard";

export default function AdminPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const isAdmin = useQuery(
    api.auth.currentUserIsAdmin,
    isAuthenticated ? {} : "skip"
  );

  if (isLoading || (isAuthenticated && isAdmin === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
