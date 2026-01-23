import { useState, useEffect } from "react";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";
import GlassTable from "../components/GlassTable";
import Skeleton from "../components/Skeleton";
import { formatCurrency, formatDate } from "../utils/format";
import { Package, Search, Save, Truck, CheckCircle2, History, Send } from "lucide-react";

export default function CourierManagement() {
    const [activeTab, setActiveTab] = useState("DISPATCH"); // DISPATCH | RECORDS
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTripIds, setSelectedTripIds] = useState(new Set());
    const [courierDetails, setCourierDetails] = useState({
        docketNumber: "",
        courierName: "",
        dispatchDate: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock History Data
    const [historyRecords] = useState([
        { id: 1, docket: "DTDC99887766", courier: "DTDC", date: "2024-03-10", trips: 4, status: "In Transit" },
        { id: 2, docket: "BD11223344", courier: "Bluedart", date: "2024-03-08", trips: 2, status: "Delivered" },
        { id: 3, docket: "PRO556677", courier: "Professional", date: "2024-03-05", trips: 1, status: "Delivered" },
    ]);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const res = await api.get("/trips?deleted=false");
            setTrips(res.data);
        } catch (err) {
            console.error("Failed to load trips", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const toggleTripSelection = (id) => {
        const newSelected = new Set(selectedTripIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedTripIds(newSelected);
    };

    const handleCourierChange = (e) => {
        setCourierDetails({ ...courierDetails, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (selectedTripIds.size === 0) {
            alert("Please select at least one trip to dispatch.");
            return;
        }
        if (!courierDetails.docketNumber || !courierDetails.courierName) {
            alert("Please enter courier details.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Mock API call
            console.log("Dispatching PODs:", {
                ...courierDetails,
                tripIds: Array.from(selectedTripIds)
            });
            await new Promise(resolve => setTimeout(resolve, 1500));

            alert("Courier dispatch record saved successfully!");

            setCourierDetails({
                docketNumber: "",
                courierName: "",
                dispatchDate: new Date().toISOString().split('T')[0]
            });
            setSelectedTripIds(new Set());
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save courier record.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTrips = trips.filter(t =>
        t.trip_code?.toLowerCase().includes(searchTerm) ||
        t.party_name?.toLowerCase().includes(searchTerm) ||
        t.to_location?.toLowerCase().includes(searchTerm)
    );

    if (loading) return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <Skeleton height="200px" className="glass-panel" />
            <Skeleton height="400px" className="glass-panel" />
        </div>
    );

    const tripColumns = [
        {
            header: <div className="pl-2"><input type="checkbox" disabled className="accent-blue-500 cursor-not-allowed opacity-50" /></div>,
            accessor: "select",
            render: (row) => (
                <div className="pl-2">
                    <input
                        type="checkbox"
                        checked={selectedTripIds.has(row.id)}
                        onChange={() => toggleTripSelection(row.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500 cursor-pointer"
                    />
                </div>
            )
        },
        { header: "Trip Code", accessor: "trip_code", render: (row) => <span className="font-bold text-white">{row.trip_code}</span> },
        { header: "Date", accessor: "loading_date", render: (row) => formatDate(row.loading_date) },
        { header: "Party", accessor: "party_name", render: (row) => <span className="text-blue-200">{row.party_name}</span> },
        { header: "Route", accessor: "route", render: (row) => <span className="text-xs text-white/70">{row.from_location} → {row.to_location}</span> },
        {
            header: "POD Status",
            accessor: "pod_status",
            render: (row) => (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(row.pod_status === 'UPLOADED' || row.pod_status === 'RECEIVED') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {row.pod_status || 'PENDING'}
                </span>
            )
        },
    ];

    const recordsColumns = [
        { header: "Date", accessor: "date", render: (row) => formatDate(row.date) },
        { header: "Courier", accessor: "courier", render: (row) => <span className="font-bold text-white">{row.courier}</span> },
        { header: "Docket No", accessor: "docket", render: (row) => <span className="font-mono text-blue-300">{row.docket}</span> },
        { header: "Trips Count", accessor: "trips", render: (row) => <span className="bg-white/10 px-2 py-1 rounded text-xs">{row.trips} Trips</span> },
        {
            header: "Status",
            accessor: "status",
            render: (row) => (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 text-white">

            {/* HEADBOX */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Truck className="text-blue-400" /> Courier Management
                    </h1>
                    <p className="text-white/50">Manage outbound couriers for Proof of Delivery (POD) documents.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab("DISPATCH")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'DISPATCH' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Send size={16} /> Dispatch New
                    </button>
                    <button
                        onClick={() => setActiveTab("RECORDS")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'RECORDS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        <History size={16} /> View Records
                    </button>
                </div>
            </div>

            {activeTab === "DISPATCH" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: COURIER FORM */}
                    <div className="space-y-6">
                        <GlassCard className="p-6 sticky top-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                <Package size={20} className="text-blue-400" />
                                <h2 className="text-lg font-bold text-white">Courier Details</h2>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <GlassInput label="Docket / Tracking No." name="docketNumber" placeholder="e.g. DTDC12345678" required value={courierDetails.docketNumber} onChange={handleCourierChange} />

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Courier Service</label>
                                    <select name="courierName" value={courierDetails.courierName} onChange={handleCourierChange} required className="glass-input [&>option]:text-black">
                                        <option value="" disabled>Select Provider</option>
                                        <option value="DTDC">DTDC</option>
                                        <option value="Bluedart">Bluedart</option>
                                        <option value="Trackon">Trackon</option>
                                        <option value="Professional">Professional Courier</option>
                                        <option value="Tirupati">Tirupati Courier</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <GlassInput label="Dispatch Date" type="date" name="dispatchDate" required value={courierDetails.dispatchDate} onChange={handleCourierChange} />

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-blue-300 uppercase">Selected Trips</span>
                                        <span className="text-lg font-black text-white">{selectedTripIds.size}</span>
                                    </div>
                                    <div className="text-[10px] text-blue-200/60 leading-tight">
                                        {selectedTripIds.size > 0 ? "PODs for these trips will be marked as dispatched." : "Select trips from the list to assign to this courier."}
                                    </div>
                                </div>

                                <GlassButton type="submit" variant="primary" className="w-full justify-center mt-4" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : <><Save size={16} /> Save Record</>}
                                </GlassButton>
                            </form>
                        </GlassCard>
                    </div>

                    {/* RIGHT COLUMN: TRIP LIST */}
                    <div className="lg:col-span-2 space-y-4">
                        <GlassCard className="p-4 flex items-center gap-4">
                            <Search className="text-gray-400" size={20} />
                            <input className="bg-transparent border-none outline-none text-white placeholder-gray-500 w-full" placeholder="Search by Trip Code, Party, or City..." value={searchTerm} onChange={handleSearch} />
                        </GlassCard>

                        <div className="glass-panel overflow-hidden min-h-[500px]">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Available PODs</h2>
                                <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-400">{filteredTrips.length} found</span>
                            </div>
                            <GlassTable columns={tripColumns} data={filteredTrips} />
                        </div>
                    </div>
                </div>
            ) : (
                /* RECORDS TAB */
                <div className="space-y-6">
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-2">
                            <History size={20} className="text-blue-400" />
                            <h2 className="text-lg font-bold text-white">Courier Dispatch History</h2>
                        </div>
                        <GlassTable
                            columns={recordsColumns}
                            data={historyRecords}
                        />
                        {historyRecords.length === 0 && (
                            <div className="p-12 text-center text-gray-500">No history found.</div>
                        )}
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
