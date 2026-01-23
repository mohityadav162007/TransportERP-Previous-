import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";
import { ArrowRight, AlertCircle, Truck } from "lucide-react";

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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
            {/* Decorative Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 mb-4 border border-white/10 shadow-xl backdrop-blur-sm">
                        <Truck size={40} className="text-white drop-shadow-lg" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2 text-gradient">Transport ERP</h1>
                    <p className="text-white/50 text-sm uppercase tracking-widest font-medium">Enterprise Management System</p>
                </div>

                <GlassCard className="p-8 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-sm flex items-center gap-3 animate-spring">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <GlassInput
                            label="Email Address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@transport.com"
                        />

                        <GlassInput
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />

                        <GlassButton
                            type="submit"
                            variant="primary"
                            className="w-full justify-center py-3 text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20"
                        >
                            Sign In <ArrowRight size={16} />
                        </GlassButton>
                    </form>
                </GlassCard>

                <div className="text-center mt-8 text-white/30 text-xs">
                    &copy; 2026 Transport ERP System. All rights reserved.
                </div>
            </div>
        </div>
    );
}
