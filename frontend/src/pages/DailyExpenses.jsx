import { useEffect, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/format";

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
                await api.put(`/expenses/${EditingId}`, form);
            } else {
                await api.post("/expenses", form);
            }

            // Reset form
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
            date: ex.date.split('T')[0], // Ensure date format matches input
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



    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Daily Expenses</h1>

            {/* ADD / EDIT FORM */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="font-semibold mb-4">{editingId ? "Edit Expense" : "Add New Expense"}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                        <input type="date" name="date" required value={form.date} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Category</label>
                        <input name="category" required placeholder="Fuel, Repair, etc." value={form.category} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Amount</label>
                        <input type="number" name="amount" required placeholder="0.00" value={form.amount} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Vehicle (Opt)</label>
                        <input name="vehicle_number" placeholder="Vehicle No." value={form.vehicle_number} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
                                {editingId ? "Update" : "Add"}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-400">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>
                <div className="mt-3">
                    <input name="notes" placeholder="Additional Notes..." value={form.notes} onChange={handleChange} className="input w-full" />
                </div>
            </div>

            {/* LIST */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Vehicle</th>
                            <th className="p-3">Notes</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {expenses.map(ex => (
                            <tr key={ex.id} className="hover:bg-gray-50">
                                <td className="p-3">{new Date(ex.date).toLocaleDateString()}</td>
                                <td className="p-3 font-medium">{ex.category}</td>
                                <td className="p-3">{ex.vehicle_number || "-"}</td>
                                <td className="p-3 text-gray-500">{ex.notes}</td>
                                <td className="p-3 text-right font-bold">₹{formatCurrency(ex.amount)}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => handleEdit(ex)} className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-600 px-2 py-1 rounded">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
