import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";
import { CheckCircle, Calendar, MapPin, Truck, Wallet, User, FileText, ChevronRight, LayoutGrid } from "lucide-react";
import Skeleton from "../components/Skeleton";

export default function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const [ownVehicles, setOwnVehicles] = useState([]);
  const [isOwnVehicle, setIsOwnVehicle] = useState(false);

  useEffect(() => {
    // Fetch own vehicles list
    api.get("/masters/own-vehicles")
      .then(res => setOwnVehicles(res.data))
      .catch(err => console.error("Failed to load own vehicles", err));

    api.get("/trips").then(res => {
      const trip = res.data.find(t => t.id == id);
      if (!trip) return navigate("/trips");
      if (trip.party_payment_status && !trip.payment_status) {
        trip.payment_status = trip.party_payment_status;
      }
      setForm(trip);
    });
  }, [id, navigate]);

  useEffect(() => {
    if (!form || !form.vehicle_number) {
      setIsOwnVehicle(false);
      return;
    }
    const cleanNumber = form.vehicle_number.replace(/\s+/g, '').toLowerCase();
    const match = ownVehicles.some(v => v.replace(/\s+/g, '').toLowerCase() === cleanNumber);
    setIsOwnVehicle(match);
  }, [form?.vehicle_number, ownVehicles]);

  if (!form) return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Skeleton width="300px" height="40px" />
      <GlassCard className="h-96" />
    </div>
  );

  const change = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submit = async e => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/trips/${id}`, {
        ...form,
        gaadi_freight: Number(form.gaadi_freight),
        gaadi_advance: Number(form.gaadi_advance) || 0,
        party_freight: Number(form.party_freight),
        party_advance: Number(form.party_advance) || 0,
        tds: Number(form.tds) || 0,
        himmali: Number(form.himmali) || 0,
        weight: form.weight ? Number(form.weight) : null
      });

      navigate(`/trips/${id}`);
    } catch (err) {
      console.error("UPDATE TRIP ERROR:", err);
      alert("Failed to update trip");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto text-white pb-20 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-400">
        <span>Dashboard</span>
        <ChevronRight size={14} className="mx-1" />
        <span onClick={() => navigate('/trips')} className="cursor-pointer hover:text-white">Trips</span>
        <ChevronRight size={14} className="mx-1" />
        <span className="font-medium text-white">Edit Trip</span>
      </div>

      <h1 className="text-2xl font-bold mb-8">Edit Trip: <span className="text-blue-400">{form.trip_code}</span></h1>

      <GlassCard className="p-6 md:p-8">
        <form onSubmit={submit} className="space-y-8">

          {/* Dates */}
          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
              <Calendar size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Trip Dates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassInput label="Loading Date" type="date" name="loading_date" value={form.loading_date?.slice(0, 10)} onChange={change} required />
              <GlassInput label="Unloading Date" type="date" name="unloading_date" value={form.unloading_date?.slice(0, 10) || ""} onChange={change} />
            </div>
          </section>

          {/* Logistics */}
          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
              <MapPin size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Logistics & Route</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassInput label="From Location" name="from_location" value={form.from_location} onChange={change} required />
              <GlassInput label="To Location" name="to_location" value={form.to_location} onChange={change} required />
            </div>
          </section>

          {/* Vehicle */}
          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
              <Truck size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Vehicle & Driver Management</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <GlassInput
                  label="Vehicle Number"
                  name="vehicle_number"
                  value={form.vehicle_number}
                  onChange={change}
                  required
                />
                {isOwnVehicle && (
                  <span className="absolute top-0 right-0 text-xs text-green-400 font-bold flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle size={10} /> Own Vehicle
                  </span>
                )}
              </div>
              <GlassInput label="Driver Mobile" name="driver_number" value={form.driver_number || ""} onChange={change} />
              {!isOwnVehicle && (
                <>
                  <GlassInput label="Motor Owner" name="motor_owner_name" value={form.motor_owner_name || ""} onChange={change} />
                  <GlassInput label="Owner Mobile" name="motor_owner_number" value={form.motor_owner_number || ""} onChange={change} />
                </>
              )}
            </div>
          </section>

          {/* Financials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Motor Owner Cost */}
            {!isOwnVehicle && (
              <div className="bg-rose-500/5 p-6 rounded-xl border border-rose-500/10">
                <div className="flex items-center gap-2 mb-4 text-rose-400">
                  <Wallet size={18} />
                  <h2 className="font-semibold uppercase tracking-wider text-xs">Financials: Motor Owner Cost</h2>
                </div>
                <div className="space-y-4">
                  <GlassInput label="Agreed Freight (₹)" type="number" name="gaadi_freight" value={form.gaadi_freight} onChange={change} />
                  <GlassInput label="Advance Paid (₹)" type="number" name="gaadi_advance" value={form.gaadi_advance} onChange={change} />
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Payout Status</label>
                    <select
                      name="gaadi_balance_status"
                      value={form.gaadi_balance_status || "UNPAID"}
                      onChange={change}
                      className="glass-input [&>option]:text-black"
                    >
                      <option value="UNPAID">Balance: UNPAID</option>
                      <option value="PAID">Balance: PAID</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Party Billing */}
            <div className="bg-blue-500/5 p-6 rounded-xl border border-blue-500/10">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                <User size={18} />
                <h2 className="font-semibold uppercase tracking-wider text-xs">Financials: Party Billing</h2>
              </div>
              <div className="space-y-4">
                <GlassInput label="Party Name" name="party_name" value={form.party_name} onChange={change} required />
                <GlassInput label="Party Mobile" name="party_number" value={form.party_number || ""} onChange={change} />
                <GlassInput label="Total Freight (₹)" type="number" name="party_freight" value={form.party_freight} onChange={change} />
                <GlassInput label="Advance Received (₹)" type="number" name="party_advance" value={form.party_advance} onChange={change} />
              </div>
            </div>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
              <LayoutGrid size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Deductions & Adjustments</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassInput label="TDS (₹)" type="number" name="tds" value={form.tds} onChange={change} />
              <GlassInput label="Himmali (₹)" type="number" name="himmali" value={form.himmali} onChange={change} />
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Collection Status</label>
                <select
                  name="payment_status"
                  value={form.payment_status}
                  onChange={change}
                  className="glass-input [&>option]:text-black"
                >
                  <option value="UNPAID">Collection: UNPAID</option>
                  <option value="PAID">Collection: PAID</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
              <FileText size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Operational Metadata</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassInput label="Load Weight (MT)" type="number" name="weight" value={form.weight || ""} onChange={change} />
              <GlassInput label="Internal Remarks" name="remark" value={form.remark || ""} onChange={change} placeholder="Add notes here..." />
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <GlassButton type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" disabled={saving} className="px-8 shadow-lg shadow-blue-500/20">
              {saving ? "Processing..." : "Commit Changes"}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
