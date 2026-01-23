import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";
import Skeleton from "../components/Skeleton";
import { formatCurrency } from "../utils/format";
import { Filter, Download, RotateCcw, ArrowRight, Wallet } from "lucide-react";

export default function PaymentHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        type: "ALL",
        fromDate: "",
        toDate: "",
        vehicle: ""
    });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.type !== "ALL") params.append("type", filters.type);
            if (filters.fromDate) params.append("fromDate", filters.fromDate);
            if (filters.toDate) params.append("toDate", filters.toDate);
            if (filters.vehicle) params.append("vehicle", filters.vehicle);

            const res = await api.get(`/payment-history?${params.toString()}`);
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch payment history:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        fetchHistory();
    };

    const clearFilters = () => {
        setFilters({
            type: "ALL",
            fromDate: "",
            toDate: "",
            vehicle: ""
        });
        setTimeout(() => fetchHistory(), 100);
    };

    const exportToExcel = () => {
        const params = new URLSearchParams();
        if (filters.type !== "ALL") params.append("type", filters.type);
        if (filters.fromDate) params.append("fromDate", filters.fromDate);
        if (filters.toDate) params.append("toDate", filters.toDate);
        if (filters.vehicle) params.append("vehicle", filters.vehicle);

        const token = localStorage.getItem("token");
        params.append("token", token);

        window.open(`${import.meta.env.VITE_API_URL}/payment-history/export?${params.toString()}`, "_blank");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto">
                <Skeleton height="32px" width="200px" />
                <Skeleton height="200px" className="glass-panel" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} height="80px" className="glass-panel" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 text-white pb-20">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Wallet className="text-blue-400" /> Payment Ledger
            </h1>

            {/* Filters */}
            <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-4 text-gray-400 border-b border-white/5 pb-2">
                    <Filter size={16} />
                    <h2 className="text-xs font-bold uppercase tracking-widest">Search & Filters</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Type</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="glass-input [&>option]:text-black"
                        >
                            <option value="ALL">All Transactions</option>
                            <option value="CREDIT">Collections (Credit)</option>
                            <option value="DEBIT">Payouts (Debit)</option>
                        </select>
                    </div>

                    <GlassInput label="From Date" type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
                    <GlassInput label="To Date" type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} />
                    <GlassInput label="Vehicle Number" name="vehicle" value={filters.vehicle} onChange={handleFilterChange} placeholder="Search MH12..." />
                </div>

                <div className="flex flex-wrap gap-3">
                    <GlassButton onClick={applyFilters} variant="primary">
                        Apply Filters
                    </GlassButton>
                    <GlassButton onClick={clearFilters} variant="secondary">
                        <RotateCcw size={16} /> Reset
                    </GlassButton>
                    <div className="ml-auto">
                        <GlassButton onClick={exportToExcel} variant="secondary" className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                            <Download size={16} /> Export Excel
                        </GlassButton>
                    </div>
                </div>
            </GlassCard>

            {/* Payment History List */}
            <div className="space-y-3">
                {history.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-500 italic flex flex-col items-center">
                        <Filter size={32} className="mb-2 opacity-50" />
                        No transactions found matching your criteria.
                    </div>
                ) : (
                    history.map((item) => (
                        <GlassCard
                            key={item.id}
                            interactive
                            onClick={() => navigate(`/trips/${item.trip_id}`)}
                            className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4"
                        >
                            <div className="flex-1 w-full sm:w-auto">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-white tracking-tight flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${item.transaction_type === 'CREDIT' ? 'bg-green-500' : 'bg-rose-500'}`}></span>
                                        {item.payment_type} - {item.vehicle_number}
                                    </span>
                                    <span className="text-blue-400 text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                        {item.trip_code}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                    <span className="flex items-center gap-1">
                                        Trans: {formatDate(item.transaction_date)}
                                    </span>
                                    <span className="flex items-center gap-1 opacity-50">|</span>
                                    <span className="flex items-center gap-1">
                                        Trip: {formatDate(item.loading_date)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right w-full sm:w-auto flex justify-between sm:block items-center border-t border-white/5 sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                <span className="sm:hidden text-xs font-bold uppercase text-gray-500">{item.transaction_type}</span>
                                <div>
                                    <div className={`text-xl font-black ${item.transaction_type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {item.transaction_type === 'CREDIT' ? '+' : '-'}₹{formatCurrency(item.amount)}
                                    </div>
                                    <div className="hidden sm:block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {item.transaction_type}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
