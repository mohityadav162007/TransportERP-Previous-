import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassBox from "../components/GlassBox";

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

  if (!form) return <div className="text-white p-8 italic">Loading trip...</div>;

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
    <div className="max-w-5xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-8">Edit Trip: {form.trip_code}</h1>

      <form onSubmit={submit} className="space-y-8">
        <Section title="Trip Dates">
          <Input label="Loading Date" type="date" name="loading_date" value={form.loading_date?.slice(0, 10)} onChange={change} required />
          <Input label="Unloading Date" type="date" name="unloading_date" value={form.unloading_date?.slice(0, 10) || ""} onChange={change} />
        </Section>

        <Section title="Logistics & Route">
          <Input label="Apartment" name="apartment" value={form.apartment || ""} onChange={change} />
          <Input label="From Location" name="from_location" value={form.from_location} onChange={change} required />
          <Input label="To Location" name="to_location" value={form.to_location} onChange={change} required />
        </Section>

        <Section title="Vehicle & Driver Management">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vehicle Number</label>
            <input
              name="vehicle_number"
              value={form.vehicle_number}
              onChange={change}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            {isOwnVehicle && (
              <span className="text-xs text-green-400 font-medium px-1 block mt-1">
                ✓ Recognized as Own Vehicle
              </span>
            )}
          </div>
          <Input label="Driver Mobile" name="driver_number" value={form.driver_number || ""} onChange={change} />
          {!isOwnVehicle && (
            <>
              <Input label="Motor Owner" name="motor_owner_name" value={form.motor_owner_name || ""} onChange={change} />
              <Input label="Owner Mobile" name="motor_owner_number" value={form.motor_owner_number || ""} onChange={change} />
            </>
          )}
        </Section>

        {!isOwnVehicle && (
          <Section title="Financials: Motor Owner Cost">
            <Input label="Agreed Freight (₹)" type="number" name="gaadi_freight" value={form.gaadi_freight} onChange={change} />
            <Input label="Advance Paid (₹)" type="number" name="gaadi_advance" value={form.gaadi_advance} onChange={change} />
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Payout Status</label>
              <select name="gaadi_balance_status" value={form.gaadi_balance_status || "UNPAID"} onChange={change}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option value="UNPAID">Balance: UNPAID</option>
                <option value="PAID">Balance: PAID</option>
              </select>
            </div>
          </Section>
        )}

        <Section title="Financials: Party Billing">
          <Input label="Party Name" name="party_name" value={form.party_name} onChange={change} required />
          <Input label="Party Mobile" name="party_number" value={form.party_number || ""} onChange={change} />
          <Input label="Total Freight (₹)" type="number" name="party_freight" value={form.party_freight} onChange={change} />
          <Input label="Advance Received (₹)" type="number" name="party_advance" value={form.party_advance} onChange={change} />
        </Section>

        <Section title="Deductions & Adjustments">
          <Input label="TDS (₹)" type="number" name="tds" value={form.tds} onChange={change} />
          <Input label="Himmali (₹)" type="number" name="himmali" value={form.himmali} onChange={change} />
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Collection Status</label>
            <select name="payment_status" value={form.payment_status} onChange={change}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <option value="UNPAID">Collection: UNPAID</option>
              <option value="PAID">Collection: PAID</option>
            </select>
          </div>
        </Section>

        <Section title="Operational Metadata">
          <Input label="Load Weight (MT)" type="number" name="weight" value={form.weight || ""} onChange={change} />
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Internal Remarks</label>
            <textarea name="remark" rows="3" value={form.remark || ""} onChange={change}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </Section>

        <div className="flex gap-4 sticky bottom-4">
          <button disabled={saving} className="flex-1 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all font-bold uppercase tracking-widest text-sm">
            {saving ? "Processing..." : "Commit Changes"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all font-bold uppercase tracking-widest text-sm text-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <GlassBox>
      <div className="p-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 py-2 border-b border-white/5">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
      </div>
    </GlassBox>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <input {...props} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
    </div>
  );
}
