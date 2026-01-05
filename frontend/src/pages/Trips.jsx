import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import { formatCurrency } from "../utils/format";

export default function Trips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    paymentStatus: "ALL",
    podStatus: "ALL",
    search: ""
  });

  /* ============================
     FETCH TRIPS (BACKEND FILTER)
  ============================ */

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    const res = await api.get(`/trips?deleted=${showDeleted}`);
    setTrips(res.data);
    setLoading(false);
  }, [showDeleted]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  /* ============================
     FILTERING (FRONTEND ONLY)
  ============================ */

  const filteredTrips = trips.filter(t => {
    if (filters.fromDate &&
      new Date(t.loading_date) < new Date(filters.fromDate)) {
      return false;
    }

    if (filters.toDate &&
      new Date(t.loading_date) > new Date(filters.toDate)) {
      return false;
    }

    if (filters.paymentStatus !== "ALL" &&
      t.party_payment_status !== filters.paymentStatus) {
      return false;
    }

    if (filters.podStatus !== "ALL") {
      if (filters.podStatus === "UPLOADED" && t.pod_status !== "UPLOADED") {
        return false;
      }
      if (filters.podStatus === "PENDING" && t.pod_status === "UPLOADED") {
        return false;
      }
    }

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      return (
        t.party_name?.toLowerCase().includes(q) ||
        t.motor_owner_name?.toLowerCase().includes(q) ||
        t.vehicle_number?.toLowerCase().includes(q)
      );
    }

    return true;
  }).sort((a, b) => {
    const diff = new Date(b.loading_date) - new Date(a.loading_date);
    if (diff !== 0) return diff;
    return b.id - a.id;
  });

  /* ============================
     ACTIONS
  ============================ */

  const uploadPOD = async (id, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("pod", file);
    setUploadingId(id);
    await api.post(`/trips/${id}/pod`, fd);
    setUploadingId(null);
    fetchTrips();
  };

  const softDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this trip?")) return;
    await api.delete(`/trips/${id}`);
    fetchTrips();
  };

  const restore = async (e, id) => {
    e.stopPropagation();
    await api.post(`/trips/${id}/restore`);
    fetchTrips();
  };

  if (loading) return <div>Loading trips...</div>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Trips</h1>

        <div className="flex gap-3">
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              const qs = new URLSearchParams({
                startDate: filters.fromDate,
                endDate: filters.toDate,
                party: filters.search,
                token: token
              }).toString();
              window.open(`${import.meta.env.VITE_API_URL}/reports/trips?${qs}`, "_blank");
            }}
            className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50"
          >
            Export Excel
          </button>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="px-4 py-2 border rounded"
          >
            {showDeleted ? "Show Active" : "Show Deleted"}
          </button>

          {!showDeleted && (
            <button
              onClick={() => navigate("/trips/new")}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              + Add Trip
            </button>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input type="date" className="input"
          value={filters.fromDate}
          onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
        />
        <input type="date" className="input"
          value={filters.toDate}
          onChange={e => setFilters({ ...filters, toDate: e.target.value })}
        />
        <select className="input"
          value={filters.paymentStatus}
          onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}
        >
          <option value="ALL">All Payments</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
        </select>
        <select className="input"
          value={filters.podStatus}
          onChange={e => setFilters({ ...filters, podStatus: e.target.value })}
        >
          <option value="ALL">All PODs</option>
          <option value="UPLOADED">Uploaded</option>
          <option value="PENDING">Pending</option>
        </select>
        <input className="input"
          placeholder="Party / Owner / Vehicle"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
        />
        <button
          onClick={() => setFilters({ ...filters })}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Apply
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrips.map(trip => (
          <div
            key={trip.id}
            onClick={() => navigate(`/trips/${trip.id}`)}
            className={`cursor-pointer border rounded p-5 shadow hover:shadow-lg ${trip.is_deleted ? "bg-gray-100 opacity-70" : trip.payment_status === 'PAID' ? "bg-green-50" : "bg-white"
              }`}
          >
            <div className="flex justify-between mb-2">
              <div className="font-semibold">{trip.trip_code}</div>
              <span className="text-xs">POD: {trip.pod_status}</span>
            </div>

            <div className="text-sm text-gray-600 mb-2">
              {trip.from_location} → {trip.to_location}
            </div>

            <div className="text-sm mb-1">
              Vehicle: {trip.vehicle_number}
            </div>

            <div className="font-bold text-red-600 mb-3">
              ₹{formatCurrency(trip.party_balance)}
            </div>

            <div className="flex justify-between">
              {!trip.is_deleted && trip.pod_status !== "UPLOADED" && (
                <label
                  className="text-blue-600 text-sm cursor-pointer"
                  onClick={e => e.stopPropagation()}
                >
                  {uploadingId === trip.id ? "Uploading..." : "Upload POD"}
                  <input type="file" hidden
                    onChange={e => uploadPOD(trip.id, e.target.files[0])}
                  />
                </label>
              )}

              <div className="flex gap-3 text-sm">
                {!trip.is_deleted ? (
                  <>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/trips/edit/${trip.id}`);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={e => softDelete(e, trip.id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    className="text-green-600"
                    onClick={e => restore(e, trip.id)}
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {
        filteredTrips.length === 0 && (
          <div className="text-gray-500 text-center mt-10">
            No trips found
          </div>
        )
      }
    </div >
  );
}
