"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tabs Component
function TabsComponent({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <Tabs defaultValue="all" className="my-4" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="all" className="text-xs sm:text-sm px-1 sm:px-2">
          All
        </TabsTrigger>
        <TabsTrigger
          value="unassigned"
          className="text-xs sm:text-sm px-1 sm:px-2 truncate"
        >
          Unassigned
        </TabsTrigger>
        <TabsTrigger value="active" className="text-xs sm:text-sm px-1 sm:px-2">
          Active
        </TabsTrigger>
        <TabsTrigger value="closed" className="text-xs sm:text-sm px-1 sm:px-2">
          Closed
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default TabsComponent;
