import { WelcomeWorkingHours } from "~/components/welcome-screen/welcome-working-hours";
import { Button } from "~/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import type { Inbox } from "~/types/inbox";

interface WelcomeScreenHelloProps {
  inboxData: Inbox;
  isAvailable: boolean;
  nextOpeningTime: string;
  isConnected: boolean;
  startConversation: () => void;
}

export function WelcomeScreenHello({
  inboxData,
  isAvailable,
  nextOpeningTime,
  isConnected,
  startConversation,
}: WelcomeScreenHelloProps) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Hi there! 👋</h2>
        <p className="text-muted-foreground">{inboxData?.welcomeMessage}</p>
      </div>

      <div className="bg-primary-foreground border dark:bg-zinc-800 rounded-lg p-5 mb-6 flex flex-col">
        <WelcomeWorkingHours
          isAvailable={isAvailable}
          nextOpeningTime={nextOpeningTime}
        />
      </div>
      <div className="mt-auto flex-grow flex items-end">
        <Button
          onClick={startConversation}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground flex items-center justify-between"
          disabled={!isConnected}
        >
          {!isConnected ? (
            <>
              <span>Connecting...</span>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              <span>Start Conversation</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </>
  );
}
