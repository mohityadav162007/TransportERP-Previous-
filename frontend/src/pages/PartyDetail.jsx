import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassBox from "../components/GlassBox";
import { formatCurrency } from "../utils/format";

export default function PartyDetail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const [party, setParty] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [name]);

    const loadData = async () => {
        try {
            const pRes = await api.get(`/masters/parties?name=${encodeURIComponent(name)}`);
            const pMatch = pRes.data.find(p => p.name.toLowerCase() === name.toLowerCase());
            setParty(pMatch || { name: name, mobile: "N/A" });

            const tRes = await api.get("/trips");
            const partyTrips = tRes.data.filter(t => t.party_name.toLowerCase() === name.toLowerCase());
            setTrips(partyTrips);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white p-8 italic">Loading details...</div>;

    return (
        <div className="space-y-6 text-white">
            {/* TOP SECTION: Summary */}
            <GlassBox>
                <div className="p-4 flex justify-between items-center text-white">
                    <div>
                        <h1 className="text-2xl font-bold">{name}</h1>
                        <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">Customer / Party</p>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold">Total Shipments: {trips.length}</div>
                    </div>
                </div>
            </GlassBox>

            {/* MIDDLE SECTION: Personal Details */}
            <GlassBox>
                <div className="p-4">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Customer Profile</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Party Name</label>
                            <div className="font-medium text-white">{party?.name}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Registered Mobile</label>
                            <div className="font-medium text-white">{party?.mobile || "-"}</div>
                        </div>
                    </div>
                </div>
            </GlassBox>

            {/* BOTTOM SECTION: Trips List */}
            <GlassBox>
                <div className="p-1">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 p-4 border-b border-white/5">Movement Ledger</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-white/10">
                                <tr className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Ref No.</th>
                                    <th className="p-4">Route</th>
                                    <th className="p-4">Vehicle</th>
                                    <th className="p-4 text-right">Freight</th>
                                    <th className="p-4 text-right">Balance</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300">
                                {trips.length === 0 ? (
                                    <tr><td colSpan="7" className="p-8 text-center text-gray-500 italic">No movement recorded for this party.</td></tr>
                                ) : (
                                    trips.map(t => (
                                        <tr key={t.id} className="hover:bg-white/5 cursor-pointer transition-colors" onClick={() => navigate(`/trips/${t.id}`)}>
                                            <td className="p-4 whitespace-nowrap">{new Date(t.loading_date).toLocaleDateString("en-GB")}</td>
                                            <td className="p-4 font-bold text-blue-400">{t.trip_code || t.id}</td>
                                            <td className="p-4">{t.from_location} → {t.to_location}</td>
                                            <td className="p-4 font-medium">{t.vehicle_number}</td>
                                            <td className="p-4 text-right text-white">₹{formatCurrency(t.party_freight)}</td>
                                            <td className="p-4 text-right font-bold text-rose-400">₹{formatCurrency(t.party_balance)}</td>
                                            <td className="p-4">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${(t.party_payment_status || t.payment_status) === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                    {t.party_payment_status || t.payment_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </GlassBox>
        </div>
    );
}
