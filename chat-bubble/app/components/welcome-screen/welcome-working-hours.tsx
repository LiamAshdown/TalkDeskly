interface WelcomeWorkingHoursProps {
  isAvailable: boolean;
  nextOpeningTime: string;
}

export function WelcomeWorkingHours({
  isAvailable,
  nextOpeningTime,
}: WelcomeWorkingHoursProps) {
  return (
    <>
      <div className="bg-secondary border dark:bg-zinc-800 rounded-lg p-5 mb-6 flex flex-col">
        <h3 className="text-lg font-medium mb-1">
          {isAvailable ? "We are online" : "We are away at the moment"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isAvailable
            ? "Typically replies in a day"
            : `We will be back online ${nextOpeningTime}`}
        </p>
      </div>
    </>
  );
}
