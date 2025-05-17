import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { format } from "date-fns";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function DialogDemo({ onAddVessel }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'en-route': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-orange-100 text-orange-800';
      case 'berthed': return 'bg-green-100 text-green-800';
      default: return 'bg-white text-black';
    }
  };

  const [formOpen, setFormOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    type: 'Tanker',
    dimensions: '',
    status: 'announcement',
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState("00");
  const [selectedMinute, setSelectedMinute] = useState("00");

  const getCombinedDateTime = () => {
    const date = new Date(selectedDate);
    date.setHours(Number(selectedHour));
    date.setMinutes(Number(selectedMinute));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const berthMap = {
    Tanker: "A",
    Container: "B",
    Bulk: "C",
    RoRo: "D",
  };

  const eta = getCombinedDateTime();
  const departure = new Date(eta.getTime() + 2 * 60 * 60 * 1000);

  // Fetch all vessels to calculate current berth space
  const allVessels = await fetch("http://localhost:5000/api/vesselEvent").then(res => res.json());

  const targetBerth = berthMap[formData.type];
  const vesselsInBerth = allVessels.filter(v => v.berth_type === formData.type && v.status === "berth");
  const usedSpace = vesselsInBerth.reduce((sum, v) => sum + v.vessel_size, 0);

  const vesselSize = parseInt(formData.dimensions);
  const berthMaxSize = 150;

  const vessel = {
    vessel_type: formData.type,
    berth_type: formData.type,
    berth_id: bearthMap[formData.type],
    eta_hour: eta.toISOString().split("T")[1].split(".")[0],
    planned_departure_hour: departure.toISOString().split("T")[1].split(".")[0],
    vessel_size: vesselSize,
    weather_score: 3,
    container_subtype: formData.type === "Container" ? "Others" : null,
    status: formData.status,  // usually 'announcement'
  };

  try {
    const res = await fetch("http://localhost:5000/api/vesselEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vessel),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    setFormOpen(false);
    setShowSuccess(true);
    onAddVessel();

    setFormData({ name: '', type: 'Tanker', dimensions: '', status: 'announcement' });
    setSelectedDate(new Date());
    setSelectedHour("00");
    setSelectedMinute("00");
  } catch (err) {
    console.error("❌ Could not submit vessel:", err);
    setErrorMessage("❌ Failed to add vessel. Make sure all fields are valid.");
    setShowError(true);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Vessel
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-blue-900">Add New Vessel</DialogTitle>
            <DialogDescription>Enter the details of the new vessel below.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vessel Name</label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vessel Type</label>
              <Select value={formData.type} onValueChange={v => handleSelectChange("type", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="Tanker">Tanker</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="Bulk">Bulk</SelectItem>
                  <SelectItem value="RoRo">RoRo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vessel Size</label>
              <Select value={formData.dimensions} onValueChange={v => handleSelectChange("dimensions", v)}>
                <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="50">50m</SelectItem>
                  <SelectItem value="75">75m</SelectItem>
                  <SelectItem value="100">100m</SelectItem>
                  <SelectItem value="150">150m</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
  <label className="text-sm font-medium">Status</label>
  <Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
    <SelectTrigger>
      <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent className="bg-blue-900 text-white">
      <SelectItem value="announcement">Announcement</SelectItem>
      <SelectItem value="queue">Queue</SelectItem>
      <SelectItem value="berth">Berth</SelectItem>
      <SelectItem value="departure">Departure</SelectItem>
    </SelectContent>
  </Select>
</div>


            <div className="space-y-2">
              <label className="text-sm font-medium">ETA</label>
              <input
                type="date"
                className="w-full border px-3 py-2 rounded"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                required
              />
              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <label className="text-sm font-medium">Hour</label>
                  <select className="w-full border px-2 py-2 rounded" value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={String(i).padStart(2, "0")}>{String(i).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">Minutes</label>
                  <select className="w-full border px-2 py-2 rounded" value={selectedMinute} onChange={(e) => setSelectedMinute(e.target.value)}>
                    {["00", "15", "30", "45"].map(min => (
                      <option key={min} value={min}>{min}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="bg-blue-800 text-white">Add Vessel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="text-center animate-in fade-in zoom-in-95 duration-300">
          <DialogHeader>
            <DialogDescription>
  The vessel was added and assigned to the {formData.status === "berth" ? "berth" : "queue"}.
</DialogDescription>

          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowSuccess(false)} className="bg-green-600 hover:bg-green-700 text-white">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent className="text-center animate-in fade-in zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-xl">❌ Cannot Add Vessel</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowError(false)} className="bg-red-600 hover:bg-red-700 text-white">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
