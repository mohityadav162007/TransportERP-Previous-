import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Truck,
  User,
  Wallet,
  FileText,
  ChevronRight,
  Phone,
  LayoutGrid
} from "lucide-react";
import api from "../services/api";
import GlassBox from "../components/GlassBox";
import { useEffect } from "react";

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
    <div className="max-w-5xl mx-auto p-6 text-white">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight size={14} className="mx-1" />
        <span>Trips</span>
        <ChevronRight size={14} className="mx-1" />
        <span className="font-medium text-white">Create Trip</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Create New Trip</h1>
        <p className="text-gray-400 text-sm mt-1">
          Register a new logistics movement and generate consignment details.
        </p>
      </div>

      <GlassBox>
        <form onSubmit={handleSubmit} className="p-4 space-y-8">

          {/* Dates & Route */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <Calendar size={18} />
              <h2 className="font-semibold text-white">Dates & Route</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Loading Date</label>
                <input
                  type="date"
                  name="loading_date"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unloading Date</label>
                <input
                  type="date"
                  name="unloading_date"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Origin (From)</label>
                <input
                  name="route_from"
                  placeholder="City, Warehouse, or Port"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destination (To)</label>
                <input
                  name="route_to"
                  placeholder="City or Delivery Point"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all"
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Vehicle & Driver Details */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <Truck size={18} />
              <h2 className="font-semibold text-white">Vehicle & Driver Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vehicle Number</label>
                <input
                  name="vehicle_number"
                  placeholder="e.g. MH-12-AB-1234"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all"
                  onChange={handleChange}
                />
                {isOwnVehicle && (
                  <span className="text-xs text-green-400 font-medium px-1 block mt-1">
                    ✓ Recognized as Own Vehicle
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Driver Phone</label>
                <input
                  name="driver_phone"
                  placeholder="+91 00000 00000"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all"
                  onChange={handleChange}
                />
              </div>

              {!isOwnVehicle && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Motor Owner Name</label>
                    <input
                      name="motor_owner_name"
                      placeholder="Owner Full Name"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all"
                      onChange={handleChange}
                      onBlur={handleOwnerBlur}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Motor Owner Number</label>
                    <input
                      name="motor_owner_number"
                      placeholder="Owner Contact Number"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all"
                      onChange={handleChange}
                    />
                  </div>
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GAADI FREIGHT</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="gaadi_freight"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-white placeholder-gray-600 transition-all"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GAADI ADVANCE</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="gaadi_advance"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-white placeholder-gray-600 transition-all"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PARTY NAME</label>
                    <input
                      name="party_name"
                      placeholder="Client Name"
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600 transition-all"
                      onChange={handleChange}
                      onBlur={handlePartyBlur}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PARTY NUMBER</label>
                    <input
                      name="party_phone"
                      placeholder="Contact No."
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600 transition-all"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PARTY FREIGHT</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="party_freight"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600 transition-all"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PARTY ADVANCE</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="party_advance"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600 transition-all"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adjustments & Additional Info */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-gray-300">
              <LayoutGrid size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white">Adjustments & Additional Info</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TDS (%)</label>
                <input
                  type="number"
                  name="tds"
                  placeholder="0.0"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600 transition-all"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Himmali</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="himmali"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600 transition-all"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight (MT)</label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600 transition-all"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remark</label>
                <input
                  name="remark"
                  placeholder="Internal notes"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-600 transition-all"
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/trips")}
              className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Create Trip
            </button>
          </div>

        </form>
      </GlassBox>
    </div>
  );
}
