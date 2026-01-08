import { useEffect, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/format";
import GlassBox from "../components/GlassBox";

export default function DailyExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        category: "",
        amount: "",
        vehicle_number: "",
        notes: ""
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = () => {
        api.get("/expenses")
            .then(res => setExpenses(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/expenses/${editingId}`, form);
            } else {
                await api.post("/expenses", form);
            }

            setForm({
                date: new Date().toISOString().split('T')[0],
                category: "",
                amount: "",
                vehicle_number: "",
                notes: ""
            });
            setEditingId(null);
            fetchExpenses();
        } catch (err) {
            alert("Failed to save expense");
        }
    };

    const handleEdit = (ex) => {
        setEditingId(ex.id);
        setForm({
            date: ex.date.split('T')[0],
            category: ex.category,
            amount: ex.amount,
            vehicle_number: ex.vehicle_number || "",
            notes: ex.notes || ""
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm({
            date: new Date().toISOString().split('T')[0],
            category: "",
            amount: "",
            vehicle_number: "",
            notes: ""
        });
    };

    if (loading) return <div className="text-white p-8 italic">Loading expenses...</div>;

    return (
        <div className="space-y-8 text-white">
            <h1 className="text-2xl font-bold">Daily Expenses</h1>

            {/* ADD / EDIT FORM */}
            <GlassBox>
                <div className="p-4">
                    <h2 className="font-semibold mb-4 text-gray-300">{editingId ? "Edit Expense" : "Add New Expense"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                                <input type="date" name="date" required value={form.date} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                                <input name="category" required placeholder="Fuel, Repair, etc." value={form.category} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                    <input type="number" step="0.01" name="amount" required placeholder="0.00" value={form.amount} onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vehicle (Opt)</label>
                                <input name="vehicle_number" placeholder="Vehicle No." value={form.vehicle_number} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="md:col-span-4 space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notes</label>
                                <input name="notes" placeholder="Additional Notes..." value={form.notes} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all font-medium">
                                        {editingId ? "Update" : "Add Expense"}
                                    </button>
                                    {editingId && (
                                        <button type="button" onClick={handleCancel} className="bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-all">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </GlassBox>

            {/* LIST */}
            <GlassBox>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-white/10">
                            <tr className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                                <th className="p-4">Date</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Vehicle</th>
                                <th className="p-4">Notes</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300">
                            {expenses.map(ex => (
                                <tr key={ex.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">{new Date(ex.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-medium text-white">{ex.category}</td>
                                    <td className="p-4">{ex.vehicle_number || "-"}</td>
                                    <td className="p-4 text-gray-400 italic">{ex.notes}</td>
                                    <td className="p-4 text-right font-bold text-white">₹{formatCurrency(ex.amount)}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleEdit(ex)} className="text-blue-400 hover:text-blue-300 font-medium text-xs border border-blue-400/30 px-3 py-1 rounded-full transition-all">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassBox>
        </div>
    );
}
