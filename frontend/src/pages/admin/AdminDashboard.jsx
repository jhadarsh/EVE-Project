import { Activity, Building2, FlaskConical, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
export default function AdminDashboard() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      <Link to="/admin/centres" className="panel p-6 hover:shadow-soft">
        <Building2 className="text-brand-600" />
        <h2 className="mt-5 font-bold">Centres</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create and update diagnostic centres.
        </p>
      </Link>
      <Link to="/admin/tests" className="panel p-6 hover:shadow-soft">
        <FlaskConical className="text-brand-600" />
        <h2 className="mt-5 font-bold">Tests</h2>
        <p className="mt-1 text-sm text-gray-500">Manage diagnostic tests.</p>
      </Link>
      <Link to="/admin/logs" className="panel p-6 hover:shadow-soft">
        <Activity className="text-brand-600" />
        <h2 className="mt-5 font-bold">Logs</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review structured backend logs.
        </p>
      </Link>
      <div className="panel p-6">
        <ShieldCheck className="text-green-600" />
        <h2 className="mt-5 font-bold">Authorization</h2>
        <p className="mt-1 text-sm text-gray-500">
          Admin UI is gated by the backend profile role.
        </p>
      </div>
    </div>
  );
}
