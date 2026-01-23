import { useEffect, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/format";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";
import GlassTable from "../components/GlassTable";
import Skeleton from "../components/Skeleton";
import { Receipt, Plus, Edit2, RotateCcw } from "lucide-react";

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

    if (loading) {
        return (
            <div className="space-y-8 max-w-5xl mx-auto">
                <Skeleton height="300px" className="glass-panel" />
                <Skeleton height="400px" className="glass-panel" />
            </div>
        );
    }

    const columns = [
        { header: "Date", accessor: "date", render: (row) => new Date(row.date).toLocaleDateString() },
        { header: "Category", accessor: "category", render: (row) => <span className="font-medium text-white">{row.category}</span> },
        { header: "Vehicle", accessor: "vehicle_number", render: (row) => row.vehicle_number || <span className="text-white/30">-</span> },
        { header: "Notes", accessor: "notes", render: (row) => <span className="italic text-white/50">{row.notes || "-"}</span> },
        { header: "Amount", accessor: "amount", render: (row) => <span className="font-bold text-white">₹{formatCurrency(row.amount)}</span> },
        {
            header: "Actions",
            accessor: "actions",
            render: (row) => (
                <button
                    onClick={() => handleEdit(row)}
                    className="p-2 hover:bg-white/10 rounded-full text-blue-400 hover:text-white transition-colors"
                >
                    <Edit2 size={16} />
                </button>
            )
        },
    ];

    return (
        <div className="space-y-8 text-white max-w-5xl mx-auto pb-20">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Receipt className="text-blue-400" /> Daily Expenses
            </h1>

            {/* ADD / EDIT FORM */}
            <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                    <Plus size={18} className="text-blue-400" />
                    <h2 className="font-semibold text-white uppercase tracking-wider text-sm">{editingId ? "Edit Expense" : "Add New Expense"}</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <GlassInput label="Date" type="date" name="date" required value={form.date} onChange={handleChange} />
                        <GlassInput label="Category" name="category" required placeholder="Fuel, Repair..." value={form.category} onChange={handleChange} />
                        <GlassInput label="Amount (₹)" type="number" step="0.01" name="amount" required placeholder="0.00" value={form.amount} onChange={handleChange} />
                        <GlassInput label="Vehicle (Optional)" name="vehicle_number" placeholder="Vehicle No." value={form.vehicle_number} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                        <div className="md:col-span-4">
                            <GlassInput label="Notes" name="notes" placeholder="Additional Notes..." value={form.notes} onChange={handleChange} />
                        </div>
                        <div className="flex gap-2">
                            <GlassButton type="submit" variant="primary" className="w-full justify-center">
                                {editingId ? "Update" : "Add Expense"}
                            </GlassButton>
                            {editingId && (
                                <GlassButton type="button" onClick={handleCancel} variant="secondary">
                                    <RotateCcw size={18} />
                                </GlassButton>
                            )}
                        </div>
                    </div>
                </form>
            </GlassCard>

            {/* LIST */}
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5">
                    <h2 className="font-semibold text-white uppercase tracking-wider text-xs">Expense History</h2>
                </div>
                <GlassTable
                    columns={columns}
                    data={expenses}
                />
            </GlassCard>
        </div>
    );
}
