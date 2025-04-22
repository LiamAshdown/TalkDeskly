import { Clock } from "lucide-react";
import type { Inbox } from "~/types/inbox";
import {
  isWithinWorkingHours,
  getNextOpeningTime,
} from "~/lib/utils/working-hours";

interface WelcomeHeaderProps {
  inboxData?: Inbox | null;
}

export function WelcomeHeader({ inboxData }: WelcomeHeaderProps) {
  // Check if the service is available based on working hours
  const isAvailable = isWithinWorkingHours(inboxData?.workingHours);
  const nextOpeningTime = getNextOpeningTime(inboxData?.workingHours);

  return (
    <div className="flex flex-col">
      {/* Welcome message */}
      <h2 className="text-2xl font-semibold mb-3">
        {inboxData?.welcomeMessage ? inboxData.welcomeMessage : "Hi there! 👋"}
      </h2>

      {/* Description */}
      <p className="text-muted-foreground mb-6">
        {inboxData?.description ||
          "We make it simple to connect with us. Feel free to ask us anything or share your feedback."}
      </p>

      {/* Status message */}
      <div
        className={`rounded-md p-4 mb-4 flex items-start gap-3 ${
          isAvailable
            ? "bg-green-50 border border-green-100"
            : "bg-blue-50 border border-blue-100"
        }`}
      >
        <Clock
          className={`h-5 w-5 mt-0.5 ${
            isAvailable ? "text-green-500" : "text-blue-500"
          }`}
        />
        <div>
          <p
            className={`font-medium text-sm ${
              isAvailable ? "text-green-700" : "text-blue-700"
            }`}
          >
            {isAvailable ? "We are online" : "We are away at the moment"}
          </p>
          <p
            className={`text-sm ${
              isAvailable ? "text-green-600" : "text-blue-600"
            }`}
          >
            {isAvailable
              ? "We typically respond in a few minutes"
              : inboxData?.outsideHoursMessage ||
                `We will be back online ${nextOpeningTime}`}
          </p>
        </div>
      </div>
    </div>
  );
}
