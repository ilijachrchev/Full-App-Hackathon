import { Search, Ship } from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DialogDemo } from './DialogDemo';
import { useState, useEffect } from 'react';

export function VesselList() {
  const [vessels, setVessels] = useState([]);
  const [berthAvailableSizes, setBerthAvailableSizes] = useState({});

  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = () => {
    fetch("http://localhost:5000/api/vesselEvent")
      .then((res) => res.json())
      .then((data) => {
        setVessels(data);
        setBerthAvailableSizes(calculateAvailableSizes(data));
      })
      .catch((err) => console.error("Error loading vessels:", err));
  };

  const calculateAvailableSizes = (vesselList) => {
    const maxSize = 150;
    const usage = { A: 0, B: 0, C: 0, D: 0 };

    vesselList.forEach((v) => {
      if (v.berth_id && v.vessel_size) {
        usage[v.berth_id] += v.vessel_size;
      }
    });

    const result = {};
    for (const key in usage) {
      result[key] = Math.max(0, maxSize - usage[key]);
    }
    return result;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vessels</CardTitle>
        <CardDescription>Manage and track all vessels</CardDescription>
        <DialogDemo onAddVessel={fetchVessels} availableSizes={berthAvailableSizes} />
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search vessels..." className="pl-8" />
          </div>

          <div className="flex gap-2">
            <Select defaultValue="all-statuses">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-blue-800">
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                <SelectItem value="berthed">Berthed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="en-route">En Route</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-types">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-blue-800">
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="tanker">Tanker</SelectItem>
                <SelectItem value="container">Container</SelectItem>
                <SelectItem value="passenger">Passenger</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vessels.map((vessel) => (
                <TableRow key={vessel.id}>
                  <TableCell>
                    <Ship className="h-5 w-5 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{vessel.name}</TableCell>
                  <TableCell>{vessel.vessel_type}</TableCell>
                  <TableCell>{vessel.vessel_size}m</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
  vessel.status === "berthed"
    ? "border-green-500 bg-green-50 text-green-700"
    : vessel.status === "scheduled"
    ? "border-blue-500 bg-blue-50 text-blue-700"
    : vessel.status === "en-route"
    ? "border-amber-500 bg-amber-50 text-amber-700"
    : vessel.status === "waiting"
    ? "border-gray-500 bg-gray-50 text-gray-700"
    : "border-gray-300 bg-gray-100 text-gray-600" // fallback for undefined
}
                    >
                      {vessel.status
                      ? vessel.status.charAt(0).toUpperCase() + vessel.status.slice(1)
                    : "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(`1970-01-01T${vessel.eta_hour}`).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
