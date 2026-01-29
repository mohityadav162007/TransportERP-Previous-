import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Truck, Calendar, MapPin, Download, ExternalLink } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/format';
import GlassCard from './GlassCard';
import { MODAL_BACKDROP, MODAL_CONTENT } from '../styles/animations';

export default function PodDetailsModal({ trip, onClose }) {
    const [activeTab, setActiveTab] = useState('DETAILS'); // DETAILS | PODS | SLIPS

    if (!trip) return null;

    return (
        <AnimatePresence>
            <motion.div
                variants={MODAL_BACKDROP}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    variants={MODAL_CONTENT}
                    className="bg-[#1a1f2e] text-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="text-blue-400" /> POD Details
                                <span className="text-sm bg-white/10 px-2 py-0.5 rounded text-white/70 ml-2 font-mono">{trip.trip_code}</span>
                            </h2>
                            <p className="text-xs text-white/50 mt-1">
                                {trip.from_location} <span className="text-white/30">→</span> {trip.to_location}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="flex border-b border-white/5 bg-black/20 px-6 pt-4 gap-4">
                        {['DETAILS', 'PODS', 'SLIPS'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-white/40 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-grow overflow-y-auto p-6 bg-[#131620]">

                        {/* TAB: DETAILS */}
                        {activeTab === 'DETAILS' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Basic Trip Info */}
                                <GlassCard className="space-y-4 p-5">
                                    <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">Trip Information</h3>
                                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                                        <div>
                                            <label className="block text-[10px] text-white/40 uppercase">Load Date</label>
                                            <div className="font-medium">{formatDate(trip.loading_date)}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-white/40 uppercase">Vehicle No</label>
                                            <div className="font-bold text-yellow-400/90">{trip.vehicle_number}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-white/40 uppercase">LR Number</label>
                                            <div className="font-mono text-white/80">{trip.lr_number || '-'}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-white/40 uppercase">Weight</label>
                                            <div className="font-mono text-white/80">{trip.weight || '-'}</div>
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* Party & Owner */}
                                <GlassCard className="space-y-4 p-5">
                                    <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-4">Parties Involved</h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <label className="block text-[10px] text-white/40 uppercase">Party Name</label>
                                            <div className="font-bold text-white">{trip.party_name}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-white/40 uppercase">Motor Owner</label>
                                            <div className="font-medium text-white/80">{trip.motor_owner_name}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-white/40 uppercase">Driver Info</label>
                                            <div className="text-white/60 text-xs">{trip.driver_name} ({trip.driver_number})</div>
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* Delivery & POD Status */}
                                <GlassCard className="space-y-4 p-5 md:col-span-2 bg-gradient-to-br from-white/5 to-transparent">
                                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4">Delivery & POD Status</h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <StatusBadge label="Docket No" value={trip.docket_no || 'Not Assigned'} color={trip.docket_no ? 'blue' : 'gray'} />
                                        <StatusBadge label="Courier Status" value={trip.courier_status || 'Pending'} color={trip.courier_status === 'Sent' ? 'amber' : 'gray'} />
                                        <StatusBadge label="POD Received" value={trip.pod_status || 'PENDING'} color={trip.pod_status === 'RECEIVED' ? 'emerald' : 'rose'} />
                                        <StatusBadge label="Unloading Amt" value={trip.unloading_amount ? formatCurrency(trip.unloading_amount) : '-'} color="white" />
                                    </div>

                                    {trip.pod_received_date && (
                                        <div className="text-xs text-white/30 text-right mt-2">
                                            POD Received on: {formatDate(trip.pod_received_date)}
                                        </div>
                                    )}

                                    {trip.remark && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <label className="block text-[10px] text-white/40 uppercase mb-1">Remarks</label>
                                            <p className="text-sm text-white/70 italic">"{trip.remark}"</p>
                                        </div>
                                    )}
                                </GlassCard>

                            </div>
                        )}

                        {/* TAB: PODS */}
                        {activeTab === 'PODS' && (
                            <div className="space-y-4">
                                {(!trip.pod_path || trip.pod_path === '[]' || trip.pod_path.length === 0) ? (
                                    <div className="h-40 flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/10 rounded-xl">
                                        <FileText size={32} className="mb-2 opacity-50" />
                                        <span>No POD documents uploaded yet.</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Handle both stringified array or legacy string */}
                                        {(() => {
                                            let images = [];
                                            try {
                                                // Try parsing if it's a string, else use as is if array
                                                const raw = trip.pod_path;
                                                if (Array.isArray(raw)) images = raw;
                                                else if (raw.startsWith('[')) images = JSON.parse(raw);
                                                else images = raw.split(',').filter(Boolean);
                                            } catch (e) { images = [trip.pod_path] }

                                            return images.map((url, idx) => (
                                                <div key={idx} className="group relative aspect-[3/4] bg-black rounded-lg overflow-hidden border border-white/20">
                                                    <img src={url} alt={`POD ${idx + 1}`} className="w-full h-full object-contain" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" title="View Full">
                                                            <ExternalLink size={20} />
                                                        </a>
                                                        <a href={url} download className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" title="Download">
                                                            <Download size={20} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: SLIPS */}
                        {activeTab === 'SLIPS' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white text-black p-4 rounded-lg min-h-[300px] flex items-center justify-center text-center">
                                    <div>
                                        <div className="font-bold text-lg mb-2">Loading Slip</div>
                                        <div className="text-sm text-gray-500">{trip.loading_slip_number || "Not generated"}</div>
                                    </div>
                                </div>
                                <div className="bg-white text-black p-4 rounded-lg min-h-[300px] flex items-center justify-center text-center">
                                    <div>
                                        <div className="font-bold text-lg mb-2">Pay Slip</div>
                                        <div className="text-sm text-gray-500">{trip.pay_slip_number || "Not generated"}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="p-4 border-t border-white/10 bg-black/20 text-right">
                        <button onClick={onClose} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-bold">Close</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function StatusBadge({ label, value, color }) {
    const colors = {
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        gray: 'bg-white/5 text-white/40 border-white/10',
        white: 'bg-white/10 text-white border-white/20'
    };

    return (
        <div className={`flex flex-col p-3 rounded-lg border ${colors[color] || colors.gray}`}>
            <span className="text-[10px] uppercase font-bold opacity-70 mb-1">{label}</span>
            <span className="text-sm font-bold truncate">{value}</span>
        </div>
    );
}
