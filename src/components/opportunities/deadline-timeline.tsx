// src/components/opportunities/deadline-timeline.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";
import { CalendarClock } from "lucide-react";

interface Deadline {
  label: string;
  date: string | null;
  type: string;
}

export function DeadlineTimeline({ deadlines }: { deadlines: Deadline[] }) {
  if (!deadlines || deadlines.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Deadlines</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No specific deadlines extracted.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Deadlines</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {deadlines.map((d, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">{d.label}</p>
              <p className="text-xs text-muted-foreground">
                {d.date ? formatDate(d.date) : "Date not specified"} · {d.type.replace("_", " ")}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

