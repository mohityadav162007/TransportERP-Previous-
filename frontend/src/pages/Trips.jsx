import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import GlassButton from "../components/GlassButton";
import Skeleton from "../components/Skeleton";
import { formatCurrency, formatDate } from "../utils/format";
import { Plus, Edit2, Trash2, RotateCcw, Upload, FileText, Download } from "lucide-react";

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton width="150px" height="32px" />
          <Skeleton width="200px" height="40px" />
        </div>
        <Skeleton height="80px" className="glass-panel" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height="240px" className="glass-panel" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          All Trips
        </h1>

        <div className="flex flex-wrap gap-3">
          <GlassButton
            variant="secondary"
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
          >
            <Download size={16} /> Export Excel
          </GlassButton>

          <GlassButton
            variant="secondary"
            onClick={() => setShowDeleted(!showDeleted)}
          >
            {showDeleted ? "Show Active" : "Show Deleted"}
          </GlassButton>

          {!showDeleted && (
            <GlassButton
              variant="primary"
              onClick={() => navigate("/trips/new")}
            >
              <Plus size={18} /> New Trip
            </GlassButton>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50 ml-1">From Date</label>
            <input type="date" className="glass-input"
              value={filters.fromDate}
              onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50 ml-1">To Date</label>
            <input type="date" className="glass-input"
              value={filters.toDate}
              onChange={e => setFilters({ ...filters, toDate: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50 ml-1">Payment Status</label>
            <select className="glass-input [&>option]:text-black"
              value={filters.paymentStatus}
              onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50 ml-1">POD Status</label>
            <select className="glass-input [&>option]:text-black"
              value={filters.podStatus}
              onChange={e => setFilters({ ...filters, podStatus: e.target.value })}
            >
              <option value="ALL">All PODs</option>
              <option value="RECEIVED">Received</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 xl:col-span-2">
            <label className="text-xs text-white/50 ml-1">Search</label>
            <input className="glass-input"
              placeholder="Seach Party, Owner, Vehicle..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
      </GlassCard>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrips.map(trip => (
          <GlassCard
            key={trip.id}
            className={`flex flex-col h-full relative group ${trip.is_deleted ? "opacity-60 grayscale" : ""}`}
            interactive
            onClick={() => navigate(`/trips/${trip.id}`)}
          >
            {/* Deleted Badge */}
            {trip.is_deleted && <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/20 flex items-center justify-center pointer-events-none rounded-2xl z-20">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">Deleted</span>
            </div>}

            {/* TOP SECTION */}
            <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">
                    {trip.trip_code}
                  </span>
                  {(trip.pod_status === 'UPLOADED' || trip.pod_status === 'RECEIVED') ? (
                    <span className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full"><FileText size={14} /></span>
                  ) : (
                    <span className="bg-rose-500/20 text-rose-400 p-1 rounded-full" title="POD Pending"><FileText size={14} /></span>
                  )}
                </div>
                <div className="text-xs text-blue-300 font-bold uppercase tracking-wider mt-1 truncate max-w-[180px]">
                  {trip.party_name}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold text-xl ${(trip.payment_status || trip.party_payment_status) === 'PAID' ? "text-emerald-400" : "text-rose-400"}`}>
                  ₹{formatCurrency(trip.party_balance)}
                </div>
                <div className="text-[10px] text-white/40 uppercase font-medium mt-1">Balance</div>
              </div>
            </div>

            {/* ROUTE */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-white/40 uppercase mb-1">From</div>
                <div className="text-sm font-semibold text-white truncate">{trip.from_location || trip.route_from}</div>
                <div className="text-[10px] text-white/50 mt-1">{formatDate(trip.loading_date)}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-white/40 uppercase mb-1">To</div>
                <div className="text-sm font-semibold text-white truncate">{trip.to_location || trip.route_to}</div>
                <div className="text-[10px] text-white/50 mt-1">{formatDate(trip.unloading_date)}</div>
              </div>
            </div>

            {/* INFO ROW */}
            <div className="flex justify-between items-center mb-6 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <span className="bg-white/10 px-2 py-1 rounded text-white/80 font-mono">{trip.vehicle_number}</span>
              </div>
              <div>
                {/* Placeholder for other tags */}
              </div>
            </div>

            {/* ACTIONS FOOTER */}
            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
              {!trip.is_deleted ? (
                <>
                  <div
                    className={`flex items-center gap-2 text-xs font-semibold cursor-pointer hover:text-blue-400 transition-colors ${uploadingId === trip.id ? 'opacity-50' : ''}`}
                    onClick={e => e.stopPropagation()}
                  >
                    <label className="cursor-pointer flex items-center gap-1">
                      <Upload size={14} />
                      {uploadingId === trip.id ? "Uploading..." : "Upload POD"}
                      <input type="file" hidden onChange={e => uploadPOD(trip, e.target.files[0])} />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/trips/edit/${trip.id}`); }}
                      className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => softDelete(e, trip.id)}
                      className="p-2 hover:bg-rose-500/20 rounded-full text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => restore(e, trip.id)}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase"
                  >
                    <RotateCcw size={14} /> Restore
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm("PERMANENTLY DELETE?")) return;
                      await api.delete(`/trips/${trip.id}/permanent`);
                      fetchTrips();
                    }}
                    className="text-rose-500 hover:text-rose-400 text-xs font-bold uppercase"
                  >
                    Delete Forever
                  </button>
                </>
              )}
            </div>

          </GlassCard>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 glass-panel opacity-50">
          <div className="bg-white/10 p-4 rounded-full mb-4">
            <FileText size={32} />
          </div>
          <p className="text-lg font-medium text-white/50">No trips found matching criteria</p>
        </div>
      )}
    </div>
  );
}
