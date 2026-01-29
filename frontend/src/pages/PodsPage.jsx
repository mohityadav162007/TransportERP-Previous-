import React, { useState, useEffect } from "react";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";
import GlassTable from "../components/GlassTable";
import Skeleton from "../components/Skeleton";
import PodDetailsModal from "../components/PodDetailsModal";
import { formatCurrency, formatDate } from "../utils/format";
import { Package, Search, Save, Truck, CheckCircle2, FileText, Send, Eye, Filter, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Optimized Item Component for the list
const TripItem = React.memo(({ trip, isSelected, onToggle }) => (
    <div
        onClick={() => onToggle(trip.id)}
        className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors border ${isSelected ? 'bg-blue-600/20 border-blue-500/50' : 'bg-transparent border-transparent hover:bg-white/5'}`}
    >
        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-white/30'}`}>
            {isSelected && <CheckCircle2 size={12} className="text-white" />}
        </div>
        <div className="flex-grow">
            <div className="text-sm font-bold text-white">{trip.trip_code}</div>
            <div className="text-xs text-white/50">{trip.party_name}</div>
        </div>
        <div className="text-xs font-mono text-white/40">{trip.from_location}</div>
    </div>
));

export default function PodsPage() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTrip, setSelectedTrip] = useState(null); // For View Details Modal

    // Add Courier Modal State
    const [showAddCourier, setShowAddCourier] = useState(false);
    const [courierSelection, setCourierSelection] = useState(new Set());
    const [courierForm, setCourierForm] = useState({
        docketNumber: "",
        courierName: "",
        dispatchDate: new Date().toISOString().split('T')[0],
        lrNumber: ""
    });
    const [submittingCourier, setSubmittingCourier] = useState(false);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const res = await api.get("/trips?deleted=false");
            setTrips(res.data || []);
        } catch (err) {
            console.error("Failed to load trips", err);
        } finally {
            setLoading(false);
        }
    };

    // --- FILTERS (Memoized) ---
    const filteredTrips = React.useMemo(() => trips.filter(t =>
        t.trip_code?.toLowerCase().includes(searchTerm) ||
        t.party_name?.toLowerCase().includes(searchTerm) ||
        t.vehicle_number?.toLowerCase().includes(searchTerm) ||
        t.docket_no?.toLowerCase().includes(searchTerm)
    ), [trips, searchTerm]);

    // --- ADD COURIER LOGIC (Memoized) ---
    const tripsWithoutDocket = React.useMemo(() => trips.filter(t => !t.docket_no), [trips]);

    // Stable Callback for Selection
    const toggleCourierSelection = React.useCallback((id) => {
        setCourierSelection(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    }, []);

    const handleCourierSubmit = async (e) => {
        e.preventDefault();
        if (courierSelection.size === 0) return alert("Select at least one trip");

        setSubmittingCourier(true);
        try {
            await api.post("/trips/bulk-courier", {
                tripIds: Array.from(courierSelection),
                ...courierForm
            });
            alert("Courier Assigned Successfully!");
            setShowAddCourier(false);
            setCourierSelection(new Set());
            setCourierForm({ docketNumber: "", courierName: "", dispatchDate: new Date().toISOString().split('T')[0], lrNumber: "" });
            fetchTrips(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Failed to assign courier");
        } finally {
            setSubmittingCourier(false);
        }
    };

    // --- COLUMNS ---
    const columns = [
        { header: "S.No", accessor: "index", render: (_, i) => <span className="text-white/50">{i + 1}</span> },

        // Trip / Load Info
        {
            header: "Load Info",
            accessor: "load_info",
            render: (row) => (
                <div className="flex flex-col text-xs">
                    <span className="font-bold text-white">{formatDate(row.loading_date)}</span>
                    <span className="text-yellow-400 font-mono">{row.vehicle_number}</span>
                    <span className="text-white/50">{row.lr_number || 'No LR'}</span>
                </div>
            )
        },

        // Route
        {
            header: "Route",
            accessor: "route",
            render: (row) => (
                <div className="flex flex-col text-xs max-w-[150px]">
                    <span className="text-white truncate" title={row.from_location}>{row.from_location}</span>
                    <span className="text-white/30 text-[10px]">&darr;</span>
                    <span className="text-white truncate" title={row.to_location}>{row.to_location}</span>
                </div>
            )
        },

        // Party
        {
            header: "Party / Owner",
            accessor: "party",
            render: (row) => (
                <div className="flex flex-col text-xs max-w-[150px]">
                    <span className="text-blue-200 font-bold truncate" title={row.party_name}>{row.party_name}</span>
                    <span className="text-white/40 truncate" title={row.motor_owner_name}>{row.motor_owner_name}</span>
                </div>
            )
        },

        // Delivery Tracking
        {
            header: "Delivery / Docket",
            accessor: "delivery",
            render: (row) => (
                <div className="flex flex-col gap-1">
                    {row.docket_no ? (
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-blue-300 font-mono text-center mb-1 block">
                            {row.docket_no}
                        </span>
                    ) : (
                        <span className="text-[10px] text-white/20 italic">No Docket</span>
                    )}

                    <div className="flex gap-2 text-[10px] font-bold">
                        <span className={`px-1.5 py-0.5 rounded ${row.pod_status === 'RECEIVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            POD: {row.pod_status === 'RECEIVED' ? 'YES' : 'NO'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded ${row.courier_status === 'Sent' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {row.courier_status || 'Pending'}
                        </span>
                    </div>
                </div>
            )
        },

        // Unloading Details
        {
            header: "Unloading (Hemmali)",
            accessor: "himmali",
            render: (row) => (
                <div className="flex flex-col text-xs text-right">
                    {row.himmali ? (
                        <>
                            <span className="text-emerald-400 font-bold">{formatCurrency(row.himmali)}</span>
                            {row.unloading_date && <span className="text-white/40 text-[10px]">{formatDate(row.unloading_date)}</span>}
                        </>
                    ) : (
                        <span className="text-white/20">-</span>
                    )}
                </div>
            )
        },

        // Remarks
        {
            header: "Remarks",
            accessor: "remark",
            render: (row) => (
                row.remark ? <div className="text-[10px] text-white/50 w-[150px] truncate" title={row.remark}>{row.remark}</div> : <span className="text-white/10">-</span>
            )
        },

        // Actions
        {
            header: "",
            accessor: "actions",
            render: (row) => (
                <button
                    onClick={() => setSelectedTrip(row)}
                    className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                >
                    <Eye size={18} />
                </button>
            )
        }
    ];


    if (loading) return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            <Skeleton height="100px" className="glass-panel" />
            <Skeleton height="500px" className="glass-panel" />
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto pb-20 space-y-6 p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                        <FileText className="text-blue-400" /> PODs Management
                    </h1>
                    <p className="text-white/50 text-sm">Track POD receipts, courier status, and unloading details.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full"
                            placeholder="Search trips..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value.toLowerCase())}
                        />
                    </div>

                    <button
                        onClick={() => setShowAddCourier(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all text-sm whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Courier
                    </button>
                </div>
            </div>

            {/* Main Table */}
            <div className="glass-panel overflow-hidden">
                <GlassTable columns={columns} data={filteredTrips} />
                {filteredTrips.length === 0 && <div className="p-12 text-center text-white/30">No matching records found.</div>}
            </div>

            {/* View Details Modal */}
            {selectedTrip && (
                <PodDetailsModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
            )}

            {/* Add Courier Modal */}
            <AnimatePresence>
                {showAddCourier && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-[#1a1f2e] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Send className="text-blue-400" /> Bulk Courier Assignment
                                </h2>
                                <button onClick={() => setShowAddCourier(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="flex-grow flex overflow-hidden">
                                {/* Left: List */}
                                <div className="w-1/2 border-r border-white/5 flex flex-col">
                                    <div className="p-4 border-b border-white/5 bg-white/5 text-xs font-bold text-white/50 uppercase">
                                        Pending Assignment ({tripsWithoutDocket.length})
                                    </div>
                                    <div className="overflow-y-auto p-2 space-y-1 bg-black/20 flex-grow">
                                        {tripsWithoutDocket.map(t => (
                                            <TripItem
                                                key={t.id}
                                                trip={t}
                                                isSelected={courierSelection.has(t.id)}
                                                onToggle={toggleCourierSelection}
                                            />
                                        ))}
                                        {tripsWithoutDocket.length === 0 && <div className="p-8 text-center text-white/30 text-xs">No trips pending courier assignment.</div>}
                                    </div>
                                </div>

                                {/* Right: Form */}
                                <div className="w-1/2 p-6 flex flex-col justify-center space-y-6 bg-white/5">
                                    <div className="text-center mb-4">
                                        <div className="text-4xl font-black text-blue-400 mb-2">{courierSelection.size}</div>
                                        <div className="text-sm text-white/50 uppercase tracking-widest">Trips Selected</div>
                                    </div>

                                    <form onSubmit={handleCourierSubmit} className="space-y-4">
                                        <GlassInput label="Docket Number" required value={courierForm.docketNumber} onChange={e => setCourierForm({ ...courierForm, docketNumber: e.target.value })} />

                                        <GlassInput label="LR Number (Optional)" value={courierForm.lrNumber || ''} onChange={e => setCourierForm({ ...courierForm, lrNumber: e.target.value })} placeholder="Update LR No for selected trips" />

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Courier Service</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none [&>option]:text-black"
                                                value={courierForm.courierName}
                                                onChange={e => setCourierForm({ ...courierForm, courierName: e.target.value })}
                                                required
                                            >
                                                <option value="" disabled>Select Provider</option>
                                                <option value="DTDC">DTDC</option>
                                                <option value="Bluedart">Bluedart</option>
                                                <option value="Trackon">Trackon</option>
                                                <option value="Professional">Professional</option>
                                                <option value="Tirupati">Tirupati</option>
                                                <option value="Maruti">Maruti</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <GlassInput type="date" label="Dispatch Date" required value={courierForm.dispatchDate} onChange={e => setCourierForm({ ...courierForm, dispatchDate: e.target.value })} />

                                        <GlassButton type="submit" variant="primary" className="w-full justify-center py-4 mt-4" disabled={submittingCourier}>
                                            {submittingCourier ? "Assigning..." : "Confirm Assignment"}
                                        </GlassButton>
                                    </form>
                                </div>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
