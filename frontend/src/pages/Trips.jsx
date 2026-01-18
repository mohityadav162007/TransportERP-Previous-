import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import GlassBox from "../components/GlassBox";
import { formatCurrency, formatDate } from "../utils/format";
import { Plus, Edit2, Trash2, RotateCcw } from "lucide-react";

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

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    const res = await api.get(`/trips?deleted=${showDeleted}`);
    setTrips(res.data);
    setLoading(false);
  }, [showDeleted]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

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
      t.payment_status !== filters.paymentStatus) {
      return false;
    }

    if (filters.podStatus !== "ALL") {
      const isReceived = t.pod_status === "UPLOADED" || t.pod_status === "RECEIVED";
      if (filters.podStatus === "RECEIVED" && !isReceived) {
        return false;
      }
      if (filters.podStatus === "PENDING" && isReceived) {
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

  const uploadPOD = async (trip, file) => {
    if (!file) return;

    const CLOUDINARY_CLOUD_NAME = "dsreanaqu";
    const CLOUDINARY_UPLOAD_PRESET = "pod_upload_unsigned";

    setUploadingId(trip.id);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", `pod/${trip.trip_code}/`);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        // Send the secure URL to the backend
        await api.post(`/trips/${trip.id}/pod`, { url: data.secure_url });
        fetchTrips();
      } else {
        console.error("Cloudinary Upload Error:", data);
        alert("Upload failed: " + (data.error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Failed to upload POD");
    } finally {
      setUploadingId(null);
    }
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

  if (loading) return <div className="text-white p-8">Loading trips...</div>;

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
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
            className="px-4 py-2 border border-green-500 text-green-400 rounded hover:bg-green-500/10 transition-colors"
          >
            Export Excel
          </button>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="px-4 py-2 border border-white/20 rounded hover:bg-white/5 transition-colors"
          >
            {showDeleted ? "Show Active" : "Show Deleted"}
          </button>

          {!showDeleted && (
            <button
              onClick={() => navigate("/trips/new")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              + Add Trip
            </button>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input type="date" className="bg-white/10 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.fromDate}
          onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
        />
        <input type="date" className="bg-white/10 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.toDate}
          onChange={e => setFilters({ ...filters, toDate: e.target.value })}
        />
        <select className="bg-white/10 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 [&>option]:text-black"
          value={filters.paymentStatus}
          onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}
        >
          <option value="ALL">All Payments</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
        </select>
        <select className="bg-white/10 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 [&>option]:text-black"
          value={filters.podStatus}
          onChange={e => setFilters({ ...filters, podStatus: e.target.value })}
        >
          <option value="ALL">All PODs</option>
          <option value="RECEIVED">Received</option>
          <option value="PENDING">Pending</option>
        </select>
        <input className="bg-white/10 border border-white/10 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Party / Owner / Vehicle"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
        />
        <button
          onClick={() => fetchTrips()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrips.map(trip => (
          <div key={trip.id} className="h-full">
            <GlassBox>
              <div
                onClick={() => navigate(`/trips/${trip.id}`)}
                className={`cursor-pointer h-full flex flex-col ${trip.is_deleted ? "opacity-50" : ""}`}
              >
                {/* TOP SECTION */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <div className="font-bold text-white text-lg tracking-tight">
                      {trip.trip_code}
                    </div>
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      {trip.party_name}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${(trip.pod_status === 'UPLOADED' || trip.pod_status === 'RECEIVED') ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    POD: {(trip.pod_status === 'UPLOADED' || trip.pod_status === 'RECEIVED') ? 'RECEIVED' : 'PENDING'}
                  </span>
                </div>

                {/* ROUTE & DATE SECTION - Aligned Split */}
                <div className="flex justify-between mb-2">
                  <div className="flex flex-col">
                    <div className="text-sm text-white font-bold uppercase truncate">
                      {trip.from_location}
                    </div>
                    <div className="text-xs text-gray-500 font-medium lowercase">
                      {formatDate(trip.loading_date)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <div className="text-sm text-white font-bold uppercase truncate">
                      {trip.to_location}
                    </div>
                    <div className="text-xs text-gray-500 font-medium lowercase">
                      {formatDate(trip.unloading_date)}
                    </div>
                  </div>
                </div>

                {/* VEHICLE SECTION */}
                <div className="mb-4 text-sm text-gray-500 font-medium italic">
                  Vehicle: {trip.vehicle_number}
                </div>

                {/* FINANCIAL & ACTIONS SECTION */}
                <div className="flex items-end justify-between mt-auto">
                  <div className={`font-bold text-2xl ${(trip.payment_status || trip.party_payment_status) === 'PAID' ? "text-green-400" : "text-rose-400"}`}>
                    ₹{formatCurrency(trip.party_balance)}
                  </div>

                  <div className="flex gap-4 text-[11px] font-bold uppercase tracking-wider">
                    {!trip.is_deleted ? (
                      <>
                        <label
                          className="text-blue-400 cursor-pointer hover:text-blue-300"
                          onClick={e => e.stopPropagation()}
                        >
                          {uploadingId === trip.id ? "Uploading..." : "Add POD"}
                          <input type="file" hidden
                            onChange={e => uploadPOD(trip, e.target.files[0])}
                          />
                        </label>
                        <button
                          className="text-gray-400 hover:text-white"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/trips/edit/${trip.id}`);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-rose-500/80 hover:text-rose-400"
                          onClick={e => softDelete(e, trip.id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-rose-500/80 hover:text-rose-400 mr-auto"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm("PERMANENTLY DELETE? This cannot be undone.")) return;
                            await api.delete(`/trips/${trip.id}/permanent`);
                            fetchTrips();
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          className="text-green-400 hover:text-green-300"
                          onClick={e => restore(e, trip.id)}
                        >
                          Restore
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </GlassBox>
          </div>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <div className="text-gray-400 text-center mt-20 italic">
          No trips found matching your criteria.
        </div>
      )}
    </div>
  );
}
