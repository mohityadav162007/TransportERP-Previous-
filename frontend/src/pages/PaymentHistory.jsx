import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassBox from "../components/GlassBox";
import { formatCurrency } from "../utils/format";

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

    const formatDateWithParentheses = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `(${day} ${month} ${year})`;
    };

    if (loading) {
        return <div className="text-white p-8 italic">Loading payment history...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 text-white">
            <h1 className="text-2xl font-bold">Payment Ledger</h1>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Search & Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Type</label>
                        <select name="type" value={filters.type} onChange={handleFilterChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="ALL">All Transactions</option>
                            <option value="CREDIT">Collections (Credit)</option>
                            <option value="DEBIT">Payouts (Debit)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">From Date</label>
                        <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">To Date</label>
                        <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vehicle Number</label>
                        <input type="text" name="vehicle" value={filters.vehicle} onChange={handleFilterChange} placeholder="Search MH12..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                    <button onClick={applyFilters} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all font-bold text-xs uppercase tracking-widest">
                        Apply Filters
                    </button>
                    <button onClick={clearFilters} className="px-6 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest">
                        Reset
                    </button>
                    <button onClick={exportToExcel} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Payment History List */}
            <div className="space-y-3">
                {history.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-500 italic">
                        No transactions found matching your criteria.
                    </div>
                ) : (
                    history.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/trips/${item.trip_id}`)}
                            className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-blue-500/5 flex justify-between items-center"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-white tracking-tight">
                                        {item.payment_type} - {item.vehicle_number}
                                    </span>
                                    <span className="text-blue-400 text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                        {item.trip_code}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        Trans: {formatDate(item.transaction_date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        Trip: {formatDateWithParentheses(item.loading_date)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xl font-black ${item.transaction_type === 'CREDIT' ? 'text-green-400' : 'text-rose-400'}`}>
                                    {item.transaction_type === 'CREDIT' ? '+' : '-'}₹{formatCurrency(item.amount)}
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                                    {item.transaction_type}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
