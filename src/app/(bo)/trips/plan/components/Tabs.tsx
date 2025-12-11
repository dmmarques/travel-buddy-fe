import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const router = useRouter();

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "travel", label: "Travel" },
    { value: "accommodation", label: "Accommodation" },
    { value: "aiTab", label: "AI Buddy" },
    { value: "itinerary", label: "Itinerary" },
    { value: "budget", label: "Budget" },
  ];

  return (
    <div className="flex flex-row items-center border-b border-gray-200 px-4 md:px-8 pt-4">
      <Button variant="ghost" className="mr-2 md:mr-4" onClick={() => router.back()}>
        ← Back
      </Button>

      {/* Mobile/Tablet: Dropdown Select */}
      <div className="md:hidden ml-auto">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select tab" />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Horizontal Tabs */}
      <div className="hidden md:flex flex-row gap-4 ml-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant="ghost"
            className={`pb-2 px-4 rounded-none shadow-none border-b-2 transition-colors duration-150 ${
              activeTab === tab.value
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
