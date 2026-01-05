import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md p-4">
      <h2 className="text-xl font-bold mb-6">Transport ERP</h2>
      <nav className="space-y-3">
        <Link to="/" className="block text-gray-700 hover:text-blue-600">
          Dashboard
        </Link>
        <Link to="/trips" className="block text-gray-700 hover:text-blue-600">
          Trips
        </Link>
        <Link to="/analytics" className="block text-gray-700 hover:text-blue-600">
          Analytics
        </Link>
        <Link to="/reports" className="block text-gray-700 hover:text-blue-600">
          Reports
        </Link>
      </nav>
    </aside>
  );
}
