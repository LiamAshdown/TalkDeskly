import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomAlertProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "destructive";
  className?: string;
}

export function CustomAlert({
  icon: Icon,
  title,
  description,
  variant = "default",
  className,
}: CustomAlertProps) {
  return (
    <Alert
      variant={variant}
      className={cn(
        "flex items-start space-x-4",
        variant === "destructive" &&
          "bg-destructive/10 border-destructive text-destructive",
        className
      )}
    >
      <Icon className="h-5 w-5 mt-0.5" />
      <div>
        <AlertTitle className="text-lg">{title}</AlertTitle>
        <AlertDescription className="mt-2 text-base">
          {description}
        </AlertDescription>
      </div>
    </Alert>
  );
}
