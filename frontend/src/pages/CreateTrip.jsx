import { useState, useEffect } from "react";
import { use3DNavigate } from "../hooks/use3DNavigate";
import { motion, AnimatePresence } from "framer-motion";
import { SYSTEM_SPRING } from "../styles/animations";
import {
  Calendar, Truck, Wallet, FileText, ChevronRight, LayoutGrid, CheckCircle, ArrowLeft, ArrowRight
} from "lucide-react";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";

function FormStep({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={SYSTEM_SPRING}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        backfaceVisibility: 'hidden',
        perspective: 1000
      }}
    >
      {children}
    </motion.div>
  );
}

export default function CreateTrip() {
  const { navigate, back } = use3DNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState('forward');

  const [form, setForm] = useState({
    loading_date: "", unloading_date: "", route_from: "", route_to: "",
    vehicle_number: "", driver_phone: "", motor_owner_name: "", motor_owner_number: "",
    gaadi_freight: "", gaadi_advance: "",
    party_name: "", party_phone: "", party_freight: "", party_advance: "",
    tds: "", himmali: "", weight: "", remark: "", party_payment_status: "UNPAID"
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

  const nextStep = () => {
    setDirection('forward');
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setDirection('backward');
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async e => {
    e.preventDefault();
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
    }
  };

  const steps = [
    { id: 0, title: "Route & Vehicle", icon: Truck },
    { id: 1, title: "Financials", icon: Wallet },
    { id: 2, title: "Review & Submit", icon: CheckCircle }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 text-white h-[calc(100vh-140px)] flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-400">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-white">Dashboard</span>
        <ChevronRight size={14} className="mx-1" />
        <span onClick={() => navigate('/trips', { direction: 'backward' })} className="cursor-pointer hover:text-white">Trips</span>
        <ChevronRight size={14} className="mx-1" />
        <span className="font-medium text-white">Create Trip</span>
      </div>

      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Trip</h1>
          <p className="text-gray-400 text-sm mt-1">Step {currentStep + 1} of 3: {steps[currentStep].title}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? "w-8 bg-blue-500" : i < currentStep ? "w-2 bg-blue-400/50" : "w-2 bg-white/10"}`} />
          ))}
        </div>
      </div>

      <GlassCard className="flex-1 relative overflow-hidden" style={{ minHeight: '500px' }}>
        <form onSubmit={handleSubmit} className="h-full relative perspective-[1000px]">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            {currentStep === 0 && (
              <FormStep key="step0" direction={direction}>
                <div className="p-6 md:p-8 space-y-8 h-full overflow-y-auto">
                  {/* Dates & Route */}
                  <section>
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                      <Calendar size={18} className="text-blue-400" />
                      <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Dates & Route</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <GlassInput label="Loading Date" type="date" name="loading_date" required value={form.loading_date} onChange={handleChange} />
                      <GlassInput label="Unloading Date" type="date" name="unloading_date" value={form.unloading_date} onChange={handleChange} />
                      <GlassInput label="Origin (From)" name="route_from" placeholder="City, Warehouse..." required value={form.route_from} onChange={handleChange} />
                      <GlassInput label="Destination (To)" name="route_to" placeholder="City..." required value={form.route_to} onChange={handleChange} />
                    </div>
                  </section>

                  {/* Vehicle */}
                  <section>
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                      <Truck size={18} className="text-blue-400" />
                      <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Vehicle & Driver</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>
                  </section>
                </div>
                {/* Footer Action */}
                <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/5 bg-black/20 backdrop-blur-md flex justify-end">
                  <GlassButton type="button" variant="primary" onClick={nextStep}>Next <ChevronRight size={18} /></GlassButton>
                </div>
              </FormStep>
            )}

            {currentStep === 1 && (
              <FormStep key="step1" direction={direction}>
                <div className="p-6 md:p-8 space-y-8 h-full overflow-y-auto">
                  {/* Financials */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {!isOwnVehicle && (
                      <div className="bg-rose-500/5 p-6 rounded-xl border border-rose-500/10">
                        <div className="flex items-center gap-2 mb-4 text-rose-400"><Wallet size={18} /><h2 className="font-semibold uppercase tracking-wider text-xs">Gaadi (Cost)</h2></div>
                        <div className="space-y-4">
                          <GlassInput label="Freight" type="number" name="gaadi_freight" value={form.gaadi_freight} onChange={handleChange} />
                          <GlassInput label="Advance" type="number" name="gaadi_advance" value={form.gaadi_advance} onChange={handleChange} />
                        </div>
                      </div>
                    )}
                    <div className="bg-blue-500/5 p-6 rounded-xl border border-blue-500/10">
                      <div className="flex items-center gap-2 mb-4 text-blue-400"><FileText size={18} /><h2 className="font-semibold uppercase tracking-wider text-xs">Party (Income)</h2></div>
                      <div className="space-y-4">
                        <GlassInput label="Name" name="party_name" required value={form.party_name} onChange={handleChange} onBlur={handlePartyBlur} />
                        <GlassInput label="Number" name="party_phone" value={form.party_phone} onChange={handleChange} />
                        <div className="grid grid-cols-2 gap-4">
                          <GlassInput label="Freight" type="number" name="party_freight" value={form.party_freight} onChange={handleChange} />
                          <GlassInput label="Advance" type="number" name="party_advance" value={form.party_advance} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/5 bg-black/20 backdrop-blur-md flex justify-between">
                  <GlassButton type="button" variant="secondary" onClick={prevStep}><ArrowLeft size={18} /> Back</GlassButton>
                  <GlassButton type="button" variant="primary" onClick={nextStep}>Next <ChevronRight size={18} /></GlassButton>
                </div>
              </FormStep>
            )}

            {currentStep === 2 && (
              <FormStep key="step2" direction={direction}>
                <div className="p-6 md:p-8 space-y-8 h-full overflow-y-auto">
                  <section>
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                      <LayoutGrid size={18} className="text-blue-400" />
                      <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Adjustments & Review</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <GlassInput label="TDS (%)" type="number" name="tds" value={form.tds} onChange={handleChange} />
                      <GlassInput label="Himmali" type="number" name="himmali" value={form.himmali} onChange={handleChange} />
                      <GlassInput label="Weight (MT)" type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} />
                      <GlassInput label="Remark" name="remark" value={form.remark} onChange={handleChange} />
                    </div>
                  </section>

                  <div className="bg-white/5 p-6 rounded-xl">
                    <h3 className="text-lg font-bold mb-4">Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-white/50">Route:</span> {form.route_from} → {form.route_to}</div>
                      <div><span className="text-white/50">Vehicle:</span> {form.vehicle_number}</div>
                      <div><span className="text-white/50">Party:</span> {form.party_name}</div>
                      <div><span className="text-white/50">Profit (Est):</span> ₹{(Number(form.party_freight) - Number(form.gaadi_freight))}</div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/5 bg-black/20 backdrop-blur-md flex justify-between">
                  <GlassButton type="button" variant="secondary" onClick={prevStep}><ArrowLeft size={18} /> Back</GlassButton>
                  <GlassButton type="submit" variant="primary" className="px-8 shadow-lg shadow-blue-500/20"><CheckCircle size={18} /> Create Trip</GlassButton>
                </div>
              </FormStep>
            )}
          </AnimatePresence>
        </form>
      </GlassCard>
    </div>
  );
}
