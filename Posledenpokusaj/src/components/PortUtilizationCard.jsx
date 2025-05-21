import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

export function PortUtilizationCard() {
  const [occupiedBerths, setOccupiedBerths] = useState(0);
  const [scheduledToday, setScheduledToday] = useState(0);

  const totalBerths = 4;
  const utilizationPercentage = (occupiedBerths / totalBerths) * 100;

  useEffect(() => {
  const fetchData = () => {
    fetch("http://localhost:5000/api/vesselEvent")
      .then((res) => res.json())
      .then((data) => {
        const occupiedSet = new Set(
          data.filter(v => v.berth_id && v.berth_id !== "").map(v => v.berth_id)
        );
        setOccupiedBerths(occupiedSet.size);
        setScheduledToday(data.length);
      });
  };

  fetchData(); // initial load
  const interval = setInterval(fetchData, 20000); // every 20s

  return () => clearInterval(interval); // clean up on unmount
}, []);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Port Utilization</CardTitle>
        <CardDescription>Atlantic Harbor - Current Status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Berth Utilization</span>
            <span className="text-sm font-medium">{utilizationPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full">
            <Progress value={utilizationPercentage} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-card p-3">
            <div className="text-sm text-muted-foreground">Total Berths</div>
            <div className="text-2xl font-bold">{totalBerths}</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-sm text-muted-foreground">Occupied</div>
            <div className="text-2xl font-bold">{occupiedBerths}</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-sm text-muted-foreground">Available</div>
            <div className="text-2xl font-bold">{totalBerths - occupiedBerths}</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-sm text-muted-foreground">Scheduled Today</div>
            <div className="text-2xl font-bold">{scheduledToday}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
