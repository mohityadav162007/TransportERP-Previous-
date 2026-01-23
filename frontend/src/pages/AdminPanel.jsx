import { useState, useEffect } from "react";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";
import { UserPlus, Users, Shield, Mail, Calendar, AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react";

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
        <div className="space-y-8 animate-in fade-in duration-500 text-white max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Shield className="text-blue-500" /> Admin User Management
                </h1>
                <p className="text-white/50">Manage system access and create new administrative or standard users.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Form */}
                <div className="lg:col-span-1">
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                            <UserPlus size={20} className="text-blue-400" />
                            <h2 className="text-lg font-bold text-white">Add New User</h2>
                        </div>

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
                            <GlassInput
                                label="Email Address"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@transport.com"
                                icon={<Mail size={16} />}
                            />

                            <GlassInput
                                label="Password"
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<Lock size={16} />}
                            />

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">User Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="glass-input [&>option]:text-black"
                                >
                                    <option value="user">Standard User</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            <GlassButton
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                                className="w-full justify-center"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create User"
                                )}
                            </GlassButton>
                        </form>
                    </GlassCard>
                </div>

                {/* Users List */}
                <div className="lg:col-span-2">
                    <GlassCard className="p-0 overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={20} className="text-blue-400" />
                                <h2 className="text-lg font-bold text-white">Existing Users</h2>
                            </div>
                            <span className="text-xs font-bold text-blue-300 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                                {users.length} Total
                            </span>
                        </div>

                        <div className="flex-grow">
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
                                            <tr className="bg-white/5 border-b border-white/5">
                                                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">User Account</th>
                                                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Access Level</th>
                                                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {users.map((u) => (
                                                <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs ring-2 ring-blue-500/20">
                                                                {u.email[0].toUpperCase()}
                                                            </div>
                                                            <span className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">{u.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${u.role === 'admin'
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            }`}>
                                                            {u.role === 'admin' && <Shield size={10} className="mr-1" />}
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
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
                    </GlassCard>

                    <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-3">
                        <Lock size={16} className="text-blue-400 mt-0.5" />
                        <p className="text-xs text-blue-300/80 leading-relaxed">
                            <b>Security Note:</b> Passwords are never stored in plain text and are not viewable by administrators.
                            Users created here can sign in immediately using their email and password.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
