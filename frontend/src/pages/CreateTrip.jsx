import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Truck,
  Wallet,
  FileText,
  ChevronRight,
  LayoutGrid,
  CheckCircle,
  X
} from "lucide-react";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";

export default function CreateTrip() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    loading_date: "",
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
    if (!form.vehicle_number) {
      setIsOwnVehicle(false);
      return;
    }
    const cleanNumber = form.vehicle_number.replace(/\s+/g, '').toLowerCase();
    const match = ownVehicles.some(v => v.replace(/\s+/g, '').toLowerCase() === cleanNumber);
    setIsOwnVehicle(match);
  }, [form.vehicle_number, ownVehicles]);

  /* AUTO-FILL LOGIC */
  const handlePartyBlur = async () => {
    if (!form.party_name) return;
    try {
      const res = await api.get(`/masters/parties?name=${encodeURIComponent(form.party_name)}`);
      const match = res.data.find(p => p.name.toLowerCase() === form.party_name.toLowerCase().trim());
      if (match && match.mobile) {
        setForm(prev => ({ ...prev, party_phone: match.mobile }));
      }
    } catch (err) {
      console.error("Auto-fill party error:", err);
    }
  };

  const handleOwnerBlur = async () => {
    if (!form.motor_owner_name) return;
    try {
      const res = await api.get(`/masters/motor-owners?name=${encodeURIComponent(form.motor_owner_name)}`);
      const match = res.data.find(m => m.name.toLowerCase() === form.motor_owner_name.toLowerCase().trim());
      if (match && match.mobile) {
        setForm(prev => ({ ...prev, motor_owner_number: match.mobile }));
      }
    } catch (err) {
      console.error("Auto-fill owner error:", err);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await api.post("/trips", {
        loading_date: form.loading_date,
        unloading_date: form.unloading_date || null,
        from_location: form.route_from,
        to_location: form.route_to,
        vehicle_number: form.vehicle_number,
        driver_number: form.driver_phone || null,
        motor_owner_name: form.motor_owner_name || null,
        motor_owner_number: form.motor_owner_number || null,
        gaadi_freight: Number(form.gaadi_freight),
        gaadi_advance: Number(form.gaadi_advance) || 0,
        party_name: form.party_name,
        party_number: form.party_phone || null,
        party_freight: Number(form.party_freight),
        party_advance: Number(form.party_advance) || 0,
        tds: Number(form.tds) || 0,
        himmali: Number(form.himmali) || 0,
        weight: Number(form.weight) || null,
        remark: form.remark || null,
        payment_status: form.party_payment_status
      });

      navigate("/trips");
    } catch (err) {
      console.error("CREATE TRIP ERROR:", err);
      alert(err.response?.data?.error || "Failed to create trip");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 text-white">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-400">
        <span>Dashboard</span>
        <ChevronRight size={14} className="mx-1" />
        <span onClick={() => navigate('/trips')} className="cursor-pointer hover:text-white">Trips</span>
        <ChevronRight size={14} className="mx-1" />
        <span className="font-medium text-white">Create Trip</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Create New Trip</h1>
        <p className="text-gray-400 text-sm mt-1">
          Register a new logistics movement and generate consignment details.
        </p>
      </div>

      <GlassCard className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Dates & Route */}
          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
              <Calendar size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Dates & Route</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassInput
                label="Loading Date"
                type="date"
                name="loading_date"
                required
                onChange={handleChange}
              />
              <GlassInput
                label="Unloading Date"
                type="date"
                name="unloading_date"
                onChange={handleChange}
              />
              <GlassInput
                label="Origin (From)"
                name="route_from"
                placeholder="City, Warehouse, or Port"
                required
                onChange={handleChange}
              />
              <GlassInput
                label="Destination (To)"
                name="route_to"
                placeholder="City or Delivery Point"
                required
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Vehicle & Driver Details */}
          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
              <Truck size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Vehicle & Driver Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <GlassInput
                  label="Vehicle Number"
                  name="vehicle_number"
                  placeholder="e.g. MH-12-AB-1234"
                  required
                  onChange={handleChange}
                />
                {isOwnVehicle && (
                  <span className="absolute top-0 right-0 text-xs text-green-400 font-bold flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle size={10} /> Own Vehicle
                  </span>
                )}
              </div>

              <GlassInput
                label="Driver Phone"
                name="driver_phone"
                placeholder="+91 00000 00000"
                onChange={handleChange}
              />

              {!isOwnVehicle && (
                <>
                  <GlassInput
                    label="Motor Owner Name"
                    name="motor_owner_name"
                    placeholder="Owner Full Name"
                    onChange={handleChange}
                    onBlur={handleOwnerBlur}
                  />
                  <GlassInput
                    label="Motor Owner Number"
                    name="motor_owner_number"
                    placeholder="Owner Contact Number"
                    onChange={handleChange}
                  />
                </>
              )}
            </div>
          </section>

          {/* Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gaadi (Cost) - Hidden for Own Vehicles */}
            {!isOwnVehicle && (
              <div className="bg-rose-500/5 p-6 rounded-xl border border-rose-500/10">
                <div className="flex items-center gap-2 mb-4 text-rose-400">
                  <Wallet size={18} />
                  <h2 className="font-semibold uppercase tracking-wider text-xs">Gaadi (Cost)</h2>
                </div>

                <div className="space-y-4">
                  <GlassInput
                    label="GAADI FREIGHT"
                    type="number"
                    name="gaadi_freight"
                    placeholder="0.00"
                    onChange={handleChange}
                  />
                  <GlassInput
                    label="GAADI ADVANCE"
                    type="number"
                    name="gaadi_advance"
                    placeholder="0.00"
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Party (Income) */}
            <div className="bg-blue-500/5 p-6 rounded-xl border border-blue-500/10">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                <FileText size={18} />
                <h2 className="font-semibold uppercase tracking-wider text-xs">Party (Income)</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <GlassInput
                    label="PARTY NAME"
                    name="party_name"
                    placeholder="Client Name"
                    required
                    onChange={handleChange}
                    onBlur={handlePartyBlur}
                  />
                  <GlassInput
                    label="PARTY NUMBER"
                    name="party_phone"
                    placeholder="Contact No."
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <GlassInput
                    label="PARTY FREIGHT"
                    type="number"
                    name="party_freight"
                    placeholder="0.00"
                    onChange={handleChange}
                  />
                  <GlassInput
                    label="PARTY ADVANCE"
                    type="number"
                    name="party_advance"
                    placeholder="0.00"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Adjustments & Additional Info */}
          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
              <LayoutGrid size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Adjustments & Additional Info</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <GlassInput
                label="TDS (%)"
                type="number"
                name="tds"
                placeholder="0.0"
                onChange={handleChange}
              />
              <GlassInput
                label="Himmali"
                type="number"
                name="himmali"
                placeholder="0.00"
                onChange={handleChange}
              />
              <GlassInput
                label="Weight (MT)"
                type="number"
                step="0.1"
                name="weight"
                placeholder="0.00"
                onChange={handleChange}
              />
              <GlassInput
                label="Remark"
                name="remark"
                placeholder="Internal notes"
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/trips")}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              className="px-8 shadow-lg shadow-blue-500/20"
            >
              <CheckCircle size={18} /> Create Trip
            </GlassButton>
          </div>

        </form>
      </GlassCard>
    </div>
  );
}
