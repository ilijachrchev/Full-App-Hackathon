import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/api';
import { Search, Ship } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { DialogDemo } from './DialogDemo';

export default function VesselList() {
  // Fetch vessel data from backend
  const { data: vessels = [], error } = useSWR('/api/VesselEvent', fetcher);

  // Local UI state for search and filters
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all-statuses');
  const [typeFilter, setTypeFilter] = useState('all-types');

  // Handler to add a new vessel via API and refresh list
  const handleAddVessel = async (newVessel) => {
    try {
      await api.post('/api/vessels', newVessel);
      // Revalidate SWR cache for vessels
      mutate('/api/VesselEvent');
    } catch (err) {
      console.error('Failed to add vessel', err);
    }
  };

  // Filter vessels based on search and selects
  const filteredVessels = vessels.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === 'all-statuses' || v.status === statusFilter;
    const matchesType = typeFilter === 'all-types' || v.type.toLowerCase() === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (error) return <CardContent>Error loading vessels.</CardContent>;
  if (!vessels) return <CardContent>Loading vessels…</CardContent>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vessels</CardTitle>
        <CardDescription>Manage and track all vessels</CardDescription>
        <div>
          <DialogDemo onAddVessel={handleAddVessel} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search vessels..."
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                <SelectItem value="berthed">Berthed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="en-route">En Route</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
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
                <TableHead className="w-[50px]" />
                <TableHead>Vessel</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVessels.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <Ship className="h-5 w-5 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.dimensions}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        v.status === 'berthed'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : v.status === 'scheduled'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : v.status === 'en-route'
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-500 bg-gray-50 text-gray-700'
                      }
                    >
                      {v.status === 'berthed'
                        ? 'Berthed'
                        : v.status === 'scheduled'
                        ? 'Scheduled'
                        : v.status === 'en-route'
                        ? 'En Route'
                        : 'Waiting'}
                    </Badge>
                  </TableCell>
                  <TableCell>{v.eta}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
