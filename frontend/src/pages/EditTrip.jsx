import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  /* =========================
     LOAD TRIP
  ========================= */
  useEffect(() => {
    api.get("/trips").then(res => {
      const trip = res.data.find(t => t.id == id);
      if (!trip) return navigate("/trips");
      setForm(trip);
    });
  }, [id, navigate]);

  if (!form) return <div className="p-6">Loading trip...</div>;

  /* =========================
     HANDLERS
  ========================= */

  const change = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submit = async e => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/trips/${id}`, {
        loading_date: form.loading_date,
        unloading_date: form.unloading_date || null,

        from_location: form.from_location,
        to_location: form.to_location,

        vehicle_number: form.vehicle_number,
        driver_number: form.driver_number || null,

        motor_owner_name: form.motor_owner_name || null,
        motor_owner_number: form.motor_owner_number || null,

        gaadi_freight: Number(form.gaadi_freight),
        gaadi_advance: Number(form.gaadi_advance) || 0,

        party_name: form.party_name,
        party_number: form.party_number || null,

        party_freight: Number(form.party_freight),
        party_advance: Number(form.party_advance) || 0,

        tds: Number(form.tds) || 0,
        himmali: Number(form.himmali) || 0,

        payment_status: form.payment_status,

        weight: form.weight ? Number(form.weight) : null,
        remark: form.remark || null
      });

      navigate(`/trips/${id}`);
    } catch (err) {
      console.error("UPDATE TRIP ERROR:", err);
      alert("Failed to update trip");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Edit Trip</h1>

      <form onSubmit={submit} className="space-y-8">

        {/* Dates */}
        <Section title="Dates">
          <input type="date" name="loading_date" value={form.loading_date?.slice(0, 10)} onChange={change} required />
          <input type="date" name="unloading_date" value={form.unloading_date?.slice(0, 10) || ""} onChange={change} />
        </Section>

        {/* Route */}
        <Section title="Route">
          <input name="from_location" value={form.from_location} onChange={change} required placeholder="From Location" />
          <input name="to_location" value={form.to_location} onChange={change} required placeholder="To Location" />
        </Section>

        {/* Vehicle */}
        <Section title="Vehicle & Driver">
          <input name="vehicle_number" value={form.vehicle_number} onChange={change} required placeholder="Vehicle Number" />
          <input name="driver_number" value={form.driver_number || ""} onChange={change} placeholder="Driver Number" />
          <input name="motor_owner_name" value={form.motor_owner_name || ""} onChange={change} placeholder="Motor Owner Name" />
          <input name="motor_owner_number" value={form.motor_owner_number || ""} onChange={change} placeholder="Motor Owner Number" />
        </Section>

        {/* Gaadi */}
        <Section title="Gaadi (Cost)">
          <input type="number" name="gaadi_freight" value={form.gaadi_freight} onChange={change} required placeholder="Gaadi Freight" />
          <input type="number" name="gaadi_advance" value={form.gaadi_advance} onChange={change} placeholder="Gaadi Advance" />
        </Section>

        {/* Party */}
        <Section title="Party (Income)">
          <input name="party_name" value={form.party_name} onChange={change} required placeholder="Party Name" />
          <input name="party_number" value={form.party_number || ""} onChange={change} placeholder="Party Number" />
          <input type="number" name="party_freight" value={form.party_freight} onChange={change} required placeholder="Party Freight" />
          <input type="number" name="party_advance" value={form.party_advance} onChange={change} placeholder="Party Advance" />
        </Section>

        {/* Adjustments */}
        <Section title="Adjustments">
          <input type="number" name="tds" value={form.tds} onChange={change} placeholder="TDS" />
          <input type="number" name="himmali" value={form.himmali} onChange={change} placeholder="Himmali" />
          <select name="payment_status" value={form.payment_status} onChange={change}>
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
          </select>
        </Section>

        {/* Extra */}
        <Section title="Additional">
          <input type="number" name="weight" value={form.weight || ""} onChange={change} />
          <textarea name="remark" rows="3" value={form.remark || ""} onChange={change} />
        </Section>

        <div className="flex gap-4">
          <button disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded">
            {saving ? "Saving..." : "Update Trip"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border rounded">
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}

/* ========================= */

function Section({ title, children }) {
  return (
    <div className="bg-white border rounded p-5 space-y-3">
      <h2 className="font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}
