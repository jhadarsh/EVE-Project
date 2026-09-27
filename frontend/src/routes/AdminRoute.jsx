import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageSpinner } from "../components/common/States";
export default function AdminRoute({ children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/403" replace />;
  return children;
}
