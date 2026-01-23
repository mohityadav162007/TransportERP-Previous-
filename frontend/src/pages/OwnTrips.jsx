import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import GlassButton from "../components/GlassButton";
import GlassInput from "../components/GlassInput";
import Skeleton from "../components/Skeleton";
import { formatCurrency, formatDate } from "../utils/format";
import { Plus, Edit2, Trash2, RotateCcw, Truck, Download, FileText, Upload } from "lucide-react";

export default function OwnTrips() {
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
        const res = await api.get(`/trips?deleted=${showDeleted}&own=true`);
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
                await api.post(`/trips/${trip.id}/pod`, { url: data.secure_url });
                fetchTrips();
            } else {
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

    if (loading) return (
        <div className="space-y-6">
            <Skeleton width="200px" height="32px" />
            <Skeleton height="80px" className="glass-panel" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} height="240px" className="glass-panel" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 text-white pb-20">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="text-blue-400" />  Own Vehicle Trips
                    </h1>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20 uppercase tracking-wider">
                        Admin Vehicles
                    </span>
                </div>

                <div className="flex gap-3">
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
                        <Download size={16} /> Export
                    </GlassButton>
                    <GlassButton
                        variant="secondary"
                        onClick={() => setShowDeleted(!showDeleted)}
                    >
                        {showDeleted ? "Show Active" : "Show Deleted"}
                    </GlassButton>
                </div>
            </div>

            {/* FILTERS */}
            <GlassCard className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
                    <GlassInput type="date" label="From Date" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })} />
                    <GlassInput type="date" label="To Date" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })} />

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Payment</label>
                        <select
                            value={filters.paymentStatus}
                            onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}
                            className="glass-input [&>option]:text-black"
                        >
                            <option value="ALL">All Payments</option>
                            <option value="PAID">Paid</option>
                            <option value="UNPAID">Unpaid</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">POD Status</label>
                        <select
                            value={filters.podStatus}
                            onChange={e => setFilters({ ...filters, podStatus: e.target.value })}
                            className="glass-input [&>option]:text-black"
                        >
                            <option value="ALL">All PODs</option>
                            <option value="RECEIVED">Received</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>

                    <div className="xl:col-span-2">
                        <GlassInput label="Search" placeholder="Party / Vehicle" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                    </div>
                </div>
            </GlassCard>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTrips.map(trip => (
                    <GlassCard
                        key={trip.id}
                        className={`flex flex-col h-full group relative ${trip.is_deleted ? "opacity-60 grayscale" : ""}`}
                        interactive
                        onClick={() => navigate(`/trips/${trip.id}`)}
                    >
                        {trip.is_deleted && <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-2xl pointer-events-none">
                            <span className="bg-red-500 text-white px-3 py-1 rounded font-bold uppercase text-xs">Deleted</span>
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
                                <div className="text-xs text-blue-300 font-bold uppercase tracking-wider mt-1">
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

                        <div className="mb-6 text-xs text-white/60 font-mono bg-white/5 w-fit px-2 py-1 rounded border border-white/10">
                            {trip.vehicle_number}
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
                                            {uploadingId === trip.id ? "Uploading..." : "Add POD"}
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
                                <div className="flex gap-4 w-full justify-end">
                                    <button
                                        onClick={(e) => restore(e, trip.id)}
                                        className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase flex items-center gap-1"
                                    >
                                        <RotateCcw size={14} /> Restore
                                    </button>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                ))}
            </div>

            {filteredTrips.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 glass-panel opacity-50">
                    <Truck size={32} className="mb-2 opacity-50" />
                    <p className="text-lg font-medium text-white/50">No own vehicle trips found</p>
                </div>
            )}
        </div>
    );
}
