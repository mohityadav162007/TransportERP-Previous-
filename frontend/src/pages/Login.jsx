import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GlassBox from "../components/GlassBox";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await login(email, password);
        if (result.success) {
            navigate("/");
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6">
            <div className="max-w-md w-full">
                <GlassBox>
                    <div className="p-4">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white tracking-tight">Transport ERP</h1>
                            <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-medium">Enterprise Management</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all placeholder-gray-600"
                                    placeholder="admin@transport.com"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all placeholder-gray-600"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest"
                            >
                                Sign In
                            </button>
                        </form>
                    </div>
                </GlassBox>

                <div className="text-center mt-8 text-gray-500 text-xs">
                    &copy; 2026 Transport ERP System. All rights reserved.
                </div>
            </div>
        </div>
    );
}
