import { Mail, MessageSquare } from "lucide-react";
import { ReminderEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export function ReminderStatus({ reminders }: { reminders: ReminderEvent[] }) {
  return (
    <ul className="space-y-3">
      {reminders.map((reminder) => (
        <li key={reminder.id} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mist text-blue">
              {reminder.channel === "email" ? (
                <Mail className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </span>
            <div>
              <p className="text-sm font-medium text-navy">{reminder.label}</p>
              <p className="text-xs text-navy/50">{reminder.timing}</p>
            </div>
          </div>

          {reminder.status === "sent" ? (
            <Badge tone="success">
              Sent{reminder.timestamp ? ` · ${formatDateTime(reminder.timestamp)}` : ""}
            </Badge>
          ) : (
            <Badge tone="info">Scheduled</Badge>
          )}
        </li>
      ))}
    </ul>
  );
}
