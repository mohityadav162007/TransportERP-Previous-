import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../services/api';
import PaySlip from './PaySlip';
import LoadingSlip from './LoadingSlip';
import GlassButton from '../GlassButton';
import { X, Printer, Layout, ArrowRight } from 'lucide-react';
import '../../styles/print.css';

export default function PrintModal({ trip, onClose }) {
    const [step, setStep] = useState('SELECT'); // SELECT | PREVIEW
    const [leftType, setLeftType] = useState(null); // 'pay_slip' | 'loading_slip' | null
    const [rightType, setRightType] = useState(null);
    const [previewData, setPreviewData] = useState({ ...trip });
    const [slipNumbers, setSlipNumbers] = useState({ pay: null, loading: null });
    const [generating, setGenerating] = useState(false);

    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Slip_${trip.trip_code}`,
        onAfterPrint: onClose
    });

    const generateNumbers = async () => {
        setGenerating(true);
        const types = [];
        if (leftType === 'pay_slip' || rightType === 'pay_slip') types.push('pay_slip');
        if (leftType === 'loading_slip' || rightType === 'loading_slip') types.push('loading_slip');

        if (types.length === 0) {
            setStep('PREVIEW');
            setGenerating(false);
            return;
        }

        try {
            const res = await api.post(`/trips/${trip.id}/print-metadata`, { types });
            setSlipNumbers({
                pay: res.data.pay_slip_number,
                loading: res.data.loading_slip_number
            });
            setStep('PREVIEW');
        } catch (err) {
            console.error("Error generating numbers:", err);
            alert("Failed to generate slip numbers");
        } finally {
            setGenerating(false);
        }
    };

    const renderSlip = (type) => {
        if (type === 'pay_slip') return <PaySlip data={previewData} slipNumber={slipNumbers.pay} />;
        if (type === 'loading_slip') return <LoadingSlip data={previewData} slipNumber={slipNumbers.loading} />;
        return <div className="flex items-center justify-center h-full text-gray-300 font-bold bg-gray-50 uppercase tracking-widest text-sm border border-dashed border-gray-300 m-4 rounded">Blank Page</div>;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1f2e] text-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Printer className="text-blue-400" /> Print Manager
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6">

                    {step === 'SELECT' && (
                        <div className="grid grid-cols-2 gap-12 h-full items-center max-w-4xl mx-auto">

                            {/* Left Page Selector */}
                            <div className="space-y-4 text-center">
                                <div className="text-sm font-bold uppercase tracking-widest text-blue-300 mb-4">Left Side Page</div>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => setLeftType('pay_slip')}
                                        className={`p-6 rounded-xl border-2 transition-all ${leftType === 'pay_slip' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                                    >
                                        <div className="font-bold text-lg">Pay Slip</div>
                                        <div className="text-xs text-white/50 mt-1">Driver & Freight Details</div>
                                    </button>
                                    <button
                                        onClick={() => setLeftType('loading_slip')}
                                        className={`p-6 rounded-xl border-2 transition-all ${leftType === 'loading_slip' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                                    >
                                        <div className="font-bold text-lg">Loading Slip</div>
                                        <div className="text-xs text-white/50 mt-1">Party & Load Details</div>
                                    </button>
                                    <button
                                        onClick={() => setLeftType(null)}
                                        className={`p-4 rounded-xl border border-dashed border-white/20 hover:bg-white/5 text-sm ${leftType === null ? 'bg-white/5 opacity-50' : ''}`}
                                    >
                                        Leave Blank
                                    </button>
                                </div>
                            </div>

                            {/* Right Page Selector */}
                            <div className="space-y-4 text-center">
                                <div className="text-sm font-bold uppercase tracking-widest text-blue-300 mb-4">Right Side Page</div>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => setRightType('pay_slip')}
                                        className={`p-6 rounded-xl border-2 transition-all ${rightType === 'pay_slip' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                                    >
                                        <div className="font-bold text-lg">Pay Slip</div>
                                        <div className="text-xs text-white/50 mt-1">Driver & Freight Details</div>
                                    </button>
                                    <button
                                        onClick={() => setRightType('loading_slip')}
                                        className={`p-6 rounded-xl border-2 transition-all ${rightType === 'loading_slip' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                                    >
                                        <div className="font-bold text-lg">Loading Slip</div>
                                        <div className="text-xs text-white/50 mt-1">Party & Load Details</div>
                                    </button>
                                    <button
                                        onClick={() => setRightType(null)}
                                        className={`p-4 rounded-xl border border-dashed border-white/20 hover:bg-white/5 text-sm ${rightType === null ? 'bg-white/5 opacity-50' : ''}`}
                                    >
                                        Leave Blank
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}

                    {step === 'PREVIEW' && (
                        <div className="flex flex-col gap-6">
                            {/* Editor Bar */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-white/50 uppercase ml-1">Party Name (Edit for Print)</label>
                                    <input
                                        value={previewData.party_name || ''}
                                        onChange={e => setPreviewData({ ...previewData, party_name: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white/50 uppercase ml-1">Vehicle (Edit for Print)</label>
                                    <input
                                        value={previewData.vehicle_number || ''}
                                        onChange={e => setPreviewData({ ...previewData, vehicle_number: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white/50 uppercase ml-1">Note</label>
                                    <div className="text-xs text-orange-400 mt-1">Edits here apply to THIS print only. Actual trip data is unchanged.</div>
                                </div>
                            </div>

                            {/* A4 Preview Container */}
                            <div className="overflow-auto bg-gray-500 p-8 rounded-xl flex justify-center">
                                <div
                                    ref={componentRef}
                                    className="print-container shadow-2xl bg-white"
                                    style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }} // Scale for preview visibility
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
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between items-center">
                    {step === 'SELECT' ? (
                        <>
                            <div className="text-sm text-white/50">Select what to print on each half of the page.</div>
                            <div className="flex gap-4">
                                <button onClick={onClose} className="px-6 py-2 rounded-lg text-white/70 hover:bg-white/10 transition-colors bg-transparent border border-white/10">Cancel</button>
                                <GlassButton
                                    variant="primary"
                                    onClick={generateNumbers}
                                    className="px-8"
                                    disabled={generating || (!leftType && !rightType)}
                                >
                                    {generating ? 'Generating...' : <><Layout size={18} /> Generate Preview</>}
                                </GlassButton>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setStep('SELECT')} className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                                    Change Selection
                                </button>
                                <span className="text-white/30">|</span>
                                <div className="text-sm text-white/50">Verify layout before printing. Scale is fixed at 100%.</div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={onClose} className="px-6 py-2 rounded-lg text-white/70 hover:bg-white/10 transition-colors bg-transparent border border-white/10">Cancel</button>
                                <GlassButton variant="primary" onClick={handlePrint} className="px-8">
                                    <Printer size={18} /> Print Now
                                </GlassButton>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
