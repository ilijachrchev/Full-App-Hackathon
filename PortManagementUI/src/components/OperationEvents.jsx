import { Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const events = [
    {
        id: "event-1",
        type: "arrival",
        vessel: "Diamond Cruiser",
        vesselId: "vessel-16",
        time: "7:57:05 PM",
        date: "5/19/2025",
    },
    {
        id: "event-2",
        type: "arrival",
        vessel: "Western Moon",
        vesselId: "vessel-13",
        time: "4:04:30 PM",
        date: "5/19/2025",
    },
    {
        id: "event-3",
        type: "arrival",
        vessel: "Royal Carrier",
        vesselId: "vessel-14",
        time: "2:43:54 PM",
        date: "5/18/2025",
    },
    {
        id: "event-4",
        type: "arrival",
        vessel: "Eastern Sun",
        vesselId: "vessel-12",
        time: "5:49:01 PM",
        date: "5/17/2025",
    },
    {
        id: "event-5",
        type: "arrival",
        vessel: "Northern Light",
        vesselId: "vessel-15",
        time: "4:32:17 PM",
        date: "5/17/2025",
    },
]

export function OperationEvents() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Operation Events</CardTitle>
                <CardDescription>Upcoming vessel arrivals and departures</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event.id} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center">
                                    <Badge className="bg-blue-500 hover:bg-blue-600">Arrival Scheduled</Badge>
                                    <time className="ml-auto text-sm text-muted-foreground">
                                        {event.date}, {event.time}
                                    </time>
                                </div>
                                <div className="mt-1">
                                    <span className="font-medium text-blue-600">{event.vessel}</span>
                                    <span className="text-sm text-muted-foreground"> ({event.vesselId})</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
export default OperationEvents