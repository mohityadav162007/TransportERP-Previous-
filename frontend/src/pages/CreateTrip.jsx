import { useState, useEffect } from "react";
import { use3DNavigate } from "../hooks/use3DNavigate";
import {
  Calendar, Truck, Wallet, FileText, ChevronRight, LayoutGrid, CheckCircle, Save
} from "lucide-react";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";

export default function CreateTrip() {
  const { navigate } = use3DNavigate();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    loading_date: new Date().toISOString().split('T')[0], // Default to today
    unloading_date: "",
    route_from: "",
    route_to: "",
    vehicle_number: "",
    driver_phone: "",
    motor_owner_name: "",
    motor_owner_number: "",
    gaadi_freight: "",
    gaadi_advance: "",
    party_name: "",
    party_phone: "",
    party_freight: "",
    party_advance: "",
    tds: "",
    himmali: "",
    weight: "",
    remark: "",
    party_payment_status: "UNPAID"
  });

  const [ownVehicles, setOwnVehicles] = useState([]);
  const [isOwnVehicle, setIsOwnVehicle] = useState(false);

  useEffect(() => {
    api.get("/masters/own-vehicles")
      .then(res => setOwnVehicles(res.data))
      .catch(err => console.error("Failed to load own vehicles", err));
  }, []);

  useEffect(() => {
    if (!form.vehicle_number) { setIsOwnVehicle(false); return; }
    const cleanNumber = form.vehicle_number.replace(/\s+/g, '').toLowerCase();
    const match = ownVehicles.some(v => v.replace(/\s+/g, '').toLowerCase() === cleanNumber);
    setIsOwnVehicle(match);
  }, [form.vehicle_number, ownVehicles]);

  const handlePartyBlur = async () => {
    if (!form.party_name) return;
    try {
      const res = await api.get(`/masters/parties?name=${encodeURIComponent(form.party_name)}`);
      const match = res.data.find(p => p.name.toLowerCase() === form.party_name.toLowerCase().trim());
      if (match && match.mobile) setForm(prev => ({ ...prev, party_phone: match.mobile }));
    } catch (err) { console.error("Auto-fill party error:", err); }
  };

  const handleOwnerBlur = async () => {
    if (!form.motor_owner_name) return;
    try {
      const res = await api.get(`/masters/motor-owners?name=${encodeURIComponent(form.motor_owner_name)}`);
      const match = res.data.find(m => m.name.toLowerCase() === form.motor_owner_name.toLowerCase().trim());
      if (match && match.mobile) setForm(prev => ({ ...prev, motor_owner_number: match.mobile }));
    } catch (err) { console.error("Auto-fill owner error:", err); }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/trips", {
        ...form,
        gaadi_freight: Number(form.gaadi_freight),
        gaadi_advance: Number(form.gaadi_advance) || 0,
        party_freight: Number(form.party_freight),
        party_advance: Number(form.party_advance) || 0,
        tds: Number(form.tds) || 0,
        himmali: Number(form.himmali) || 0,
        weight: Number(form.weight) || null,
        unloading_date: form.unloading_date || null,
        driver_number: form.driver_phone || null,
        motor_owner_name: form.motor_owner_name || null,
        motor_owner_number: form.motor_owner_number || null,
        remark: form.remark || null
      });
      navigate("/trips", { direction: 'backward', transition: 'stack' });
    } catch (err) {
      console.error("CREATE TRIP ERROR:", err);
      alert(err.response?.data?.error || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  // Profit calculation for display
  const profit = isOwnVehicle
    ? (Number(form.party_freight) || 0) - (Number(form.tds) || 0)
    : (Number(form.party_freight) || 0) - (Number(form.gaadi_freight) || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 text-white min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-400">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-white">Dashboard</span>
        <ChevronRight size={14} className="mx-1" />
        <span onClick={() => navigate('/trips', { direction: 'backward' })} className="cursor-pointer hover:text-white">Trips</span>
        <ChevronRight size={14} className="mx-1" />
        <span className="font-medium text-white">Create Trip</span>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Create New Trip</h1>
        <div className="text-right">
          <div className="text-sm text-gray-400">Estimated Profit</div>
          <div className={`text-xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ₹{profit.toLocaleString()}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Route & Date */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
            <Calendar size={20} className="text-blue-400" />
            <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Dates & Route</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassInput label="Loading Date" type="date" name="loading_date" required value={form.loading_date} onChange={handleChange} />
            <GlassInput label="Unloading Date" type="date" name="unloading_date" value={form.unloading_date} onChange={handleChange} />
            <GlassInput label="Origin (From)" name="route_from" placeholder="City, Warehouse..." required value={form.route_from} onChange={handleChange} />
            <GlassInput label="Destination (To)" name="route_to" placeholder="City..." required value={form.route_to} onChange={handleChange} />
          </div>
        </GlassCard>

        {/* Section 2: Vehicle */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
            <Truck size={20} className="text-blue-400" />
            <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Vehicle & Driver Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative">
              <GlassInput label="Vehicle Number" name="vehicle_number" placeholder="MH-12-AB-1234" required value={form.vehicle_number} onChange={handleChange} />
              {isOwnVehicle && (
                <span className="absolute top-0 right-0 text-xs text-green-400 font-bold flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> Own
                </span>
              )}
            </div>
            <GlassInput label="Driver Phone" name="driver_phone" placeholder="+91..." value={form.driver_phone} onChange={handleChange} />
            {!isOwnVehicle && (
              <>
                <GlassInput label="Motor Owner Name" name="motor_owner_name" placeholder="Name" value={form.motor_owner_name} onChange={handleChange} onBlur={handleOwnerBlur} />
                <GlassInput label="Owner Phone" name="motor_owner_number" placeholder="Number" value={form.motor_owner_number} onChange={handleChange} />
              </>
            )}
            <GlassInput label="Weight (MT)" type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} />
          </div>
        </GlassCard>

        {/* Section 3: Financials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gaadi - Only if not own vehicle */}
          {!isOwnVehicle && (
            <GlassCard className="p-6 border-l-4 border-l-rose-500">
              <div className="flex items-center gap-2 mb-4 text-rose-400">
                <Wallet size={20} />
                <h2 className="font-semibold uppercase tracking-wider text-sm">Gaadi (Cost)</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <GlassInput label="Freight Check" type="number" name="gaadi_freight" value={form.gaadi_freight} onChange={handleChange} />
                <GlassInput label="Advance Paid" type="number" name="gaadi_advance" value={form.gaadi_advance} onChange={handleChange} />
              </div>
            </GlassCard>
          )}

          {/* Party - Always visible */}
          <GlassCard className={`p-6 border-l-4 border-l-blue-500 ${isOwnVehicle ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <FileText size={20} />
              <h2 className="font-semibold uppercase tracking-wider text-sm">Party (Income)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassInput label="Party Name" name="party_name" required value={form.party_name} onChange={handleChange} onBlur={handlePartyBlur} />
              <GlassInput label="Party Phone" name="party_phone" value={form.party_phone} onChange={handleChange} />
              <GlassInput label="Freight Amount" type="number" name="party_freight" value={form.party_freight} onChange={handleChange} />
              <GlassInput label="Advance Received" type="number" name="party_advance" value={form.party_advance} onChange={handleChange} />
            </div>
          </GlassCard>
        </div>

        {/* Section 4: Adjustments */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
            <LayoutGrid size={20} className="text-blue-400" />
            <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Additional Charges & Remarks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassInput label="TDS (%)" type="number" name="tds" value={form.tds} onChange={handleChange} />
            <GlassInput label="Himmali" type="number" name="himmali" value={form.himmali} onChange={handleChange} />
            <GlassInput label="Remark / Note" name="remark" value={form.remark} onChange={handleChange} className="md:col-span-1" />
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
          <GlassButton type="button" variant="secondary" onClick={() => navigate('/trips', { direction: 'backward' })}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" disabled={loading} className="min-w-[150px] shadow-lg shadow-blue-500/20">
            {loading ? "Creating..." : <><Save size={18} /> Create Trip</>}
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
