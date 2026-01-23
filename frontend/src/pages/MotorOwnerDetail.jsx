import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassButton from "../components/GlassButton";
import Skeleton from "../components/Skeleton";
import { formatCurrency } from "../utils/format";
import { ArrowLeft, User, Phone, Truck, Wallet } from "lucide-react";

export default function MotorOwnerDetail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const [owner, setOwner] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [name]);

    const loadData = async () => {
        try {
            const mRes = await api.get(`/masters/motor-owners?name=${encodeURIComponent(name)}`);
            const mMatch = mRes.data.find(m => m.name.toLowerCase() === name.toLowerCase());
            setOwner(mMatch || { name: name, mobile: "N/A" });

            const tRes = await api.get("/trips");
            const ownerTrips = tRes.data.filter(t => (t.motor_owner_name || "").toLowerCase() === name.toLowerCase());
            setTrips(ownerTrips);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <Skeleton height="100px" className="glass-panel" />
            <Skeleton height="150px" className="glass-panel" />
            <Skeleton height="400px" className="glass-panel" />
        </div>
    );

    return (
        <div className="space-y-8 text-white max-w-6xl mx-auto pb-20">
            {/* HEADER */}
            <div className="flex items-center gap-4">
                <GlassButton variant="secondary" onClick={() => navigate(-1)} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                    <ArrowLeft size={18} />
                </GlassButton>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {name}
                    </h1>
                    <span className="text-white/50 text-xs uppercase tracking-wider font-bold">Motor Owner Profile</span>
                </div>
            </div>

            {/* TOP METRICS & INFO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="md:col-span-2 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4 text-gray-400 border-b border-white/5 pb-2">
                        <User size={16} className="text-blue-400" />
                        <h2 className="text-xs font-bold uppercase tracking-widest">Business Information</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Owner Name</div>
                            <div className="text-lg font-medium text-white">{owner?.name}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Number</div>
                            <div className="text-lg font-medium text-white flex items-center gap-2">
                                <Phone size={14} className="text-gray-500" />
                                {owner?.mobile || "N/A"}
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 flex flex-col justify-center items-center text-center bg-rose-500/5 border-rose-500/10">
                    <div className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mb-2">Total Trips</div>
                    <div className="text-4xl font-black text-white">{trips.length}</div>
                    <div className="text-xs text-white/40 mt-1">Associated Trips</div>
                </GlassCard>
            </div>

            {/* TRIPS LIST */}
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Truck size={14} className="text-blue-400" /> Trip History
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                                <th className="p-4">Date</th>
                                <th className="p-4">Trip Code</th>
                                <th className="p-4">Route</th>
                                <th className="p-4">Vehicle</th>
                                <th className="p-4 text-right">Freight</th>
                                <th className="p-4 text-right">Balance</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300">
                            {trips.length === 0 ? (
                                <tr><td colSpan="7" className="p-12 text-center text-gray-500 italic">No movement recorded for this owner.</td></tr>
                            ) : (
                                trips.map(t => (
                                    <tr key={t.id} className="hover:bg-white/5 cursor-pointer transition-colors group" onClick={() => navigate(`/trips/${t.id}`)}>
                                        <td className="p-4 whitespace-nowrap text-white/60">{new Date(t.loading_date).toLocaleDateString("en-GB")}</td>
                                        <td className="p-4 font-bold text-blue-400 group-hover:underline">{t.trip_code || t.id}</td>
                                        <td className="p-4 flex items-center gap-1">
                                            <span className="text-white">{t.from_location}</span>
                                            <span className="text-white/30">→</span>
                                            <span className="text-white">{t.to_location}</span>
                                        </td>
                                        <td className="p-4 font-mono text-xs bg-white/5 rounded w-fit px-2">{t.vehicle_number}</td>
                                        <td className="p-4 text-right text-white font-medium">₹{formatCurrency(t.gaadi_freight)}</td>
                                        <td className="p-4 text-right font-bold text-rose-400">₹{formatCurrency(t.gaadi_balance)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${t.gaadi_balance_status === 'PAID'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                {t.gaadi_balance_status || 'UNPAID'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
