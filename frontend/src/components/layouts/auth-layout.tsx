import { Outlet } from "react-router-dom";
import { LeftColumn } from "@/components/auth/left-column";
import { RightColumn } from "../auth/right-column";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Column - Slider */}
      <div className="md:w-1/2">
        <LeftColumn />
      </div>

      {/* Right Column - Form */}
      <div className="md:w-1/2">
        <RightColumn>
          <Outlet />
        </RightColumn>
      </div>
    </div>
  );
}
