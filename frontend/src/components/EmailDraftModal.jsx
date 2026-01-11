import { useState } from "react";
import api from "../services/api";
import { X, Sparkles, Send, Loader2 } from "lucide-react";
import GlassBox from "./GlassBox";

export default function EmailDraftModal({ tripId, onClose }) {
    const [reason, setReason] = useState("");
    const [lrNumber, setLrNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/admin/email/draft", {
                trip_id: tripId,
                reason,
                lr_number: lrNumber
            });

            const { subject, body } = response.data;

            // Construct Gmail URL
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            // Open Gmail
            window.open(gmailUrl, "_blank");

            // Close modal
            onClose();
        } catch (err) {
            console.error("Failed to draft email:", err);
            setError(err.response?.data?.error || "Failed to generate email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg">
                <GlassBox>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="text-blue-400" size={20} /> AI Email Assistant
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Reason for Email
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g., Payment reminder bhejo, 30 days overdue hai."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all text-sm placeholder-gray-600 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    LR Number <span className="text-gray-600 normal-case">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={lrNumber}
                                    onChange={(e) => setLrNumber(e.target.value)}
                                    placeholder="LR-12345"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all text-sm placeholder-gray-600"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Generating Draft...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Open in Gmail
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-[10px] text-center text-gray-500 mt-4">
                                Powered by OpenAI. The draft will open in your Gmail compose window for review.
                            </p>
                        </form>
                    </div>
                </GlassBox>
            </div>
        </div>
    );
}
