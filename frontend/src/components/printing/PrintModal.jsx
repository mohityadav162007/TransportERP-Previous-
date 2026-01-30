import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MODAL_BACKDROP, MODAL_CONTENT } from '../../styles/animations';
import api from '../../services/api';
import GlassButton from '../GlassButton';
import { X, Printer, FileText, Download, Loader2 } from 'lucide-react';
import '../../styles/print.css';

export default function PrintModal({ trip, onClose }) {
    const [leftType, setLeftType] = useState('loading_slip');
    const [rightType, setRightType] = useState('pay_slip');
    const [generating, setGenerating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);

    // Preview Data (Editable)
    const [previewData, setPreviewData] = useState({ ...trip });

    // Slip Numbers
    const [slipNumbers, setSlipNumbers] = useState({
        pay: trip.pay_slip_number || "PREVIEW",
        loading: trip.loading_slip_number || "PREVIEW"
    });

    const generateNumbers = async () => {
        if (generating) return;
        setGenerating(true);

        const types = [];
        if (leftType === 'pay_slip' || rightType === 'pay_slip') types.push('pay_slip');
        if (leftType === 'loading_slip' || rightType === 'loading_slip') types.push('loading_slip');

        if (types.length === 0) {
            alert("Please select at least one slip to generate numbers for.");
            setGenerating(false);
            return;
        }

        try {
            const res = await api.post(`/trips/${trip.id}/print-metadata`, { types });
            const newNumbers = {
                pay: res.data.pay_slip_number || slipNumbers.pay,
                loading: res.data.loading_slip_number || slipNumbers.loading
            };
            setSlipNumbers(newNumbers);
            setGenerating(false);
            return newNumbers;
        } catch (err) {
            console.error("Error generating numbers:", err);
            alert("Failed to generate slip numbers");
            setGenerating(false);
            return null;
        }
    };

    const handleGeneratePdf = async () => {
        setGenerating(true);
        try {
            // Ensure numbers are generated if not already
            let currentNumbers = slipNumbers;
            if (currentNumbers.pay === "PREVIEW" || currentNumbers.loading === "PREVIEW") {
                const result = await generateNumbers();
                if (result) currentNumbers = result;
                else {
                    setGenerating(false);
                    return;
                }
            }

            const response = await api.post('/print/generate', {
                tripData: previewData,
                options: { left: leftType, right: rightType },
                slipNumbers: currentNumbers
            }, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF");
        } finally {
            setGenerating(false);
        }
    };

    const openPdf = () => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        }
    };

    return (
        <motion.div
            variants={MODAL_BACKDROP}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
            <motion.div
                variants={MODAL_CONTENT}
                className="bg-[#1a1f2e] text-white rounded-xl shadow-2xl w-full max-w-4xl flex overflow-hidden border border-white/10"
                style={{ maxHeight: '90vh' }}
            >
                {/* SETTINGS PANEL */}
                <div className="w-1/2 p-8 border-r border-white/5 flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                            <Printer className="text-blue-400" size={28} /> Print Setup
                        </h2>
                        <p className="text-white/50 text-sm">Configure your slip layout before generating PDF.</p>
                    </div>

                    <div className="flex-grow space-y-8">
                        {/* Page Layout */}
                        <div className="space-y-4">
                            <div className="text-xs font-bold uppercase tracking-widest text-blue-300">Layout Configuration</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-white/50 mb-2 block">Left Side</label>
                                    <select
                                        value={leftType || ''}
                                        onChange={(e) => setLeftType(e.target.value || null)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Blank</option>
                                        <option value="loading_slip">Loading Slip</option>
                                        <option value="pay_slip">Pay Slip</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-white/50 mb-2 block">Right Side</label>
                                    <select
                                        value={rightType || ''}
                                        onChange={(e) => setRightType(e.target.value || null)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Blank</option>
                                        <option value="loading_slip">Loading Slip</option>
                                        <option value="pay_slip">Pay Slip</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Quick Edits */}
                        <div className="space-y-4">
                            <div className="text-xs font-bold uppercase tracking-widest text-blue-300">Data Correction</div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase font-bold">Party Name</label>
                                    <input
                                        type="text"
                                        value={previewData.party_name || ''}
                                        onChange={e => setPreviewData({ ...previewData, party_name: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase font-bold">Vehicle No</label>
                                    <input
                                        type="text"
                                        value={previewData.vehicle_number || ''}
                                        onChange={e => setPreviewData({ ...previewData, vehicle_number: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-white/50">Loading Slip No:</span>
                                <span className="font-mono">{slipNumbers.loading}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/50">Pay Slip No:</span>
                                <span className="font-mono">{slipNumbers.pay}</span>
                            </div>
                        </div>

                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                        <button onClick={onClose} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                            Cancel
                        </button>
                        <GlassButton
                            variant="primary"
                            className="flex-grow justify-center"
                            onClick={handleGeneratePdf}
                            disabled={generating}
                        >
                            {generating ? <Loader2 className="animate-spin" /> : <Printer size={18} />}
                            {generating ? 'Generating...' : (pdfUrl ? 'Regenerate PDF' : 'Generate PDF')}
                        </GlassButton>
                    </div>
                </div>

                {/* PREVIEW PANEL */}
                <div className="w-1/2 bg-[#525659] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>

                    {pdfUrl ? (
                        <div className="z-10 text-center animate-in fade-in zoom-in duration-300">
                            <div className="bg-white p-2 rounded shadow-2xl mb-6 mx-auto w-[200px] h-[280px] flex items-center justify-center text-gray-400 border-[8px] border-white ring-1 ring-black/20">
                                <FileText size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Print</h3>
                            <p className="text-white/50 text-sm mb-6">Your PDF has been generated successfully.</p>

                            <GlassButton
                                variant="secondary"
                                className="mx-auto"
                                onClick={openPdf}
                            >
                                <Download size={18} /> View Generated PDF
                            </GlassButton>
                        </div>
                    ) : (
                        <div className="z-10 text-center opacity-50">
                            <Layout size={64} className="mx-auto mb-4 text-white/30" />
                            <h3 className="text-lg font-medium text-white mb-1">No PDF Generated</h3>
                            <p className="text-xs text-white/50">Configure settings and click Generate</p>
                        </div>
                    )}
                </div>

            </motion.div>
        </motion.div>
    );
}
