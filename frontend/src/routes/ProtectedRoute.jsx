import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageSpinner } from "../components/common/States";
export default function ProtectedRoute({ children }) { const {loading,isAuthenticated}=useAuth(); const loc=useLocation(); if(loading)return <PageSpinner/>; if(!isAuthenticated)return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname+loc.search)}`} replace/>; return children; }