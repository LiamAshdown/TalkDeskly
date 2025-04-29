import type { WorkingHours } from "~/types/inbox";

export function isWithinWorkingHours(
  workingHours: Record<string, WorkingHours> | undefined
): boolean {
  if (!workingHours) {
    return false;
  }

  const now = new Date();
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentDay = days[now.getDay()];
  const dayConfig = workingHours[currentDay];

  if (!dayConfig || !dayConfig.enabled) {
    return false;
  }

  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMinute] = dayConfig.startTime.split(":").map(Number);
  const startTimeMinutes = startHour * 60 + startMinute;

  const [endHour, endMinute] = dayConfig.endTime.split(":").map(Number);
  const endTimeMinutes = endHour * 60 + endMinute;

  return currentTime >= startTimeMinutes && currentTime <= endTimeMinutes;
}

export function getNextOpeningTime(
  workingHours: Record<string, WorkingHours> | undefined
): string {
  if (!workingHours) {
    return "09:00 AM"; // Default fallback
  }

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const now = new Date();
  let currentDayIndex = now.getDay(); // 0 is Sunday
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Check today first if we haven't passed end time
  const todayConfig = workingHours[days[currentDayIndex]];
  if (todayConfig && todayConfig.enabled) {
    const [endHour, endMinute] = todayConfig.endTime.split(":").map(Number);
    const endTimeMinutes = endHour * 60 + endMinute;

    if (currentTime < endTimeMinutes) {
      // If current time is before today's end time, return today's start time
      const [startHour, startMinute] = todayConfig.startTime
        .split(":")
        .map(Number);
      if (currentTime < startHour * 60 + startMinute) {
        return formatTime(startHour, startMinute);
      }
    }
  }

  // Look for the next enabled day
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDayConfig = workingHours[days[nextDayIndex]];

    if (nextDayConfig && nextDayConfig.enabled) {
      const [startHour, startMinute] = nextDayConfig.startTime
        .split(":")
        .map(Number);
      let day =
        days[nextDayIndex].charAt(0).toUpperCase() +
        days[nextDayIndex].slice(1);

      // If the next day is tomorrow, return "tomorrow"
      if (nextDayIndex === (currentDayIndex + 1) % 7) {
        day = "tomorrow";
      }

      return `${day} at ${formatTime(startHour, startMinute)}`;
    }
  }

  return "09:00 AM"; // Default fallback if no enabled days found
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, "0");

  return `${displayHour}:${displayMinute} ${period}`;
}
