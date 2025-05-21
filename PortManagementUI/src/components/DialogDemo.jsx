import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function DialogDemo({ onAddVessel }) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Passenger',
        dimensions: '',
        status: 'scheduled',
        eta: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddVessel(formData);
        setFormData({
            name: '',
            type: 'Passenger',
            dimensions: '',
            status: 'scheduled',
            eta: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Vessel
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Vessel</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new vessel below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Vessel Name</label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter vessel name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="type" className="text-sm font-medium">Type</label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => handleSelectChange('type', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select vessel type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Passenger">Passenger</SelectItem>
                                <SelectItem value="Tanker">Tanker</SelectItem>
                                <SelectItem value="Container">Container</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="dimensions" className="text-sm font-medium">Dimensions</label>
                        <Input
                            id="dimensions"
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleChange}
                            placeholder="e.g., 302m × 10m"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium">Status</label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleSelectChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="en-route">En Route</SelectItem>
                                <SelectItem value="waiting">Waiting</SelectItem>
                                <SelectItem value="berthed">Berthed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="eta" className="text-sm font-medium">ETA</label>
                        <Input
                            id="eta"
                            name="eta"
                            type="datetime-local"
                            value={formData.eta}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Vessel</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 
export default DialogDemo