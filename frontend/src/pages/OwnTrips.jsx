import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import GlassBox from "../components/GlassBox";
import { formatCurrency, formatDate } from "../utils/format";
import { Plus, Edit2, Trash2, RotateCcw } from "lucide-react";

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
        // PASSING own=true TO BACKEND
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
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">Own Vehicle Trips</h1>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20">
                        ADMIN VEHICLES
                    </span>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            // Export using same logic but filtering needed in backend export? 
                            // For now export all, or we need to add query param support to export. 
                            // Leaving standard export for now as requirement didn't specify export for own trips specifically.
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
                    placeholder="Party / Vehicle"
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
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <div className="font-bold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">
                                            {trip.trip_code}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            {trip.party_name}
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${(trip.pod_status === 'UPLOADED' || trip.pod_status === 'RECEIVED') ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                        POD: {(trip.pod_status === 'UPLOADED' || trip.pod_status === 'RECEIVED') ? 'RECEIVED' : 'PENDING'}
                                    </span>
                                </div>

                                {/* ROUTE & DATE SECTION */}
                                <div className="grid grid-cols-2 gap-4 mb-4 border-y border-white/5 py-3">
                                    <div className="border-r border-white/5 pr-2">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">From</div>
                                        <div className="text-sm text-white font-medium truncate" title={trip.from_location}>
                                            {trip.from_location}
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            {formatDate(trip.loading_date)}
                                        </div>
                                    </div>
                                    <div className="pl-2">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">To</div>
                                        <div className="text-sm text-white font-medium truncate" title={trip.to_location}>
                                            {trip.to_location}
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            {formatDate(trip.unloading_date)}
                                        </div>
                                    </div>
                                </div>

                                {/* VEHICLE SECTION */}
                                <div className="mb-4">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Vehicle</div>
                                    <div className="text-sm text-gray-300 font-medium">
                                        {trip.vehicle_number}
                                    </div>
                                </div>

                                {/* FINANCIAL SECTION */}
                                <div className="mb-6">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Party Balance</div>
                                    <div className="flex items-center gap-2">
                                        <div className={`font-bold text-2xl transition-all ${(trip.payment_status || trip.party_payment_status) === 'PAID' ? "text-green-400" : "text-rose-400"}`}>
                                            ₹{formatCurrency(trip.party_balance)}
                                        </div>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${trip.party_payment_status === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {trip.party_payment_status}
                                        </span>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                    <div className="flex gap-4">
                                        {!trip.is_deleted && (
                                            <label
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg cursor-pointer transition-all text-[11px] font-bold uppercase tracking-wider border border-blue-500/20"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                {uploadingId === trip.id ? (
                                                    <span className="animate-pulse">Uploading...</span>
                                                ) : (
                                                    <>
                                                        <Plus size={14} />
                                                        Add POD
                                                    </>
                                                )}
                                                <input type="file" hidden
                                                    onChange={e => uploadPOD(trip, e.target.files[0])}
                                                />
                                            </label>
                                        )}
                                    </div>

                                    <div className="flex gap-3 text-[11px] font-bold uppercase tracking-wider">
                                        {!trip.is_deleted ? (
                                            <>
                                                <button
                                                    className="flex items-center gap-1 px-2 py-1.5 text-gray-400 hover:text-white transition-colors"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        navigate(`/trips/edit/${trip.id}`);
                                                    }}
                                                >
                                                    <Edit2 size={13} />
                                                    Edit
                                                </button>
                                                <button
                                                    className="flex items-center gap-1 px-2 py-1.5 text-rose-500/70 hover:text-rose-400 transition-colors"
                                                    onClick={e => softDelete(e, trip.id)}
                                                >
                                                    <Trash2 size={13} />
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20"
                                                onClick={e => restore(e, trip.id)}
                                            >
                                                <RotateCcw size={13} />
                                                Restore
                                            </button>
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
                    No own vehicle trips found.
                </div>
            )}
        </div>
    );
}
