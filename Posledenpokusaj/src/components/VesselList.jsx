import { Search, Ship, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogDemo } from './DialogDemo';
import { useState, useEffect, useMemo } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd';

export function VesselList() {
  const [vessels, setVessels] = useState([]);
  const [berthAvailableSizes, setBerthAvailableSizes] = useState({});
  const [filterStatus, setFilterStatus] = useState('all-statuses');
  const [filterType, setFilterType] = useState('all-types');

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

  // map each status to its Tailwind classes
  const statusClasses = {
    berthed:    'border-green-500 bg-green-50 text-green-700',
    arrived:    'border-green-500 bg-green-50 text-green-700',
    waiting:    'border-yellow-500 bg-yellow-50 text-yellow-700',
    'en-route': 'border-red-500 bg-red-50 text-red-700',
    scheduled:  'border-blue-500 bg-blue-50 text-blue-700',
  };

  // derive filtered list
  const displayed = useMemo(() => {
    return vessels
      .filter(v => filterStatus === 'all-statuses' || v.status === filterStatus)
      .filter(v => filterType === 'all-types' || v.vessel_type === filterType);
  }, [vessels, filterStatus, filterType]);

  // handle drag-and-drop reorder
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const copy = Array.from(displayed);
    const [moved] = copy.splice(result.source.index, 1);
    copy.splice(result.destination.index, 0, moved);
    const ids = copy.map(v => v.id);
    const rest = vessels.filter(v => !ids.includes(v.id));
    setVessels([...ids.map(id => copy.find(v => v.id === id)), ...rest]);
  };

  // remove handler
  const handleRemove = async (id) => {
    if (!window.confirm('Remove vessel from queue?')) return;
    try {
      await fetch(`http://localhost:5000/api/vessels/${id}`, { method: 'DELETE' });
      setVessels(v => v.filter(x => x.id !== id));
    } catch {
      alert('Could not remove vessel.');
    }
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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

            <Select value={filterType} onValueChange={setFilterType}>
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
                <TableHead className="w-[30px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="vessels">
                {(provided) => (
                  <TableBody
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {displayed.map((vessel, idx) => (
                      <Draggable
                        key={vessel.id}
                        draggableId={String(vessel.id)}
                        index={idx}
                      >
                        {(prov, snap) => (
                          <TableRow
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={snap.isDragging ? 'bg-gray-100' : ''}
                          >
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
                                  statusClasses[vessel.status] ??
                                  'border-gray-300 bg-gray-100 text-gray-600'
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
                            <TableCell className="text-center">
                              <Trash2
                                size={16}
                                className="cursor-pointer hover:text-red-600"
                                onClick={() => handleRemove(vessel.id)}
                                aria-label={`Remove vessel ${vessel.name}`}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </DragDropContext>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}