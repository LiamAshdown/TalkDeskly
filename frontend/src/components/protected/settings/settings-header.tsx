interface SettingsHeaderProps {
  title: string;
  description: string;
  showBackButton?: boolean;
}

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SettingsHeader({
  title,
  description,
  showBackButton = true,
}: SettingsHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
