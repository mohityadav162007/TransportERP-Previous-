import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { MODAL_BACKDROP, MODAL_CONTENT } from '../../styles/animations';
import api from '../../services/api';
import PaySlip from './PaySlip';
import LoadingSlip from './LoadingSlip';
import GlassButton from '../GlassButton';
import { X, Printer, Layout, RefreshCw, FileText } from 'lucide-react';
import '../../styles/print.css';

export default function PrintModal({ trip, onClose }) {
    // Default to strict print layout
    const [leftType, setLeftType] = useState('loading_slip');
    const [rightType, setRightType] = useState('pay_slip');

    // Preview Data (Editable)
    const [previewData, setPreviewData] = useState({ ...trip });

    // Slip Numbers
    const [slipNumbers, setSlipNumbers] = useState({
        pay: trip.pay_slip_number || "PREVIEW",
        loading: trip.loading_slip_number || "PREVIEW"
    });

    const [generating, setGenerating] = useState(false);
    const componentRef = useRef();

    // On mount, if numbers exist, use them. If not, they remain "PREVIEW" until user clicks "Generate" or "Print".
    // Or we could auto-fetch if we wanted to be aggressive, but "PREVIEW" is safer for "No number burning".

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Slip_${trip.trip_code}`,
        onAfterPrint: onClose
    });

    const generateNumbers = async () => {
        if (generating) return;
        setGenerating(true);

        // Only request numbers for active slips
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
            setSlipNumbers({
                pay: res.data.pay_slip_number || slipNumbers.pay,
                loading: res.data.loading_slip_number || slipNumbers.loading
            });
            return true; // Success
        } catch (err) {
            console.error("Error generating numbers:", err);
            alert("Failed to generate slip numbers");
            return false;
        } finally {
            setGenerating(false);
        }
    };

    const handlePrintClick = async () => {
        // If numbers are still "PREVIEW", try to generate them first
        if (slipNumbers.pay === "PREVIEW" || slipNumbers.loading === "PREVIEW") {
            const success = await generateNumbers();
            if (success) {
                // Wait a microtask for state update to reflect in DOM before printing?
                // React state updates might be async. 
                // However, handlePrint reads componentRef.current.
                // We might need a small timeout or assume the user will see the number update and click print again?
                // Better: Use a dedicated 'ready to print' effect or just force user to generate first?
                // Let's try to proceed. 'react-to-print' might capture the PREVIOUS render if we are not careful.
                // Safest UX: Generate, then user clicks Print again? Or auto-print after generate?

                // Let's trigger the print dialog after a slight delay to allow render
                setTimeout(handlePrint, 500);
            }
        } else {
            handlePrint();
        }
    };

    const renderSlip = (type) => {
        const numMap = { 'pay_slip': slipNumbers.pay, 'loading_slip': slipNumbers.loading };
        const num = numMap[type] || "";

        if (type === 'pay_slip') return <PaySlip data={previewData} slipNumber={num} />;
        if (type === 'loading_slip') return <LoadingSlip data={previewData} slipNumber={num} />;
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 font-bold bg-gray-50 uppercase tracking-widest text-sm border-2 border-dashed border-gray-200 m-4 rounded-xl">
                <FileText size={32} className="mb-2 opacity-50" />
                <span>Blank Page</span>
            </div>
        );
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
                className="bg-[#1a1f2e] text-white rounded-xl shadow-2xl w-full max-w-[90vw] h-[90vh] flex overflow-hidden border border-white/10"
            >

                {/* LEFT SIDEBAR - CONTROLS */}
                <div className="w-[350px] flex-shrink-0 flex flex-col border-r border-white/5 bg-black/20">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <Printer className="text-blue-400" /> Print Manager
                        </h2>
                        <p className="text-xs text-white/50">Configure & Print Slips</p>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 space-y-8">

                        {/* Page Layout */}
                        <div className="space-y-4">
                            <div className="text-xs font-bold uppercase tracking-widest text-blue-300">Page Layout</div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-white/50 mb-2 block">Left Half</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['loading_slip', 'pay_slip'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setLeftType(type)}
                                                className={`px-4 py-3 rounded-lg text-left text-sm transition-all border ${leftType === type ? 'bg-blue-600 border-blue-500 font-bold shadow-lg shadow-blue-900/20' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'}`}
                                            >
                                                {type.replace('_', ' ').toUpperCase()}
                                            </button>
                                        ))}
                                        <button onClick={() => setLeftType(null)} className={`px-4 py-2 rounded-lg text-left text-xs ${!leftType ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'}`}>Blank</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-white/50 mb-2 block">Right Half</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['pay_slip', 'loading_slip'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setRightType(type)}
                                                className={`px-4 py-3 rounded-lg text-left text-sm transition-all border ${rightType === type ? 'bg-blue-600 border-blue-500 font-bold shadow-lg shadow-blue-900/20' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'}`}
                                            >
                                                {type.replace('_', ' ').toUpperCase()}
                                            </button>
                                        ))}
                                        <button onClick={() => setRightType(null)} className={`px-4 py-2 rounded-lg text-left text-xs ${!rightType ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'}`}>Blank</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Edits */}
                        <div className="space-y-4">
                            <div className="text-xs font-bold uppercase tracking-widest text-blue-300">Quick Edit</div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase font-bold">Party Name</label>
                                    <input
                                        type="text"
                                        value={previewData.party_name || ''}
                                        onChange={e => setPreviewData({ ...previewData, party_name: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase font-bold">Vehicle No</label>
                                    <input
                                        type="text"
                                        value={previewData.vehicle_number || ''}
                                        onChange={e => setPreviewData({ ...previewData, vehicle_number: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="p-6 border-t border-white/5 bg-black/20">
                        <div className="flex justify-between text-xs mb-4">
                            <span className="text-white/50">Slip Numbers:</span>
                            <span className={slipNumbers.loading === 'PREVIEW' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                                {slipNumbers.loading === 'PREVIEW' ? 'Pending Generation' : 'Assigned'}
                            </span>
                        </div>
                        <div className="grid gap-3">
                            {(slipNumbers.loading === 'PREVIEW' && slipNumbers.pay === 'PREVIEW') && (
                                <GlassButton
                                    variant="secondary"
                                    className="w-full justify-center"
                                    onClick={generateNumbers}
                                    disabled={generating}
                                >
                                    {generating ? 'Generating...' : <><RefreshCw size={14} /> Generate Numbers</>}
                                </GlassButton>
                            )}

                            <GlassButton
                                variant="primary"
                                className="w-full justify-center py-3 text-base"
                                onClick={handlePrintClick}
                            >
                                <Printer size={18} /> Print Now
                            </GlassButton>
                        </div>
                        <button onClick={onClose} className="w-full text-center text-xs text-white/30 hover:text-white mt-4 transition-colors">Cancel</button>
                    </div>
                </div>

                {/* RIGHT SIDE - PREVIEW */}
                <div className="flex-grow bg-[#525659] overflow-auto flex items-center justify-center p-8 relative">
                    <div className="absolute top-4 left-4 text-xs font-bold text-white/50 uppercase tracking-widest pointer-events-none">
                        Live Preview (A4 / 100%)
                    </div>

                    {/* The Print Container */}
                    <div className="shadow-2xl ring-1 ring-black/10">
                        <div
                            ref={componentRef}
                            className="print-container bg-white"
                            // No scale transform here - show 100% or scale via CSS zoom if needed for viewport fit
                            style={{
                                // Optional: Scale down if viewport is small, or strictly allow scroll
                                // For WYSIWYG, 1:1 is best, but fitting to screen is nice.
                                // Let's use a responsive scale if needed, but 'print-container' defines the A4 mm dimensions.
                            }}
                        >
                            <div className="slip-half">
                                {renderSlip(leftType)}
                            </div>
                            <div className="slip-half">
                                {renderSlip(rightType)}
                            </div>
                        </div>
                    </div>

                </div>

            </motion.div>
        </motion.div>
    );
}
