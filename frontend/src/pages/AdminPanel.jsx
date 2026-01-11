import { useState, useEffect } from "react";
import api from "../services/api";
import GlassBox from "../components/GlassBox";
import { UserPlus, Users, Shield, Mail, Calendar, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/users");
            setUsers(response.data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load users list.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            await api.post("/admin/users", { email, password, role });
            setSuccess(`User ${email} created successfully!`);
            setEmail("");
            setPassword("");
            setRole("user");
            fetchUsers();
        } catch (err) {
            console.error("Error creating user:", err);
            setError(err.response?.data?.error || "Failed to create user.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Shield className="text-blue-500" /> Admin User Management
                </h1>
                <p className="text-gray-400">Manage system access and create new administrative or standard users.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Form */}
                <div className="lg:col-span-1">
                    <GlassBox>
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <UserPlus size={20} className="text-blue-400" /> Add New User
                            </h2>

                            {error && (
                                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm flex items-center gap-3">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-center gap-3">
                                    <CheckCircle2 size={18} />
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all text-sm"
                                            placeholder="user@transport.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">User Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="user" className="bg-[#1a1a1a]">Standard User</option>
                                        <option value="admin" className="bg-[#1a1a1a]">Administrator</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create User"
                                    )}
                                </button>
                            </form>
                        </div>
                    </GlassBox>
                </div>

                {/* Users List */}
                <div className="lg:col-span-2">
                    <GlassBox>
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Users size={20} className="text-blue-400" /> Existing Users
                                </span>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter bg-white/5 px-2 py-1 rounded">
                                    {users.length} Total
                                </span>
                            </h2>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
                                    <Loader2 size={40} className="animate-spin text-blue-500" />
                                    <p className="text-sm font-medium animate-pulse">Fetching system users...</p>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-20 text-gray-500">
                                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No users found in the system.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="pb-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">User Account</th>
                                                <th className="pb-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Access Level</th>
                                                <th className="pb-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {users.map((u) => (
                                                <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                                                                {u.email[0].toUpperCase()}
                                                            </div>
                                                            <span className="text-sm text-gray-200 font-medium">{u.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${u.role === 'admin'
                                                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                            }`}>
                                                            {u.role === 'admin' && <Shield size={10} className="mr-1" />}
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs text-gray-300">
                                                                {new Date(u.created_at).toLocaleDateString('en-IN', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                                <Calendar size={10} /> {new Date(u.created_at).toLocaleTimeString('en-IN', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </GlassBox>

                    <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <p className="text-[11px] text-blue-400/80 leading-relaxed italic">
                            <b>Security Note:</b> Passwords are never stored in plain text and are not viewable by administrators.
                            Users created here can sign in immediately using their email and password.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
